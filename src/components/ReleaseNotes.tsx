import { parseReleaseNotes } from '../lib/release-notes'

interface ReleaseNotesProps {
  notes: string
  compact?: boolean
}

export function ReleaseNotes({ notes, compact = false }: ReleaseNotesProps) {
  const size = compact ? 'text-xs' : 'text-sm'

  return (
    <div className="space-y-3">
      {parseReleaseNotes(notes).map((block, i) => {
        if (block.kind === 'list') {
          return (
            <ul key={i} className={`list-disc space-y-1 pl-5 ${size} text-text-muted`}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          )
        }
        if (block.kind === 'title') {
          return (
            <p key={i} className={`${compact ? 'text-xs' : 'text-base'} font-semibold text-text`}>
              {block.text}
            </p>
          )
        }
        if (block.kind === 'heading') {
          return (
            <p key={i} className={`${size} font-medium text-text`}>
              {block.text}
            </p>
          )
        }
        return (
          <p key={i} className={`${size} text-text-muted`}>
            {block.text}
          </p>
        )
      })}
    </div>
  )
}
