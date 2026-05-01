# WavePlay Web — Arquitetura

## Stack

- **Build:** Vite
- **Linguagem:** TypeScript
- **Roteamento:** React Router v7 (createBrowserRouter)
- **Estado server:** TanStack React Query
- **Estado local:** React Context (AuthContext, ProfileContext)
- **Estilizacao:** Tailwind CSS v4
- **HTTP Client:** Fetch API com interceptor customizado (`services/api.ts`)
- **Token Storage:** Access token em memoria (variavel JS), refresh token em httpOnly cookie
- **Validacao:** Zod + React Hook Form
- **Icones:** Lucide React
- **Player:** window.open (EmbedPlay em nova aba)

---

## Estrutura de Pastas

```
waveplay-web/
├── index.html                      # Entry point Vite
├── vite.config.ts                  # Config Vite + plugins
├── tsconfig.json
├── .env                            # Variaveis de ambiente (VITE_*)
│
├── docs/                           # Documentacao do projeto
├── tasks/                          # Task files padronizados
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                    # Entry point React (providers)
│   ├── App.tsx                     # RouterProvider
│   ├── globals.css                 # Tailwind + tema dark
│   │
│   ├── router/
│   │   ├── index.tsx               # createBrowserRouter (todas as rotas)
│   │   ├── ProtectedRoute.tsx      # Guard: redireciona se nao autenticado
│   │   ├── PublicRoute.tsx         # Guard: redireciona se ja autenticado
│   │   ├── ProfileRoute.tsx        # Guard: redireciona se sem perfil ativo
│   │   └── AdminRoute.tsx          # Guard: exige user.role === 'admin'
│   │
│   ├── layouts/
│   │   ├── RootLayout.tsx          # Outlet base
│   │   ├── AuthLayout.tsx          # Layout centralizado para auth pages
│   │   ├── AppLayout.tsx           # Navbar + Outlet (paginas privadas)
│   │   └── AdminLayout.tsx         # Navbar simplificada do painel admin
│   │
│   ├── pages/                      # Paginas (uma por rota)
│   │   ├── LandingPage.tsx         # / (publica)
│   │   ├── LoginPage.tsx           # /auth/login
│   │   ├── RegisterPage.tsx        # /auth/register
│   │   ├── ForgotPasswordPage.tsx  # /auth/forgot-password
│   │   ├── ResetPasswordPage.tsx   # /auth/reset-password
│   │   ├── ProfileSelectionPage.tsx # /profiles
│   │   ├── ProfileFormPage.tsx     # /profiles/new, /profiles/:id/edit
│   │   ├── HomePage.tsx            # /browse
│   │   ├── MoviesPage.tsx          # /browse/movies
│   │   ├── SeriesPage.tsx          # /browse/series
│   │   ├── SearchPage.tsx          # /browse/search
│   │   ├── MovieDetailPage.tsx     # /browse/movie/:id (player via window.open)
│   │   ├── SeriesDetailPage.tsx    # /browse/series/:id (player via window.open)
│   │   ├── SettingsPage.tsx        # /settings
│   │   ├── AccountPage.tsx         # /settings/account
│   │   ├── PlansPage.tsx           # /settings/plans
│   │   ├── ChangePasswordPage.tsx  # /settings/password (logado, valida currentPassword)
│   │   ├── NotFoundPage.tsx        # 404
│   │   ├── admin/                  # Painel admin (/admin/*)
│   │   │   ├── AdminDashboardPage.tsx      # /admin (metricas)
│   │   │   ├── AdminUsersPage.tsx          # /admin/users (lista + acoes na linha)
│   │   │   ├── AdminUserDetailPage.tsx     # /admin/users/:id (detalhe + acoes)
│   │   │   ├── AdminPlansPage.tsx          # /admin/plans (CRUD + delete condicional)
│   │   │   ├── AdminAppVersionsPage.tsx    # /admin/app-versions (CRUD versoes APK)
│   │   │   └── components/                 # Modais e forms compartilhados
│   │   │       ├── CreateUserModal.tsx           # inclui SubscriptionEndsAtField
│   │   │       ├── EditUserModal.tsx             # edita name/email
│   │   │       ├── UpdateSubscriptionModal.tsx   # inclui endsAt + botao Remover plano
│   │   │       ├── PlanFormModal.tsx
│   │   │       └── CreateAppVersionModal.tsx     # multi-step XHR upload pro R2
│   │   │
│   │   └── DownloadPage.tsx        # /download (publica — APK Android + iOS em breve + QR + historico)
│   │
│   ├── components/                 # Componentes reutilizaveis
│   │   ├── MediaCard.tsx           # Card de filme/serie (poster)
│   │   ├── Carousel.tsx            # Lista horizontal generica
│   │   ├── EpisodeCard.tsx         # Card de episodio
│   │   ├── GenreChips.tsx          # Chips de genero
│   │   ├── HeroBanner.tsx          # Banner principal da Home
│   │   ├── RatingBadge.tsx         # Badge de avaliacao
│   │   ├── SeasonPicker.tsx        # Seletor de temporada
│   │   ├── SessionKilledOverlay.tsx # Overlay quando sessao e encerrada
│   │   ├── StreamConflictModal.tsx  # Modal de conflito de telas
│   │   ├── SubscriptionBanner.tsx   # Banner de assinatura sobre backdrop
│   │   ├── VersionHistoryCard.tsx   # Card compacto de versao antiga (DownloadPage)
│   │   ├── VersionHistoryList.tsx   # Lista de versoes anteriores (DownloadPage)
│   │   └── ui/                     # Componentes UI primitivos
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Skeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ConfirmDialog.tsx           # Modal de confirmacao (danger/warning)
│   │       ├── DropdownMenu.tsx            # Menu "⋯" para acoes de linha
│   │       └── SubscriptionEndsAtField.tsx # Checkbox + date picker para endsAt
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Autenticacao (user, signIn, signOut)
│   │   └── ProfileContext.tsx       # Perfil ativo (selecao, CRUD)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Acesso ao AuthContext
│   │   ├── useFavorite.ts          # Toggle favorito com optimistic update (React Query)
│   │   ├── useProfile.ts           # Acesso ao ProfileContext
│   │   ├── useSearchHistory.ts     # Historico de buscas (localStorage)
│   │   ├── useStream.ts            # Lifecycle de stream (start/ping/stop)
│   │   ├── useSubscription.ts      # Verificacao de assinatura ativa
│   │   └── useWatchlist.ts         # Toggle watchlist com optimistic update (React Query)
│   │
│   ├── services/
│   │   ├── api.ts                  # HTTP client com auto-refresh de token
│   │   ├── token-storage.ts        # Access token em memoria (let)
│   │   ├── catalog.ts              # Endpoints de catalogo (filmes, series)
│   │   ├── library.ts              # Endpoints de favoritos e watchlist
│   │   ├── stream.ts               # Endpoints de stream (start/ping/stop)
│   │   ├── plans.ts                # Endpoints publicos de planos
│   │   ├── playback.ts             # Endpoints de progresso e historico
│   │   ├── embedplay.ts            # Gerador de URL do player
│   │   ├── auth.ts                 # PATCH /auth/password (change password do user logado)
│   │   ├── app-version.ts          # GET /app/version (current) + GET /app/versions (historico)
│   │   └── admin.ts                # Endpoints admin (dashboard, users, plans)
│   │
│   ├── types/
│   │   ├── api.ts                  # Tipos do catalogo (Movie, Series, Episode, Plan, etc)
│   │   ├── api-response.ts         # ApiResponse<T>, UserData (inclui role), UserSubscription
│   │   └── admin.ts                # Tipos do painel admin (AdminUser, AdminPlan, DashboardAnalytics)
│   │
│   ├── constants/
│   │   ├── api.ts                  # URLs base (API, TMDB images, EmbedPlay)
│   │   ├── theme.ts                # Cores de perfil, helpers visuais
│   │   └── watch-providers.ts      # IDs TMDB BR dos streamings (Netflix, Disney+, Max, Prime)
│   │
│   └── lib/
│       └── query-client.ts         # Configuracao do QueryClient
```

