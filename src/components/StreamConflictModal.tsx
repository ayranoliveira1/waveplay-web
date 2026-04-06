import { useState } from 'react'
import { Monitor, Loader2 } from 'lucide-react'
import type { StreamConflictError } from '../types/api'

interface StreamConflictModalProps {
  conflict: StreamConflictError
  onKill: (streamId: string) => Promise<void>
  onRetry: () => void
  onClose: () => void
}

export function StreamConflictModal({
  conflict,
  onKill,
  onRetry,
  onClose,
}: StreamConflictModalProps) {
  const [killingId, setKillingId] = useState<string | null>(null)

  async function handleKill(streamId: string) {
    setKillingId(streamId)
    try {
      await onKill(streamId)
      onRetry()
    } catch {
      setKillingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <Monitor size={36} className="text-text-muted mb-3" />
          <h2 className="text-lg font-bold text-text">
            Limite de telas atingido
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Seu plano permite {conflict.maxStreams} tela
            {conflict.maxStreams !== 1 ? 's' : ''} simultânea
            {conflict.maxStreams !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {conflict.activeStreams.map((s) => (
            <div
              key={s.streamId}
              className="flex items-center justify-between gap-3 rounded-lg bg-background p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {s.title}
                </p>
                <p className="text-xs text-text-muted">{s.profileName}</p>
              </div>
              <button
                onClick={() => handleKill(s.streamId)}
                disabled={killingId !== null}
                className="shrink-0 h-8 px-4 rounded-lg bg-error/20 text-xs font-semibold text-error transition-colors hover:bg-error/30 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {killingId === s.streamId ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  'Encerrar'
                )}
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full h-10 rounded-lg bg-background font-semibold text-sm text-text-muted transition-colors hover:bg-background/80 cursor-pointer"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
