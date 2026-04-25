import { Link } from 'react-router'
import { Smartphone } from 'lucide-react'

export function AppFooter() {
  return (
    <footer className="mt-12 hidden border-t border-border bg-background/40 px-4 py-6 sm:px-6 md:block md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Esquerda: brand + versao */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">WAVEPLAY</span>
          <span className="text-xs text-text-muted">v{__APP_VERSION__}</span>
        </div>

        {/* Centro/Direita: links */}
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
          <Link
            to="/download"
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Smartphone size={14} />
            Baixar app
          </Link>
          <span className="cursor-pointer transition-colors hover:text-text">
            Sobre
          </span>
          <span className="cursor-pointer transition-colors hover:text-text">
            Termos
          </span>
          <span className="cursor-pointer transition-colors hover:text-text">
            Contato
          </span>
        </nav>
      </div>
    </footer>
  )
}