---

## Mapa de Rotas

```
Router (createBrowserRouter)
│
├── / (LandingPage — publica)
│
├── [PublicRoute guard]
│   └── AuthLayout
│       ├── /auth/login
│       ├── /auth/register
│       ├── /auth/forgot-password
│       └── /auth/reset-password
│
├── [ProtectedRoute guard]
│   ├── /profiles
│   ├── /profiles/new
│   └── /profiles/:id/edit
│
├── [ProtectedRoute + ProfileRoute guards]
│   └── AppLayout (com navbar)
│       ├── /browse
│       ├── /browse/movies
│       ├── /browse/series
│       ├── /browse/search
│       ├── /browse/movie/:id    (player inline substitui backdrop)
│       ├── /browse/series/:id   (player inline substitui backdrop)
│       ├── /settings
│       ├── /settings/account
│       ├── /settings/plans
│       └── /settings/password   (form de alterar senha — valida currentPassword)
│
└── [ProtectedRoute + AdminRoute guards]  (nao passa por ProfileRoute)
    └── AdminLayout
        ├── /admin                    (Dashboard com metricas)
        ├── /admin/users              (listagem paginada + modal de criacao)
        ├── /admin/users/:id          (detalhe + update subscription)
        └── /admin/plans              (CRUD de planos)
```

