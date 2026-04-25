import { Link } from 'react-router'
import { Smartphone } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="relative border-t border-border bg-background/60 px-4 py-8 backdrop-blur-sm sm:px-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-wide text-primary">WAVEPLAY</span>
            <span className="text-xs text-text-muted">v{__APP_VERSION__}</span>
          </div>
          <span className="text-xs text-text-muted">&copy; 2026 WavePlay. Capas: TMDB.</span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
          <Link
            to="/download"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Smartphone size={14} />
            Baixar app
          </Link>
          <span className="cursor-pointer transition-colors hover:text-text">Sobre</span>
          <span className="cursor-pointer transition-colors hover:text-text">Termos</span>
          <span className="cursor-pointer transition-colors hover:text-text">Contato</span>
        </nav>
      </div>
    </footer>
  )
}
