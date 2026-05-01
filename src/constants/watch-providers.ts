export interface WatchProvider {
  id: number
  slug: string
  name: string
  title: string
}

export const WATCH_PROVIDERS: readonly WatchProvider[] = [
  { id: 8, slug: 'netflix', name: 'Netflix', title: 'Disponível na Netflix' },
  {
    id: 337,
    slug: 'disney-plus',
    name: 'Disney+',
    title: 'Disponível no Disney+',
  },
  { id: 1899, slug: 'max', name: 'Max', title: 'Disponível na Max' },
  {
    id: 119,
    slug: 'prime-video',
    name: 'Prime Video',
    title: 'Disponível no Prime Video',
  },
] as const