---

## Fluxo de Dados

```
Page / Hook
    ↓
Service (api.ts — fetch com interceptor)
    ↓
API Backend (NestJS)
    ↓
Response: { success: boolean, data?: T, error?: E[] }
    ↓
React Query (cache, invalidacao, retry)
    ↓
UI (re-render automatico)
```

### Interceptor de Token (`services/api.ts`)

```
Request
  ↓
Adiciona Authorization: Bearer <accessToken> (da memoria)
Adiciona credentials: 'include' (envia cookies)
  ↓
Se 401 → tenta refresh com POST /auth/refresh (cookie vai automatico)
  ├── Sucesso → salva novo accessToken na memoria → retry do request original
  ├── Falha → chama onUnauthorized() → logout
  └── Race condition: refreshPromise singleton com 1s delay antes de limpar
      (evita "Token theft detected" quando multiplos 401 chegam quase junto)
  ↓
Response tipado: ApiResponse<T>
```

---

## Estado Global

### AuthContext (`contexts/AuthContext.tsx`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `user` | `UserData \| null` | Dados do usuario logado (inclui `role` e `subscription`) |
| `isAuthenticated` | `boolean` | Se tem usuario |
| `isLoading` | `boolean` | Restaurando sessao |
| `signIn()` | `function` | Login (email + senha) |
| `signOut()` | `function` | Logout (limpa access token da memoria) |

> **Fluxo de hidratacao do `user`**: `/auth/login` e `/auth/register` retornam
> apenas `{ accessToken }`. Apos salvar o token, o `AuthContext` sempre chama
> `GET /account`, que retorna o `UserData` completo (incluindo `role`). O mesmo
> acontece em `restoreSession` no boot do app. Ver `AccountPresenter` no backend.

### ProfileContext (`contexts/ProfileContext.tsx`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `activeProfile` | `Profile \| null` | Perfil selecionado |
| `profiles` | `Profile[]` | Lista de perfis do usuario |
| `isLoading` | `boolean` | Carregando perfis |
| `selectProfile()` | `function` | Selecionar perfil ativo |
| `clearProfile()` | `function` | Limpar selecao |

---

## Comunicacao com Backend

O web consome a API WavePlay (NestJS) que segue DDD com bounded contexts:

| BC no Backend | Uso no Web |
|---------------|------------|
| Identity | Login, registro, refresh token, forgot password |
| Profile | Selecao e CRUD de perfis |
| Catalog | Trending, listas, detalhes, busca (proxy TMDB) |
| Library | Favoritos e watchlist por perfil |
| Playback | Progresso e historico por perfil |
| Subscription | Planos disponiveis, controle de streams |

---

## Padrao de Response da API

Todas as rotas retornam:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Em caso de erro:

```json
{
  "success": false,
  "data": [],
  "error": [
    { "message": "Credenciais invalidas.", "path": ["email"] }
  ]
}
```

---

## Token Storage (Web)

| Token | Storage | Motivo |
|-------|---------|--------|
| Access Token | Variavel JS em memoria (`let`) | Curto (15min), nunca em localStorage/sessionStorage |
| Refresh Token | httpOnly cookie (Secure, SameSite=Strict) | Gerenciado pelo backend, enviado automaticamente pelo browser |

### Diferenca do Mobile

| | Mobile | Web |
|-|--------|-----|
| Access Token | `expo-secure-store` | Variavel JS em memoria |
| Refresh Token | `expo-secure-store` | httpOnly cookie |
| Header | `X-Platform: mobile` | Nenhum (default web) |
| Fetch | sem credentials | `credentials: 'include'` |

---

## Protecao de Rotas

Sem middleware server-side (SPA puro). Protecao via componentes wrapper no router:

