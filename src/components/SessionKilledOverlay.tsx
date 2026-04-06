import { Tv } from 'lucide-react'

interface SessionKilledOverlayProps {
  onClose: () => void
}

export function SessionKilledOverlay({ onClose }: SessionKilledOverlayProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <Tv size={48} className="text-text-muted" />
        <h2 className="text-lg sm:text-xl font-bold text-text">
          Sessão encerrada
        </h2>
        <p className="text-sm text-text-muted max-w-sm">
          Alguém iniciou uma reprodução em outro dispositivo e sua sessão foi
          encerrada.
        </p>
        <button
          onClick={onClose}
          className="mt-2 h-10 px-6 rounded-lg bg-surface font-semibold text-sm text-text transition-colors hover:bg-surface/80 cursor-pointer"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
