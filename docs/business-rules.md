# WavePlay — Regras de Negocio (Backend + Web)

---

## 1. Planos

### Models envolvidos: `Plan`, `User`

| Regra | Descricao |
|-------|-----------|
| Todo usuario deve ter um plano | Ao registrar, o user recebe o plano padrao (Basico) |
| Plano define limite de perfis | `plan.maxProfiles` controla quantos perfis o user pode criar |
| Plano define limite de telas | `plan.maxStreams` controla quantas reproducoes simultaneas |
| Planos inativos nao podem ser assinados | `plan.active = false` impede novas assinaturas mas nao afeta quem ja tem |

### Planos iniciais

| Plano | Slug | Perfis | Telas | Preco |
|-------|------|--------|-------|-------|
| Basico | basico | 1 | 1 | R$ 0 (free) |
| Padrao | padrao | 3 | 2 | R$ 19,90 |
| Premium | premium | 5 | 4 | R$ 39,90 |

---

## 1.1. Subscription Gate (Bloqueio no Web)

### Contexto: Verificacao de assinatura no app web

| Regra | Descricao |
|-------|-----------|
| Navegacao livre | Usuario sem assinatura pode navegar pelo catalogo normalmente |
| Bloqueio no detalhe | Telas de MovieDetail e SeriesDetail bloqueiam o botao "Assistir" |
| Banner sobre backdrop | Banner clicavel sobre a imagem principal indica necessidade de assinar |
| Clique no banner | Navega direto para a tela de Planos |
| Episodios bloqueados | Em series, clicar no episodio nao navega ao Player |

### Condicoes de bloqueio

| Condicao | Descricao |
|----------|-----------|
| `user.subscription === null` | Usuario sem assinatura |
| `subscription.endsAt !== null && endsAt < now` | Assinatura vencida |
| `subscription.endsAt === null` | Sem expiracao (assinatura valida) |

### Mensagens do banner

| Estado | Mensagem |
|--------|----------|
| Sem assinatura | "Assine um plano para assistir" |
| Assinatura vencida | "Sua assinatura expirou. Renove para continuar assistindo" |

### Hook `useSubscription`

```
canWatch = subscription !== null && !isExpired
isExpired = subscription.endsAt !== null && new Date(endsAt) < new Date()
```

---

## 2. Autenticacao

### Models envolvidos: `User`, `RefreshToken`

| Regra | Descricao |
|-------|-----------|
| Email unico | Nao pode existir dois usuarios com o mesmo email |
| Senha minima 8 caracteres | Validacao no register via Zod |
| Senha salva com Argon2id | Parametros: memoryCost=65536 (64MB), timeCost=3, parallelism=1 |
| Access token expira em 15 minutos | JWT stateless, validado pela assinatura |
| Refresh token expira em 48 horas | Salvo como SHA-256 no banco |
| Refresh token e single-use | Ao usar, o token atual e revogado e um novo e gerado |
| Rotacao por family | Cada login cria uma nova family. Refresh herda a mesma family |
| Deteccao de roubo | Se um token revogado for reutilizado → revogar TODOS os tokens da family |
| Multiplos dispositivos permitidos | Cada login cria uma sessao (family) independente |
| Account lockout | 5 tentativas falhas de login → conta bloqueada por 30min (contador em Redis com TTL) |
| Rate limit no refresh | Max 10 requests de refresh por minuto por IP |
| Transporte do refresh token (web) | Sem header `X-Platform` → refresh token em httpOnly cookie (Secure, SameSite=Strict, Path=/auth) |
| Logout geral | POST /auth/logout-all revoga todas as families do usuario |

### Fluxo de autenticacao

```
Register → cria user + hash senha + plano Basico → retorna tokens
Login    → verifica lockout → valida email + argon2 verify → gera family → retorna tokens
Refresh  → valida hash do token → revoga atual → gera novo com mesma family
Logout   → revoga todos tokens da family
Logout-all → revoga TODAS as families do user
```

### Transporte de tokens (Web)

```
Web (padrao, sem header X-Platform):
  Response body: { accessToken }
  Response cookie: Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/auth
  Browser envia cookie automaticamente no /auth/refresh
  Access token armazenado em variavel JS na memoria (nunca localStorage)
```

### Password Reset

| Regra | Descricao |
|-------|-----------|
| Token por email | POST /auth/forgot-password envia email com token de reset |
| Token curto | Expira em 15 minutos, single-use |
| Salvo como hash | Token salvo como SHA-256 no banco (igual refresh token) |
| Reset efetivo | POST /auth/reset-password valida token → atualiza senha → revoga TODAS as families |