- **ProtectedRoute** — verifica `isAuthenticated` do AuthContext. Se false → redirect `/auth/login`
- **PublicRoute** — verifica `isAuthenticated`. Se true → redirect `/profiles` ou `/browse`
- **ProfileRoute** — verifica `activeProfile` do ProfileContext. Se null → redirect `/profiles`
- **AdminRoute** — verifica `user?.role === 'admin'` do AuthContext. Se false → redirect `/browse`

> A validacao real acontece no AuthContext via `GET /account` ao carregar o app.

---

## Painel Admin (RBAC)

O painel admin fica em `/admin/*` e e protegido pelo guard `AdminRoute` que
verifica `user.role === 'admin'`. O campo `role` vem do backend via
`GET /account` (ja carregado pelo AuthContext — ver secao Fluxo de hidratacao).

### Principio de seguranca

> **A autoridade real esta no backend.** O guard `AdminRoute` serve apenas para
> UX (evitar mostrar telas que causariam 403). Toda chamada a `/admin/*` e
> validada pelo `AdminGuard` do backend; manipular o role no client nao da
> acesso a nada — os endpoints retornam 403. Ver [docs/adr/0001-admin-frontend-rbac.md](./adr/0001-admin-frontend-rbac.md).

### Navbar condicional

O link "Admin" no `AppLayout` so aparece se `user?.role === 'admin'`. Nao
existe UI para promover usuarios — promocao e exclusiva via DB direto
(ver ADR 0003 do backend).

### Rotas

```
/admin                    → AdminDashboardPage    (GET /admin/dashboard/analytics)
/admin/users              → AdminUsersPage        (GET /admin/users + POST + PATCH + DELETE)
/admin/users/:id          → AdminUserDetailPage   (GET /admin/users/:id + PATCH/DELETE + subscription)
/admin/plans              → AdminPlansPage        (POST, PATCH, PATCH toggle, DELETE condicional)
/admin/app-versions       → AdminAppVersionsPage  (presigned upload R2, set-current, DELETE)
/download                 → DownloadPage          (publica — sem auth, GET /app/versions; current destacada + historico)
```

### Componentes reusaveis destrutivos

O painel admin usa tres componentes reutilizaveis para padronizar acoes
destrutivas e campos compartilhados:

- **`ConfirmDialog`** (`components/ui/ConfirmDialog.tsx`): modal de confirmacao
  com variantes `danger` (delete — botao vermelho) e `warning` (deactivate —
  botao amarelo/laranja). Usado em desativar/deletar usuario, remover plano do
  usuario e excluir plano. Focus default no botao Cancelar (fail-safe).
- **`DropdownMenu`** (`components/ui/DropdownMenu.tsx`): menu "⋯" nas linhas da
  tabela de usuarios. Suporta items com `variant: 'danger'` e `disabled` com
  tooltip. Navegacao por teclado + fecha ao clicar fora.
- **`SubscriptionEndsAtField`** (`components/ui/SubscriptionEndsAtField.tsx`):
  campo composto com checkbox "Sem data de termino" + `react-day-picker`
  revelado ao desmarcar. Usado em `CreateUserModal` e `UpdateSubscriptionModal`.

### Decisoes de design

- **Sem campo `role` em nenhum form** — backend rejeita via Zod `.strict()`,
  mas o cliente tambem nao envia (defesa em profundidade)
- **Slug de plano imutavel** — form de edicao nao tem campo slug
- **Deletar plano e condicional** — botao "Excluir" so aparece quando
  `usersCount === 0` (retornado por `GET /admin/plans`). Se ha usuarios
  vinculados, apenas "Desativar" e oferecido, com texto auxiliar explicando
  porque
- **Deletar usuario exige duas etapas** — botao "Deletar" fica disabled ate o
  usuario ser desativado (via acao separada). Frontend reforca a regra do
  backend que retorna 409 para hard delete de usuario ativo
- **Admin nao depende de perfil ativo** — a hierarquia de rotas pula o `ProfileRoute`
- **Admin protegido contra auto-acao** — itens "Desativar" e "Deletar" nao
  aparecem para linhas de usuarios com `role === 'admin'` (backend tambem
  rejeita com 403, mas UI esconde para evitar tentativa)

---

## Player (window.open — Nova Aba)

