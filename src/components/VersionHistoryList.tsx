import type { AppVersion } from '../types/mobile-app'
import { VersionHistoryCard } from './VersionHistoryCard'

interface VersionHistoryListProps {
  versions: AppVersion[]
}

export function VersionHistoryList({ versions }: VersionHistoryListProps) {
  if (versions.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold text-text">Versões anteriores</h2>
      <div className="space-y-3">
        {versions.map((v) => (
          <VersionHistoryCard key={v.version} version={v} />
        ))}
      </div>
    </section>
  )
}
