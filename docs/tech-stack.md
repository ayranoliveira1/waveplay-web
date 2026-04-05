# WavePlay Web — Tech Stack

## Runtime & Linguagem

| Tech | Versao | Uso |
|------|--------|-----|
| React | 19.x | Biblioteca de UI |
| TypeScript | ~5.9 | Linguagem |
| Vite | 7.x | Build tool + dev server |
| pnpm | 10.x | Gerenciador de pacotes |

---

## Roteamento

| Tech | Versao | Uso |
|------|--------|-----|
| react-router | ^7.x | SPA routing (createBrowserRouter) |

---

## Estado & Data Fetching

| Tech | Versao | Uso |
|------|--------|-----|
| @tanstack/react-query | ^5.x | Cache de servidor, fetching, invalidacao |
| React Context | built-in | Estado global (auth, perfil ativo) |

---

## Estilizacao

| Tech | Versao | Uso |
|------|--------|-----|
| Tailwind CSS | ^4.x | Framework de classes utilitarias |
| @tailwindcss/vite | ^4.x | Plugin Vite para Tailwind |

---

## Formularios & Validacao

| Tech | Versao | Uso |
|------|--------|-----|
| react-hook-form | ^7.x | Gerenciamento de formularios |
| @hookform/resolvers | ^5.x | Integracao com Zod |
| zod | ^4.x | Validacao de schemas (login, register, perfil) |

---

## UI & Icones

| Tech | Versao | Uso |
|------|--------|-----|
| lucide-react | ^0.x | Icones SVG (tree-shakeable) |
| motion | ^12.x | Animacoes leves (~5kb, Framer Motion lite) |

---

## HTTP & Seguranca

| Tech | Versao | Uso |
|------|--------|-----|
| Fetch API | built-in | HTTP client customizado com interceptors |
| credentials: include | - | Envio automatico de cookies httpOnly |

---

## Player

| Tech | Uso |
|------|-----|
| iframe | Player de video (EmbedPlay) |

---

## Dev & Tooling

| Tech | Versao | Uso |
|------|--------|-----|
| eslint | ^10.x | Linting |
| @typescript-eslint/eslint-plugin | ^8.x | Regras TypeScript para ESLint |
| @typescript-eslint/parser | ^8.x | Parser TypeScript para ESLint |
| eslint-plugin-react | ^7.x | Regras React |
| eslint-plugin-react-hooks | ^7.x | Regras de hooks |
| prettier | ^3.x | Formatacao de codigo |

---

## Variaveis de Ambiente

```env
# API
VITE_API_BASE_URL=http://localhost:3333

# TMDB Images (CDN publica, sem token)
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

# Player
VITE_EMBED_PLAY_BASE_URL=https://embedplay.example.com
```

> **Nota:** O token do TMDB fica apenas no backend. O web acessa imagens via CDN publica e o catalogo via proxy da API. Variaveis expostas ao client usam prefixo `VITE_` e sao acessiveis via `import.meta.env.VITE_*`.

---

## Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint src/",
  "lint:fix": "eslint src/ --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
}
```

---

## Padroes Obrigatorios

| Padrao | Descricao |
|--------|-----------|
| **TypeScript strict** | `strict: true` no tsconfig. Nunca `any`, usar `unknown` + type guards |
| **Props tipadas** | Toda prop de componente com interface explicita |
| **Componentizacao** | Componentes pequenos, focados, reutilizaveis. Composicao sobre heranca |
| **Mobile-first** | Estilos base para mobile, breakpoints para expandir (`sm:`, `md:`, `lg:`, `xl:`) |
| **Responsividade total** | De 320px (celulares pequenos) ate 1920px+ (monitores grandes) |
| **Barrel exports** | `index.ts` em cada pasta de componentes |
| **Hooks para logica** | Separar logica de negocio em hooks, componentes focam em UI |