O player abre em **nova aba** via `window.open()`. A pagina de detalhe (MovieDetailPage / SeriesDetailPage) gerencia o ciclo de vida da stream e mostra um overlay "Reproduzindo em outra aba" enquanto o player esta aberto.

> **Por que nao iframe?** O EmbedPlay detecta embedding via iframe (`window.top !== window.self`) e bloqueia com "ACESSO NAO AUTORIZADO". A solucao `window.open()` e equivalente ao WebView do mobile.

### Fluxo

1. Usuario clica "Assistir" na detail page
2. `POST /streams/start` → obtem `streamId`
3. `window.open(url, '_blank')` abre o EmbedPlay em nova aba
4. Overlay "Reproduzindo em outra aba" aparece sobre o backdrop
5. Ping a cada 60s (`PUT /streams/:id/ping`)
6. Polling a cada 1s detecta se a aba do player foi fechada
7. Ao fechar aba/navegar → `DELETE /streams/:id`
8. Se ping retorna 404 → `SessionKilledOverlay` sobre o backdrop

### Controles

- Botao "Parar reproducao": fecha a aba do player e para a stream
- `SessionKilledOverlay`: renderizado sobre o backdrop
- `StreamConflictModal`: modal overlay na pagina (antes do player abrir)

### Cleanup

- `useEffect` cleanup: `stopStream()` ao desmontar componente
- `beforeunload` event: `fetch(DELETE, keepalive: true)` ao fechar a tab principal
- Polling (`setInterval` 1s): detecta `playerWindowRef.current?.closed` → para stream

---

## Subscription Gate

Usuarios sem assinatura ativa podem navegar, mas:

- Botao "Assistir" fica desabilitado (icone de cadeado)
- Banner sobre o backdrop indica necessidade de assinar
- Clicar no banner → navega para tela de Planos
- Hook `useSubscription` centraliza a logica (`canWatch`, `isExpired`)

---

## Padroes de Desenvolvimento

### Componentizacao & Reutilizacao

- **Componentes pequenos e focados** — cada componente tem uma unica responsabilidade
- **Reutilizacao maxima** — componentes como `MediaCard`, `Carousel`, `Button`, `Input` devem ser genéricos e reutilizaveis em qualquer pagina
- **Props tipadas** — toda prop com interface/type explicito, nunca `any`
- **Composicao sobre heranca** — preferir children, render props ou hooks para compartilhar logica
- **Barrel exports** — `index.ts` em cada pasta de componentes para imports limpos
- **Separacao UI vs logica** — hooks encapsulam logica, componentes focam na apresentacao

### Tipagem Rigorosa

- **TypeScript strict** — `strict: true` no tsconfig.json
- **Interfaces para props** — toda prop de componente tipada com interface
- **Tipos da API centralizados** — todos em `src/types/` (api.ts, api-response.ts)
- **Generics no api client** — `api.get<T>(path)` retorna `ApiResponse<T>`
- **Nunca `any`** — usar `unknown` quando tipo nao e conhecido, narrow com type guards
- **Enums como union types** — `type MediaType = 'movie' | 'series'` ao invés de enum

### Mobile-First & Responsividade

O app deve ser **totalmente responsivo**, funcionando desde os menores celulares (320px) ate monitores ultrawide.

**Abordagem mobile-first com Tailwind:**

```
// Base = mobile → sm: → md: → lg: → xl: → 2xl:
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
```

**Breakpoints de referencia:**

| Breakpoint | Largura | Contexto |
|------------|---------|----------|
| Base | 0-639px | Celulares pequenos e medios |
| `sm:` | 640px+ | Celulares grandes / landscape |
| `md:` | 768px+ | Tablets |
| `lg:` | 1024px+ | Laptops |
| `xl:` | 1280px+ | Desktops |
| `2xl:` | 1536px+ | Monitores grandes |

**Regras:**

- Escrever estilos base para mobile, usar breakpoints para expandir
- Grid de MediaCards: 2 colunas no mobile, escala ate 6 em telas grandes
- Carousel: scroll horizontal em mobile, setas de navegacao em desktop
- Navbar: compacta em mobile (hamburger ou bottom nav), expandida em desktop
- HeroBanner: texto menor e posicionamento ajustado em mobile
- Formularios: full-width em mobile, max-width centralizado em desktop
- Player: abre em nova aba via window.open, detail page mostra overlay "Reproduzindo"
- Testar em 320px, 375px, 768px, 1024px, 1440px, 1920px