---

## 3. Perfis

### Models envolvidos: `Profile`, `User`, `Plan`

| Regra | Descricao |
|-------|-----------|
| Limite de perfis por plano | `COUNT(profiles) < user.plan.maxProfiles` para criar novo |
| Primeiro perfil automatico | Ao registrar, cria perfil com o nome do user automaticamente |
| Nome obrigatorio | Perfil precisa ter nome (min 1 caractere) |
| Perfil infantil | `isKid = true` pode futuramente filtrar conteudo adulto |
| Delecao em cascata | Deletar perfil remove seus favoritos, watchlist, progresso e historico |
| Perfil nao pode ser deletado se for o ultimo | User deve ter pelo menos 1 perfil |

---

## 4. Controle de Telas Simultaneas

### Models envolvidos: `ActiveStream`, `User`, `Plan`

| Regra | Descricao |
|-------|-----------|
| Limite por plano | `COUNT(active_streams WHERE lastPing > 2min atras) < user.plan.maxStreams` |
| Heartbeat obrigatorio | Player envia ping a cada 60 segundos |
| Timeout de 2 minutos | Stream sem ping ha 2 minutos e considerada inativa |
| Uma stream por perfil | Cada perfil so pode ter 1 reproducao ativa (`@@unique([userId, profileId])`) |
| Limpeza automatica | Cron job remove streams com lastPing > 2 minutos |

### Fluxo de reproducao

```
1. App chama POST /streams/start { profileId, tmdbId, type, title }
2. Backend conta streams ativas do user (lastPing > 2min atras)
3. Se count >= plan.maxStreams → 409 com lista de streams ativas
4. Se ok → cria/atualiza ActiveStream → retorna streamId
5. Player chama PUT /streams/:id/ping a cada 60s
6. Ao sair do player → DELETE /streams/:id
7. Se tab fechar inesperadamente → stream expira sozinha apos 2min sem ping
8. Se ping retorna 404 → sessao foi encerrada por outro dispositivo
```

### Quando o limite e atingido (409 Conflict)

```
Web mostra modal com lista de streams ativas:
  "Voce atingiu o limite de X telas simultaneas"
  [Stream 1 - titulo] [Encerrar]
  [Stream 2 - titulo] [Encerrar]

Ao encerrar uma stream → retry automatico do start
```

### Sessao encerrada (404 no ping)

```
Web mostra overlay fullscreen:
  "Sua sessao foi encerrada em outro dispositivo"
  [Voltar] → navigate(-1) ou navigate('/browse')
```

---

## 5. Favoritos

### Models envolvidos: `Favorite`, `Profile`

| Regra | Descricao |
|-------|-----------|
| Vinculado ao perfil | Cada perfil tem seus proprios favoritos |
| Toggle (add/remove) | Se ja e favorito, remove. Se nao e, adiciona |
| Unicidade por perfil + tmdb + type | Mesmo conteudo nao pode ser favoritado duas vezes no mesmo perfil |
| Sem limite de quantidade | Usuario pode favoritar quantos quiser |

---

## 6. Watchlist (Assistir Depois)

### Models envolvidos: `WatchlistItem`, `Profile`

| Regra | Descricao |
|-------|-----------|
| Vinculado ao perfil | Cada perfil tem sua propria watchlist |
| Toggle (add/remove) | Mesmo comportamento dos favoritos |
| Unicidade por perfil + tmdb + type | Sem duplicatas |
| Sem limite de quantidade | Sem restricao |
| Independente dos favoritos | Pode estar na watchlist E nos favoritos ao mesmo tempo |

---

## 7. Progresso de Reproducao

### Models envolvidos: `Progress`, `Profile`

| Regra | Descricao |
|-------|-----------|
| Vinculado ao perfil | Cada perfil tem seu proprio progresso |
| Upsert | Se ja existe progresso para o conteudo, atualiza. Se nao, cria |
| Debounce em memoria | Web salva progresso em memoria a cada 5 segundos (nao a cada frame) |
| Sync periodico | Web envia progresso para API a cada 5 minutos (backup contra crash) |
| Flush ao sair | Web salva progresso imediatamente na API ao sair do player |
| Identificacao por conteudo | Filme: `tmdbId + type`. Serie: `tmdbId + type + season + episode` |
| Continue watching | Conteudo com progresso > 0% e < 90% aparece em "Continue Assistindo" |
| Conteudo assistido | Progresso >= 90% da duracao e considerado "assistido" |

