import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { catalog } from '../services/catalog'
import { sources } from '../services/sources'
import { getPlayerUrl } from '../services/embedplay'
import { useSubscription } from '../hooks/useSubscription'
import { useProfile } from '../hooks/useProfile'
import { useProgress } from '../hooks/useProgress'
import { useStream } from '../hooks/useStream'
import { usePlaybackSync } from '../hooks/usePlaybackSync'
import { chooseSource } from '../lib/player/source-choice'
import { nextCardDue, nextEpisodeOf } from '../lib/player/next-episode'
import { withStartAt } from '../lib/player/vidsrc'
import { PlayerFrame } from '../components/player/PlayerFrame'
import { PlayerBar } from '../components/player/PlayerBar'
import { EpisodesPanel } from '../components/player/EpisodesPanel'
import { NextEpisodeCard } from '../components/player/NextEpisodeCard'
import { CastHelpModal } from '../components/player/CastHelpModal'
import { StreamConflictModal } from '../components/StreamConflictModal'
import { SessionKilledOverlay } from '../components/SessionKilledOverlay'
import type { EpisodeRef, PlayerSource, SourceChoice, VidsrcMessage } from '../types/player'

type MediaType = 'movie' | 'series'

// A escolha {audio, server} vale durante a sessão do navegador, como no app.
const SOURCE_CHOICE_KEY = 'wp:sourceChoice'
const BAR_VISIBLE_MS = 4000
const SOURCES_STALE_MS = 10 * 60 * 1000

const primaryButton =
  'h-10 px-6 rounded-lg bg-primary font-semibold text-sm text-text transition-colors hover:bg-primary-light cursor-pointer'
const secondaryButton =
  'h-10 px-6 rounded-lg bg-surface font-semibold text-sm text-text transition-colors hover:bg-surface/80 cursor-pointer'

function detailPathOf(type: MediaType, id: number) {
  return `/browse/${type}/${id}`
}

function readSourceChoice(): SourceChoice | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(SOURCE_CHOICE_KEY) ?? 'null')
    const validAudio = value?.audio === 'dublado' || value?.audio === 'legendado'
    return validAudio && typeof value.server === 'string' ? value : null
  } catch {
    return null
  }
}

function saveSourceChoice({ audio, server }: PlayerSource) {
  try {
    sessionStorage.setItem(SOURCE_CHOICE_KEY, JSON.stringify({ audio, server }))
  } catch {
    // sem sessionStorage a escolha vale só nesta tela
  }
}

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-text-muted" />
    </div>
  )
}

