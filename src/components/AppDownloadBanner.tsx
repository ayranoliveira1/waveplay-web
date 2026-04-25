import { useState } from 'react'
import { Link } from 'react-router'
import { Smartphone, X } from 'lucide-react'

const STORAGE_KEY = 'waveplay:app-banner-dismissed'

function readInitialVisibility(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) !== 'true'
}

export function AppDownloadBanner() {
  const [visible, setVisible] = useState(readInitialVisibility)

  if (!visible) return null

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  return (
    <div className="bg-primary/15 border-b border-primary/20">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link
          to="/download"
          className="flex items-center gap-2 text-sm text-text hover:text-primary transition-colors"
        >
          <Smartphone size={16} className="text-primary" />
          <span>
            <span className="font-semibold">Conheca o app WavePlay</span>
            <span className="hidden sm:inline text-text-muted">
              {' '}
              — baixe agora para Android
            </span>
          </span>
          <span className="text-primary font-medium">→</span>
        </Link>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar"
          className="flex h-7 w-7 items-center justify-center rounded text-text-muted transition-colors hover:bg-text/10 hover:text-text cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