---

## 8. Historico

### Models envolvidos: `HistoryItem`, `Profile`

| Regra | Descricao |
|-------|-----------|
| Vinculado ao perfil | Cada perfil tem seu proprio historico |
| Adicionado ao iniciar reproducao | Registra quando o user comeca a assistir |
| Atualiza se ja existe | Se assistir de novo o mesmo conteudo, atualiza o watchedAt |
| Limite de 50 itens por perfil | Os mais antigos sao removidos quando exceder |
| Limpar historico | User pode limpar todo o historico do perfil |
| Ordenado por data | Mais recente primeiro |

---

## 9. Catalogo (Proxy TMDB)

### Sem model — dados vem do TMDB via proxy

| Regra | Descricao |
|-------|-----------|
| Token TMDB no backend | Web nunca acessa TMDB direto. Todas as chamadas passam pela API |
| Cache Redis | Respostas do TMDB sao cacheadas para reduzir latencia e requests |
| TTL do cache por tipo | Trending: 1h, Detail: 24h, Search: 30min |
| Idioma pt-BR | Todas as chamadas ao TMDB usam `language=pt-BR` |
| Fallback sem cache | Se Redis estiver fora, busca direto do TMDB (sem cache) |

---

## 10. Regras Gerais

| Regra | Descricao |
|-------|-----------|
| Rate limiting | Max 10 requests por minuto por IP nos endpoints: login, refresh, forgot-password, reset-password |
| Todas as rotas protegidas | Exceto: register, login, refresh, forgot-password, reset-password |
| Ownership de perfil | Toda operacao com profileId valida que `profile.userId === auth.userId` |
| Response padronizado | `{ success: boolean, data?: T, error?: E[] }` |
| Soft delete de refresh tokens | Nunca hard delete — manter para auditoria de seguranca |
| Cascata nas delecoes | Deletar user → deleta profiles → deleta favoritos, watchlist, progresso, historico |
| UUIDs como ID | Todos os models usam UUID v7 (ordenavel por tempo, gerado no app via `uuidv7`) |

---

## 11. Seguranca

### HTTPS & Headers