function Notice({ message, children }: { message: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm sm:text-base font-semibold text-text">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}

export function PlayerPage() {
  const params = useParams<{ id: string; season?: string; episode?: string }>()
  const { hasActiveSubscription } = useSubscription()
  const { isLoading: progressLoading } = useProgress()

  const id = Number(params.id)
  const type: MediaType = params.season === undefined ? 'movie' : 'series'
  const season = params.season === undefined ? undefined : Number(params.season)
  const episode = params.episode === undefined ? undefined : Number(params.episode)

  if (!hasActiveSubscription) return <Navigate to={detailPathOf(type, id)} replace />

  // O Vidsrc retoma do progresso salvo, lido uma vez ao montar a sessão.
  if (progressLoading) {
    return (
      <div className="relative h-dvh bg-black">
        <Spinner />
      </div>
    )
  }

  return (
    <PlayerSession
      key={`${type}-${id}-${season}-${episode}`}
      type={type}
      id={id}
      episode={season !== undefined && episode !== undefined ? { season, episode } : null}
    />
  )
}

interface PlayerSessionProps {
  type: MediaType
  id: number
  episode: EpisodeRef | null
}

function PlayerSession({ type, id, episode }: PlayerSessionProps) {
  const navigate = useNavigate()
  const { activeProfile } = useProfile()
  const { getProgress } = useProgress()
  const { streamId, sessionKilled, conflict, startStream, killRemoteStream, clearConflict } =
    useStream()

  const season = episode?.season
  const episodeNumber = episode?.episode
  const detailPath = detailPathOf(type, id)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ['catalog', 'movie', id],
    queryFn: async () => {
      const res = await catalog.getMovieDetail(id)
      return res.success ? res.data.movie : null
    },
    enabled: type === 'movie',
  })

  const { data: series, isLoading: seriesLoading } = useQuery({
    queryKey: ['catalog', 'series', id],
    queryFn: async () => {
      const res = await catalog.getSeriesDetail(id)
      return res.success ? res.data.series : null
    },
    enabled: type === 'series',
  })

  const { data: seasonEpisodes } = useQuery({
    queryKey: ['catalog', 'series', id, 'season', season],
    queryFn: async () => {
      const res = await catalog.getSeasonDetail(id, season!)
      return res.success ? res.data.episodes : []
    },
    enabled: type === 'series',
  })

  const {
    data: sourceList,
    isFetching: sourcesFetching,
    refetch: refetchSources,
  } = useQuery({
    queryKey: ['player', 'sources', type, id, season, episodeNumber],
    queryFn: async () => {
      const res = episode
        ? await sources.forEpisode(id, episode.season, episode.episode)
        : await sources.forMovie(id)
      return res.success ? res.data.sources : []
    },
    staleTime: (query) => (query.state.data?.length ? SOURCES_STALE_MS : 0),
  })

  const [today] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const next = useMemo(
    () =>
      season !== undefined && episodeNumber !== undefined && series && seasonEpisodes
        ? nextEpisodeOf({ season, episode: episodeNumber }, seasonEpisodes, series.seasons, today)
        : null,
    [season, episodeNumber, series, seasonEpisodes, today],
  )

  const { data: nextSeasonEpisodes } = useQuery({
    queryKey: ['catalog', 'series', id, 'season', next?.season],
    queryFn: async () => {
      const res = await catalog.getSeasonDetail(id, next!.season)
      return res.success ? res.data.episodes : []
    },
    enabled: next !== null,
  })
  const nextName = nextSeasonEpisodes?.find((e) => e.episodeNumber === next?.episode)?.name

  const [storedChoice] = useState(readSourceChoice)
  const [picked, setPicked] = useState<PlayerSource | null>(null)
  const list = useMemo(() => sourceList ?? [], [sourceList])
  const source = useMemo(
    () => picked ?? chooseSource(list, storedChoice),
    [picked, list, storedChoice],
  )

  const [resume] = useState(() => getProgress(id, type, season, episodeNumber))
  const src =
    source &&
    (source.reportsTime
      ? withStartAt(source.url, resume?.progressSeconds ?? 0, resume?.durationSeconds ?? null)
      : source.url)

  const name = movie?.title ?? series?.name ?? ''
  const runtimeMinutes = movie
    ? movie.runtime
    : seasonEpisodes?.find((e) => e.episodeNumber === episodeNumber)?.runtime
  // Sem duração no TMDB: 45 min por episódio, 120 min por filme.
  const runtimeSeconds = (runtimeMinutes || (type === 'series' ? 45 : 120)) * 60

  const [isPlaying, setIsPlaying] = useState(false)
  const [exact, setExact] = useState<{ progressSeconds: number; durationSeconds: number } | null>(
    null,
  )

  usePlaybackSync({
    tmdbId: id,
    type,
    title: name,
    posterPath: movie?.posterPath ?? series?.posterPath ?? null,
    runtimeSeconds,
    season,
    episode: episodeNumber,
    isPlaying,
    exact,
    flushOnUnmount: true,
  })

  const [streamFailed, setStreamFailed] = useState(false)
  const startedRef = useRef(false)

  const beginStream = useCallback(() => {
    if (!activeProfile || !name) return
    startStream({
      profileId: activeProfile.id,
      tmdbId: id,
      type,
      title: name,
      season,
      episode: episodeNumber,
    }).then((ok) => setStreamFailed(!ok))
  }, [activeProfile, name, startStream, id, type, season, episodeNumber])

  useEffect(() => {
    if (startedRef.current || !name) return
    startedRef.current = true
    beginStream()
  }, [name, beginStream])

  function retryStream() {
    clearConflict()
    setStreamFailed(false)
    beginStream()
  }

  const goBack = useCallback(() => {
    navigate(detailPath, { replace: true })
  }, [navigate, detailPath])

  const [barVisible, setBarVisible] = useState(true)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const hideBarLater = useCallback(() => {
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setBarVisible(false), BAR_VISIBLE_MS)
  }, [])

  const showBar = useCallback(() => {
    setBarVisible(true)
    hideBarLater()
  }, [hideBarLater])

  useEffect(() => {
    hideBarLater()
    return () => clearTimeout(hideTimerRef.current)
  }, [hideBarLater])

  const [focusedAt, setFocusedAt] = useState<number | null>(null)
  const [clockDue, setClockDue] = useState(false)
  const [vidsrcDue, setVidsrcDue] = useState(false)
  const [nextCancelled, setNextCancelled] = useState(false)
  const [episodesOpen, setEpisodesOpen] = useState(false)
  const [castOpen, setCastOpen] = useState(false)

  const handleFirstFocus = useCallback(() => {
    setIsPlaying(true)
    setFocusedAt(Date.now())
  }, [])

  // Fontes sem tempo: o fim é estimado pela duração do TMDB, contada a partir do 1º clique.
  // Sem duração conhecida não há card automático, só o "Próximo" da barra.
  const hasNext = next !== null
  useEffect(() => {
    if (focusedAt === null || !runtimeMinutes || !hasNext) return
    const timer = setInterval(() => {
      if (!nextCardDue((Date.now() - focusedAt) / 1000, runtimeMinutes * 60)) return
      setClockDue(true)
      clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [focusedAt, runtimeMinutes, hasNext])

  const handleVidsrc = useCallback(
    (msg: VidsrcMessage) => {
      if (msg.kind === 'ui') {
        if (msg.visible) showBar()
        return
      }
      if (msg.status === 'playing') setIsPlaying(true)
      setVidsrcDue(nextCardDue(msg.progress, msg.duration, msg.status))
      if (msg.duration > 0) {
        setExact({ progressSeconds: msg.progress, durationSeconds: msg.duration })
      }
    },
    [showBar],
  )

  // Cada fonte começa do zero: o relógio estimado volta a contar do 1º clique na nova.
  function selectSource(option: PlayerSource) {
    if (option === source) return
    saveSourceChoice(option)
    setPicked(option)
    setExact(null)
    setFocusedAt(null)
    setClockDue(false)
    setVidsrcDue(false)
  }

  // Trocar de episódio remonta a sessão (key); o flushOnUnmount grava o progresso antes.
  // A fonte segue a mesma pela escolha salva na sessão.
  const goToEpisode = useCallback(
    (to: EpisodeRef) => {
      navigate(`/watch/series/${id}/${to.season}/${to.episode}`, { replace: true })
    },
    [navigate, id],
  )

  const playNext = useCallback(() => {
    if (next) goToEpisode(next)
  }, [next, goToEpisode])

  const closeEpisodes = useCallback(() => setEpisodesOpen(false), [])
  const closeCast = useCallback(() => setCastOpen(false), [])

  function selectEpisode(to: EpisodeRef) {
    setEpisodesOpen(false)
    goToEpisode(to)
  }

  // Reserva: o embed antigo, com anúncios, numa aba nova; o relógio passa a contar daqui.
  function openInNewTab() {
    window.open(getPlayerUrl(id, type, season, episodeNumber), '_blank', 'noopener,noreferrer')
    setIsPlaying(true)
  }

  const toggleFullscreen = document.fullscreenEnabled
    ? () => {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
        else containerRef.current?.requestFullscreen().catch(() => {})
      }
    : undefined

  const nextDue = source?.reportsTime ? vidsrcDue : clockDue
  const showNextCard = nextDue && !nextCancelled && !episodesOpen && !!streamId && !sessionKilled

  const titleMissing = type === 'movie' ? !movieLoading && !movie : !seriesLoading && !series
  if (titleMissing) return <Navigate to={detailPath} replace />

  let content: ReactNode
  if (sessionKilled) {
    content = null
  } else if (!streamId) {
    content =
      streamFailed && !conflict ? (
        <Notice message="Não foi possível iniciar a reprodução">
          <button type="button" onClick={retryStream} className={primaryButton}>
            Tentar de novo
          </button>
        </Notice>
      ) : (
        <Spinner />
      )
  } else if (source && src) {
    content = (
      <PlayerFrame
        key={src}
        source={source}
        src={src}
        onFirstFocus={handleFirstFocus}
        onVidsrc={handleVidsrc}
        tmdbId={id}
        episode={episode}
      />
    )
  } else if (sourcesFetching) {
    content = <Spinner />
  } else {
    content = (
      <Notice message="Não foi possível carregar as fontes">
        <button type="button" onClick={() => refetchSources()} className={primaryButton}>
          Tentar de novo
        </button>
        <button type="button" onClick={openInNewTab} className={secondaryButton}>
          Abrir em nova aba
        </button>
      </Notice>
    )
  }

  return (
    <div ref={containerRef} className="relative h-dvh w-full overflow-hidden bg-black">
      {content}

      <PlayerBar
        title={episode ? `${name} · T${episode.season}:E${episode.episode}` : name}
        visible={barVisible}
        sources={list}
        current={source}
        onActivity={showBar}
        onBack={goBack}
        onSelectSource={selectSource}
        onCast={() => setCastOpen(true)}
        onEpisodes={episode ? () => setEpisodesOpen(true) : undefined}
        onNext={episode ? playNext : undefined}
        nextDisabled={!next}
        onFullscreen={toggleFullscreen}
      />

      {next && showNextCard && (
        <NextEpisodeCard
          title={`Próximo episódio: T${next.season}:E${next.episode} ${nextName ?? ''}`.trim()}
          onCancel={() => setNextCancelled(true)}
          onPlay={playNext}
        />
      )}

      {episodesOpen && series && episode && (
        <EpisodesPanel
          seriesId={id}
          seasons={series.seasons}
          current={episode}
          today={today}
          onSelect={selectEpisode}
          onClose={closeEpisodes}
        />
      )}

      <CastHelpModal open={castOpen} onClose={closeCast} />

      {sessionKilled && <SessionKilledOverlay onClose={goBack} />}

      {conflict && (
        <StreamConflictModal
          conflict={conflict}
          onKill={killRemoteStream}
          onRetry={retryStream}
          onClose={goBack}
        />
      )}
    </div>
  )
}
