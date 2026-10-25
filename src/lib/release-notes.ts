export type ReleaseNotesBlock =
  | { kind: 'title' | 'paragraph' | 'heading'; text: string }
  | { kind: 'list'; items: string[] }

// As notas são digitadas com quebras a cada ~52 colunas: linhas soltas se juntam com espaço.
export function parseReleaseNotes(text: string): ReleaseNotesBlock[] {
  const blocks: ReleaseNotesBlock[] = []
  const chunks = text
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n\s*\n/)

  chunks.forEach((chunk, chunkIndex) => {
    const lines = chunk
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    let paragraph: string[] = []
    let list: string[] | null = null

    const flushParagraph = () => {
      if (paragraph.length > 0) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }

    for (const [i, line] of lines.entries()) {
      if (chunkIndex === 0 && i === 0 && line.startsWith('Atualização do WavePlay')) {
        blocks.push({ kind: 'title', text: line })
      } else if (line.startsWith('- ')) {
        flushParagraph()
        if (!list) {
          list = []
          blocks.push({ kind: 'list', items: list })
        }
        list.push(line.slice(2).trim())
      } else if (list) {
        list.push(`${list.pop()} ${line}`)
      } else if (line.endsWith(':') && lines[i + 1]?.startsWith('- ')) {
        flushParagraph()
        blocks.push({ kind: 'heading', text: line })
      } else {
        paragraph.push(line)
      }
    }
    flushParagraph()
  })

  return blocks
}
