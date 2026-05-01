import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronDown, Copy, Download } from 'lucide-react'
import type { AppVersion } from '../types/mobile-app'

interface VersionHistoryCardProps {
  version: AppVersion
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function VersionHistoryCard({ version }: VersionHistoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(version.downloadUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Browsers antigos sem Clipboard API — fallback silencioso
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-text">v{version.version}</p>
          <p className="mt-0.5 text-xs text-text-muted">{formatDate(version.publishedAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={version.downloadUrl}
            download
            className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-text transition-colors hover:bg-primary-light"
          >
            <Download size={14} />
            Baixar
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface/40 px-3 text-sm font-medium text-text-muted transition-colors hover:border-primary/30 hover:text-text cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-success" />
                Copiado
              </>
            ) : (
              <>
                <Copy size={14} />
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {version.releaseNotes && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text cursor-pointer"
          >
            <span>Novidades</span>
            <ChevronDown
              size={12}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="mt-2 whitespace-pre-line text-xs text-text-muted">
                  {version.releaseNotes}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
