import { useEffect, useRef } from 'react'
import { isForCurrentTitle, parseVidsrcMessage } from '../../lib/player/vidsrc'
import type { EpisodeRef, PlayerSource, VidsrcMessage } from '../../types/player'

const VIDSRC_ORIGIN = 'https://vidsrc.sh'
// Nunca allow-popups nem allow-top-navigation: é o que segura as abas de anúncio.
const SOURCE_SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-presentation'

interface PlayerFrameProps {
  source: PlayerSource
  src: string
  onFirstFocus(): void
  onVidsrc(msg: VidsrcMessage): void
  tmdbId: number
  episode: EpisodeRef | null
}

export function PlayerFrame({
  source,
  src,
  onFirstFocus,
  onVidsrc,
  tmdbId,
  episode,
}: PlayerFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const focusedRef = useRef(false)

  // O iframe engole o clique; o blur da janela com o foco no iframe é o 1º clique no player.
  useEffect(() => {
    if (source.reportsTime) return

    function handleBlur() {
      if (focusedRef.current || document.activeElement !== iframeRef.current) return
      focusedRef.current = true
      onFirstFocus()
    }

    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [source.reportsTime, onFirstFocus])

  // Só vale o Vidsrc deste iframe e do título/episódio atual; anúncios e outros quadros também postam.
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== VIDSRC_ORIGIN || event.source !== iframeRef.current?.contentWindow) {
        return
      }
      const msg = parseVidsrcMessage(event.data)
      if (msg && isForCurrentTitle(msg, tmdbId, episode)) onVidsrc(msg)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [tmdbId, episode, onVidsrc])

  return (
    <iframe
      key={src}
      ref={iframeRef}
      src={src}
      title={source.label}
      className="absolute inset-0 h-full w-full border-0"
      sandbox={source.sandbox ? SOURCE_SANDBOX : undefined}
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="origin"
    />
  )
}
