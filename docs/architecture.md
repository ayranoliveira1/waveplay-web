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
- **Player:** iframe (EmbedPlay)

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
│   │   └── ProfileRoute.tsx        # Guard: redireciona se sem perfil ativo
│   │
│   ├── layouts/
│   │   ├── RootLayout.tsx          # Outlet base
│   │   ├── AuthLayout.tsx          # Layout centralizado para auth pages
│   │   └── AppLayout.tsx           # Navbar + Outlet (paginas privadas)
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
│   │   ├── MovieDetailPage.tsx     # /browse/movie/:id
│   │   ├── SeriesDetailPage.tsx    # /browse/series/:id
│   │   ├── PlayerPage.tsx          # /watch/:type/:id
│   │   ├── SettingsPage.tsx        # /settings
│   │   ├── AccountPage.tsx         # /settings/account
│   │   ├── PlansPage.tsx           # /settings/plans
│   │   └── NotFoundPage.tsx        # 404
│   │
│   ├── components/                 # Componentes reutilizaveis
│   │   ├── MediaCard.tsx           # Card de filme/serie (poster)
│   │   ├── Carousel.tsx            # Lista horizontal generica
│   │   ├── ContinueWatchingCard.tsx # Card de "Continue Assistindo"
│   │   ├── EpisodeCard.tsx         # Card de episodio com progresso
│   │   ├── GenreChips.tsx          # Chips de genero
│   │   ├── HeroBanner.tsx          # Banner principal da Home
│   │   ├── RatingBadge.tsx         # Badge de avaliacao
│   │   ├── SeasonPicker.tsx        # Seletor de temporada
│   │   ├── SessionKilledOverlay.tsx # Overlay quando sessao e encerrada
│   │   ├── StreamConflictModal.tsx  # Modal de conflito de telas
│   │   ├── SubscriptionBanner.tsx   # Banner de assinatura sobre backdrop
│   │   └── ui/                     # Componentes UI primitivos
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Skeleton.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Autenticacao (user, signIn, signOut)
│   │   └── ProfileContext.tsx       # Perfil ativo (selecao, CRUD)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Acesso ao AuthContext
│   │   ├── useFavorites.ts         # CRUD favoritos (React Query)
│   │   ├── useHistory.ts           # Historico de reproducao
│   │   ├── useProgress.ts          # Progresso de reproducao
│   │   ├── useProfile.ts           # Acesso ao ProfileContext
│   │   ├── useSearchHistory.ts     # Historico de buscas (localStorage)
│   │   ├── useStream.ts            # Lifecycle de stream (start/ping/stop)
│   │   ├── useSubscription.ts      # Verificacao de assinatura ativa
│   │   └── useWatchlist.ts         # CRUD watchlist (React Query)
│   │
│   ├── services/
│   │   ├── api.ts                  # HTTP client com auto-refresh de token
│   │   ├── token-storage.ts        # Access token em memoria (let)
│   │   ├── catalog.ts              # Endpoints de catalogo (filmes, series)
│   │   ├── library.ts              # Endpoints de favoritos e watchlist
│   │   ├── playback.ts             # Endpoints de progresso e historico
│   │   ├── stream.ts               # Endpoints de stream (start/ping/stop)
│   │   ├── plans.ts                # Endpoint de planos
│   │   └── embedplay.ts            # Gerador de URL do player
│   │
│   ├── types/
│   │   ├── api.ts                  # Tipos do catalogo (Movie, Series, Episode, Plan, etc)
│   │   └── api-response.ts         # ApiResponse<T>, UserData, UserSubscription
│   │
│   ├── constants/
│   │   ├── api.ts                  # URLs base (API, TMDB images, EmbedPlay)
│   │   └── theme.ts                # Cores de perfil, helpers visuais
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
└── [ProtectedRoute + ProfileRoute guards]
    ├── AppLayout (com navbar)
    │   ├── /browse
    │   ├── /browse/movies
    │   ├── /browse/series
    │   ├── /browse/search
    │   ├── /browse/movie/:id
    │   ├── /browse/series/:id
    │   ├── /settings
    │   ├── /settings/account
    │   └── /settings/plans
    │
    └── /watch/:type/:id (sem navbar — fullscreen)
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
  └── Falha → chama onUnauthorized() → logout
  ↓
Response tipado: ApiResponse<T>
```

---

## Estado Global

### AuthContext (`contexts/AuthContext.tsx`)

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `user` | `UserData \| null` | Dados do usuario logado (inclui subscription) |
| `isAuthenticated` | `boolean` | Se tem usuario |
| `isLoading` | `boolean` | Restaurando sessao |
| `signIn()` | `function` | Login (email + senha) |
| `signOut()` | `function` | Logout (limpa access token da memoria) |

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

> A validacao real acontece no AuthContext via `GET /account` ao carregar o app.

---

## Player

O player usa `iframe` carregando uma URL do EmbedPlay:

1. `POST /streams/start` → obtem `streamId`
2. iframe carrega URL do EmbedPlay
3. Ping a cada 60s (`PUT /streams/:id/ping`)
4. Ao sair → `DELETE /streams/:id`
5. Se ping retorna 404 → sessao encerrada (outro dispositivo), mostra overlay

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
- Player: fullscreen em todas as telas
- Testar em 320px, 375px, 768px, 1024px, 1440px, 1920px
