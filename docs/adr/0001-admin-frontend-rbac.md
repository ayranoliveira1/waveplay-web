# ADR 0001 — RBAC client-side e UX-only, backend e autoridade

## Status

Accepted

## Context

As Tasks 15-19 adicionam um painel admin no web (`/admin/*`) que consome os
8 endpoints `/admin/*` do backend (Admin BC, Tasks 17-20 do waveplay-api).

O backend ja tem um sistema de RBAC simples baseado em um campo `role`
(`'user' | 'admin'`) no `User`, protegido por um `AdminGuard` + decorator
`@Admin()` (ver ADR 0003 do backend).

No frontend, precisamos decidir **como tratar o `role`** vindo do
`GET /account`. Duas abordagens foram consideradas:

1. **Role como autoridade client-side** — o guard `AdminRoute` bloqueia
   acesso e a aplicacao assume que isso e suficiente. Forms de admin tratam
   role como confiavel. Risco: qualquer usuario com acesso ao devtools pode
   sobrescrever `user.role = 'admin'` no React DevTools e burlar o guard.

2. **Role como hint de UX, backend como autoridade** — o guard existe
   **apenas** para evitar mostrar telas que causariam 403. Toda decisao
   real de autorizacao vive no backend (`AdminGuard` + `@Admin()` +
   `.strict()` nos DTOs). O client nunca confia no seu proprio estado
   para decidir se algo e permitido.

## Decision

Adotamos a **opcao 2 — role client-side e apenas UX**.

### Regras derivadas

- **`AdminRoute` guard** redireciona nao-admins para `/browse`. Sua funcao
  e evitar que um usuario comum veja uma tela quebrada por 403, nao
  "impedir acesso".

- **Link "Admin" na navbar** so aparece se `user.role === 'admin'`. Isso
  e puramente UX — esconder um botao que nao funcionaria.

- **Formularios do painel nunca enviam `role` no body.** `services/admin.ts`
  nao aceita `role` em nenhum dos 8 metodos. O tipo `CreateUserRequest`
  nao tem campo `role`. Mesmo que um desenvolvedor adicione `role` via
  hacks, o backend rejeita via Zod `.strict()`.

- **Toda chamada `/admin/*` e revalidada pelo backend.** O `AdminGuard`
  valida o JWT do request, nao o estado do frontend. Um usuario que
  manipule `user.role = 'admin'` via React DevTools consegue apenas **ver
  telas vazias** — os endpoints retornam 403 e o React Query mostra erro.

- **Slug de plano imutavel no UI** — espelhando a regra backend, o form
  de edicao nao tem campo slug. `UpdatePlanRequest` = `Partial<Omit<..., 'slug'>>`.

### Diferenca em relacao ao backend

O backend e a fonte de verdade; o frontend e defesa em profundidade:

| Camada | Responsabilidade | Mecanismo |
|--------|------------------|-----------|
| UI | Esconder elementos que dariam 403 | Link condicional na navbar |
| Router | Evitar renderizar paginas que dariam 403 | `AdminRoute` guard |
| Service | Nunca enviar dados sensiveis (role, slug em update) | Tipos TypeScript + ausencia no payload |
| Backend | **Autoridade** — valida toda chamada | `AdminGuard` + Zod `.strict()` |

## Consequences

### Positivas

- **Defesa em profundidade** — 4 camadas (UI, router, service, backend).
  Falha em uma nao compromete as outras.
- **Simplicidade** — nenhum esquema de permissions granulares no frontend.
  Role e um enum `'user' | 'admin'`, usado como `isAdmin` boolean.
- **Alinhado com ADR 0003 do backend** — mesma filosofia (RBAC simples,
  promocao via DB direto, nenhum endpoint para mudar role).
- **Testavel** — guards e services podem ser testados em isolamento sem
  mock de autenticacao complexo.
- **Codigo resiliente** — se o backend mudar a regra de autorizacao
  amanha (ex: adicionar role "moderator"), o frontend precisa de pouco
  trabalho: trocar o tipo e o guard.

### Negativas

- **Staleness ate o proximo refresh** — se um admin for rebaixado via
  `UPDATE users SET role = 'user' WHERE id = ...`, ele continua vendo o
  painel ate o access token expirar (15min) e o `/account` retornar o
  novo role. Backend ja retorna 403, entao o "acesso visual" e
  inofensivo — so mostra telas quebradas. Mitigacao: logout forcado via
  `/auth/logout-all` se houver necessidade imediata.

- **Dois lugares verificam role** — o `AdminRoute` guard e cada chamada
  de API. Aceito como trade-off: o guard evita ruido no console (403s
  poluindo) e melhora a experiencia; o backend garante a regra.

- **Desenvolvedores precisam lembrar da regra** — a tentacao de "confiar
  no client" existe. Mitigacoes: testes e-2-e que tentam forcar acesso
  via devtools, code review focado em payloads de admin, e este ADR.

## Alternativas consideradas

- **Permissions granulares (permissions-based)** — overkill para o escopo
  atual (2 roles). Seria relevante se/quando surgir uma 3a role como
  "moderator" ou "support". Reavaliar no futuro — ver ADR 0003 backend.

- **Claims JWT com permissions embutidas** — mesma rejeicao: overkill e
  cria acoplamento forte entre frontend e estrutura de permissions.

- **Server-side rendering com checagem de role** — o app e SPA puro,
  sem Next.js. Nao e uma opcao sem mudanca de stack significativa.

## Referencias

- [docs/architecture.md](../architecture.md) — secao "Painel Admin (RBAC)"
- [docs/business-rules.md](../business-rules.md) — secao 12 (Painel Admin)
- [docs/security-checklist.md](../security-checklist.md) — 19.14-19.18
- [waveplay-api/docs/adr/0003-admin-rbac-simple-role.md](../../../waveplay-api/docs/adr/0003-admin-rbac-simple-role.md) — ADR do backend (RBAC simples)
- [src/router/AdminRoute.tsx](../../src/router/AdminRoute.tsx) — implementacao do guard (Task 15)
- [src/services/admin.ts](../../src/services/admin.ts) — service layer sem `role` nos payloads (Task 15)
