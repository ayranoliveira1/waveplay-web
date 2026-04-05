import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-7xl sm:text-8xl font-bold text-primary">404</h1>
      <p className="text-text-muted text-lg">Página não encontrada</p>
      <Link
        to="/"
        className="mt-4 h-12 px-8 rounded-lg bg-primary font-semibold text-sm text-text flex items-center justify-center transition-colors hover:bg-primary-light"
      >
        Voltar para home
      </Link>
    </div>
  )
}