| Regra | Descricao |
|-------|-----------|
| HTTPS obrigatorio | Producao deve forcar HTTPS. HTTP redireciona para HTTPS |
| HSTS | Header `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| Helmet | Ativado com configuracao customizada |
| CSP | `Content-Security-Policy: default-src 'self'` |
| X-Frame-Options | `DENY` — previne clickjacking |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |

### CORS

| Regra | Descricao |
|-------|-----------|
| Origens explicitas | Lista de dominios permitidos (nao usar `*`) |
| Credentials | `true` — necessario para envio de cookies httpOnly |
| Methods | `GET, POST, PUT, PATCH, DELETE` |
| Allowed headers | `Authorization, Content-Type, X-Platform` |

### Token Storage (Web)

| Token | Storage | Motivo |
|-------|---------|--------|
| Access Token | Variavel JS em memoria (`let`) | Curto (15min), nunca em localStorage/sessionStorage |
| Refresh Token | httpOnly cookie (Secure, SameSite=Strict) | Gerenciado pelo backend via Set-Cookie, enviado automaticamente pelo browser |

### Audit Logging

| Evento | Log |
|--------|-----|
| Login falho | IP, email tentado, timestamp |
| Account lockout | IP, email, duracao do bloqueio |
| Theft detection | Family afetada, IP do request suspeito |
| Token revogado | Motivo (logout, refresh, theft), family |
| Password reset solicitado | Email, IP |

---

## 12. Painel Admin (Web)

### Models envolvidos: `User`, `Plan`, `Subscription`

O painel admin (`/admin/*`) consome 8 endpoints do backend sob o Admin
Bounded Context. Todas as regras aqui espelham o backend — a autoridade
final e o `AdminGuard` do backend, que retorna 403 para qualquer chamada
`/admin/*` sem `role === 'admin'`.

### 12.1. Acesso e autorizacao

| Regra | Descricao |
|-------|-----------|
| Role obrigatoria | Rota `/admin/*` so acessivel a usuarios com `user.role === 'admin'` |
| Guard client-side | `AdminRoute` verifica o role e redireciona para `/browse` se nao for admin |
| Autoridade final no backend | Mesmo com o role manipulado no client, toda chamada `/admin/*` retorna 403 se o JWT nao for admin |
| Link na navbar | O link "Admin" no `AppLayout` so aparece se `user?.role === 'admin'` |
| Origem do role | `user.role` vem exclusivamente do `GET /account` — nunca manipulado ou persistido client-side |
| Promocao a admin | Nao ha endpoint para promover — promocao e via UPDATE direto no DB (ADR 0003 backend) |

### 12.2. Dashboard (`GET /admin/analytics`)

| Regra | Descricao |
|-------|-----------|
| Endpoint unico | Uma chamada retorna dois blocos: `overview` (snapshot atual) e `period` (filtrado por datas, default 30 dias) |
| Overview | Total de usuarios, assinaturas ativas, streams ativos, receita mensal estimada (centavos), assinaturas por plano, distribuicao de perfis, perfis por tipo (kids/normal) |
| Period | Registros por dia, crescimento acumulado, usuarios ativos, top 10 conteudos, streams por hora, total de sessoes, duracao media (segundos) |
| Filtro de datas | Query params opcionais `startDate` e `endDate` (YYYY-MM-DD). Default: ultimos 30 dias |
| Cache | React Query com `staleTime: 60_000` — sem polling |
| Revalidacao | Apenas em refocus da aba (comportamento default do React Query) |

### 12.3. Gerenciamento de usuarios

| Regra | Descricao |
|-------|-----------|
| Listagem paginada | `GET /admin/users?page=&limit=&search=` — paginacao client com `keepPreviousData` |
| Busca debounced | Campo de busca com debounce de 300ms |
| Detalhes do usuario | `GET /admin/users/:id` — retorna dados + assinatura atual |
| Criacao de usuario | Form **nao** aceita campo `role` — backend rejeita via Zod `.strict()`. Campo `endsAt` opcional |
| Senha no form | Validacao client: minimo 8 caracteres. Backend revalida e aplica Argon2id |
| Editar dados | `PATCH /admin/users/:id` via `EditUserModal` — apenas `name` e `email`. Role **nunca** editavel |
| Alterar plano | Form envia `planId` e `endsAt` opcional. Backend pode retornar `warning` se downgrade causar perfis acima do limite do novo plano |
| Exibir warning | Se `response.data.warning` vier preenchido, exibir banner amarelo no UI |
| Role read-only | Detalhe mostra role como badge, nunca editavel no UI |
| Badge "Inativo" | Usuarios com `active === false` exibidos com badge cinza + linha com opacity reduzida |

#### 12.3.1. Duracao de subscription (endsAt)

| Regra | Descricao |
|-------|-----------|
| Campo opcional | `endsAt` em `CreateUserModal` e `UpdateSubscriptionModal` |
| Default null | Checkbox "Sem data de termino" marcado por default quando `endsAt === null` |
| Date picker condicional | Desmarcar o checkbox revela `react-day-picker` para selecionar data futura |
| Componente reusavel | `src/components/ui/SubscriptionEndsAtField.tsx` |
| Feedback visual | Detalhes do usuario exibem "Sem termino" quando null, ou data formatada quando presente |

#### 12.3.2. Desativar / Ativar usuario (soft delete + reativacao)

| Regra | Descricao |
|-------|-----------|
| Acao na tabela | Menu "⋯" alterna entre "Desativar" e "Ativar" baseado em `user.active` |
| Confirmacao | `ConfirmDialog variant=warning` — desativar encerra sessoes ativas; ativar restabelece login |
| Endpoints | `PATCH /admin/users/:id/deactivate` e `PATCH /admin/users/:id/activate` |
| Invalidation | `['admin','users']` + `['admin','users',id]` + `['admin','dashboard']` |
| Efeito desativar | Revoga todos os refresh tokens + deleta todas as active streams do usuario |
| Efeito ativar | Apenas reativa flag `active`; nao restaura tokens nem subscription cancelada |
| Idempotente | Ambas acoes retornam 200 mesmo se estado ja for o pedido |
| Admin protegido | Item aparece **disabled com tooltip** ("Nao e permitido desativar/ativar um administrador") quando `role === 'admin'` |

#### 12.3.3. Deletar usuario (hard delete)

| Regra | Descricao |
|-------|-----------|
| Acao na tabela | Menu "⋯" com item "Deletar" em vermelho |
| Pre-requisito | Item **disabled** quando `user.active === true`. Tooltip: "Desative o usuario antes de excluir" |
| Admin protegido | Item **disabled** tambem para `role === 'admin'` (tooltip: "Nao e permitido deletar um administrador") |
| Confirmacao | `ConfirmDialog variant=danger` — "Deletar usuario permanentemente? Esta acao nao pode ser desfeita" |
| Endpoint | `DELETE /admin/users/:id` |
| Navegacao | Se deletar a partir do detail page, redireciona para `/admin/users` apos sucesso |
| Erro 409 | Se backend retornar 409, toast com mensagem do backend e refetch |

#### 12.3.4. Remover plano do usuario (cancelar subscription)

| Regra | Descricao |
|-------|-----------|
| Onde | `UpdateSubscriptionModal` tem botao "Remover plano" no rodape (vermelho) |
| Confirmacao | `ConfirmDialog variant=warning` — "Remover plano de <nome>? O usuario ficara sem plano ativo" |
| Endpoint | `DELETE /admin/users/:id/subscription` |
| Invalidation | `['admin','users']` + `['admin','users',id]` |

### 12.4. Gerenciamento de planos

| Regra | Descricao |
|-------|-----------|
| Criar plano | `POST /admin/plans` — form com todos os campos |
| Editar plano | `PATCH /admin/plans/:id` — form **sem** campo slug (imutavel) |
| Slug imutavel | Uma vez criado, o slug nao pode ser alterado (quebraria URLs e associacoes) |
| Ativar/desativar | `PATCH /admin/plans/:id/toggle` — assinaturas existentes continuam ativas, apenas novas sao bloqueadas |
| Confirmacao no toggle | Modal de confirmacao mostra: "Assinaturas existentes continuam ativas" |
| Exibir `usersCount` | Card do plano mostra "X assinaturas vinculadas" (conta **todas** as assinaturas — ativas, canceladas e expiradas — retornado por `GET /admin/plans`) |

#### 12.4.1. Exclusao de plano — logica explicita

A UI decide entre "Desativar" e "Excluir" baseado em `usersCount`. Semantica do backend (Task 28): o gate e **estrito** — `usersCount` conta qualquer assinatura (inclusive canceladas/expiradas) e `DELETE` so e permitido quando o count e zero. Historico bloqueia exclusao — planos que ja tiveram usuarios so podem ser **desativados**.

| Estado | Botoes renderizados |
|--------|--------------------|
| `usersCount > 0` | "Editar" + "Desativar" / "Ativar" — **sem botao Excluir**. Texto auxiliar: "Remova todas as assinaturas vinculadas (inclusive historicas) para poder excluir" |
| `usersCount === 0 && plan.active` | "Editar" + "Desativar" + "Excluir" |
| `usersCount === 0 && !plan.active` | "Editar" + "Ativar" + "Excluir" |

| Regra | Descricao |
|-------|-----------|
| Endpoint | `DELETE /admin/plans/:id` — apenas quando `usersCount === 0` |
| Confirmacao | `ConfirmDialog variant=danger` — titulo `Excluir plano "<nome>"?` + "Esta acao e permanente e nao pode ser desfeita" |
| Erro 409 | Se backend retornar `PlanHasSubscriptionsError` (usersCount mudou entre fetch e delete), toast com mensagem do backend + refetch automatico da lista |
| Invalidation | `['admin','plans']` + `['admin','dashboard']` |
| Feedback no card | Plano sem assinaturas exibe "Nenhuma assinatura vinculada" em verde suave; com assinaturas exibe contagem em cinza neutro |

### 12.5. Validacao Zod (espelha backend)

| Campo | Regra |
|-------|-------|
| `name` | `string().min(2)` |
| `slug` | `string().regex(/^[a-z0-9-]+$/)` — apenas letras minusculas, numeros, hifens |
| `priceCents` | `number().int().nonnegative()` |
| `maxProfiles` | `number().int().min(1)` |
| `maxStreams` | `number().int().min(1)` |
| `description` | `string().min(1)` |

### 12.6. Payload sanitization (seguranca)

| Regra | Descricao |
|-------|-----------|
| Nenhum campo `role` nos payloads | `services/admin.ts` nunca envia `role` — nem em create, nem em update |
| Nenhum campo `slug` em PATCH plano | `UpdatePlanRequest = Partial<Omit<CreatePlanRequest, 'slug'>>` |
| Validacao client + server | Zod no client para feedback rapido; Zod `.strict()` no backend como autoridade |
