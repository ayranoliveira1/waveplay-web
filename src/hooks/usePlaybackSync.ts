import { useEffect, useRef, useCallback } from 'react'
import { useProfile } from './useProfile'
import { useProgress } from './useProgress'
import { useHistory, type HistoryItem } from './useHistory'
import { API_BASE_URL } from '../constants/api'
import { getAccessToken } from '../services/token-storage'
import { capEstimated } from '../lib/player/progress'

const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes

interface UsePlaybackSyncParams {
  tmdbId: number
  type: 'movie' | 'series'
  title: string
  posterPath: string | null
  runtimeSeconds: number
  season?: number
  episode?: number
  isPlaying: boolean
  exact?: { progressSeconds: number; durationSeconds: number } | null
  flushOnUnmount?: boolean
}

export function usePlaybackSync({
  tmdbId,
  type,
  title,
  posterPath,
  runtimeSeconds,
  season,
  episode,
  isPlaying,
  exact = null,
  flushOnUnmount = false,
}: UsePlaybackSyncParams) {
  const { activeProfile } = useProfile()
  const { updateProgress, syncToApi, saveNow, getProgress } = useProgress()
  const { addToHistory } = useHistory()

  const startTimeRef = useRef(0)
  const previousProgressRef = useRef(0)
  const hasRecordedRef = useRef(false)
  const runtimeRef = useRef(0)
  const seasonRef = useRef<number | undefined>(undefined)
  const episodeRef = useRef<number | undefined>(undefined)
  const exactRef = useRef(exact)

  const profileId = activeProfile?.id

  useEffect(() => {
    exactRef.current = exact
  }, [exact])

  // Tempo exato (Vidsrc) vale como veio; o estimado pelo relógio para no teto de 90%.
  const calcProgress = useCallback(() => {
    const known = exactRef.current
    if (known) {
      return {
        progress: Math.floor(known.progressSeconds),
        duration: Math.floor(known.durationSeconds),
      }
    }
    const duration = runtimeRef.current
    if (startTimeRef.current === 0) return { progress: 0, duration }
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    return { progress: capEstimated(previousProgressRef.current + elapsed, duration), duration }
  }, [])

  const makeHistoryItem = useCallback(
    (progressSeconds?: number, durationSeconds?: number): HistoryItem => ({
      id: tmdbId,
      title,
      posterPath,
      type,
      watchedAt: new Date().toISOString(),
      lastSeason: seasonRef.current,
      lastEpisode: episodeRef.current,
      progressSeconds,
      durationSeconds,
    }),
    [tmdbId, type, title, posterPath],
  )

  // Start playback: record history + load previous progress
  useEffect(() => {
    if (!isPlaying || !profileId) return

    runtimeRef.current = runtimeSeconds
    seasonRef.current = season
    episodeRef.current = episode

    const prev = getProgress(tmdbId, type, season, episode)
    previousProgressRef.current = prev?.progressSeconds ?? 0
    startTimeRef.current = Date.now()

    if (!hasRecordedRef.current) {
      hasRecordedRef.current = true
      addToHistory(makeHistoryItem())
    }
  }, [
    isPlaying,
    profileId,
    tmdbId,
    type,
    runtimeSeconds,
    season,
    episode,
    getProgress,
    addToHistory,
    makeHistoryItem,
  ])

  // Periodic sync every 5 minutes
  useEffect(() => {
    if (!isPlaying || !profileId) return

    const interval = setInterval(() => {
      const { progress, duration } = calcProgress()
      updateProgress(tmdbId, type, progress, duration, seasonRef.current, episodeRef.current)
      addToHistory(makeHistoryItem(progress, duration))
      syncToApi()
    }, SYNC_INTERVAL)

    return () => clearInterval(interval)
  }, [
    isPlaying,
    profileId,
    tmdbId,
    type,
    calcProgress,
    updateProgress,
    addToHistory,
    makeHistoryItem,
    syncToApi,
  ])

  const flush = useCallback(() => {
    // Only flush if we had started before
    if (startTimeRef.current === 0) return
    const { progress, duration } = calcProgress()
    updateProgress(tmdbId, type, progress, duration, seasonRef.current, episodeRef.current)
    addToHistory(makeHistoryItem(progress, duration))
    saveNow()
    startTimeRef.current = 0
  }, [tmdbId, type, calcProgress, updateProgress, addToHistory, makeHistoryItem, saveNow])

  const flushRef = useRef(flush)
  useEffect(() => {
    flushRef.current = flush
  }, [flush])

  // Flush on stop
  useEffect(() => {
    if (!isPlaying) flushRef.current()
  }, [isPlaying])

  // Flush on unmount
  useEffect(() => {
    if (!flushOnUnmount) return
    return () => flushRef.current()
  }, [flushOnUnmount])

  // beforeunload — keepalive fetch
  useEffect(() => {
    if (!isPlaying || !profileId) return

    function handleBeforeUnload() {
      if (startTimeRef.current === 0) return
      const { progress, duration } = calcProgress()

      const token = getAccessToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      if (progress >= 0 && progress <= duration && duration > 0) {
        fetch(`${API_BASE_URL}/progress/${profileId}`, {
          method: 'PUT',
          keepalive: true,
          credentials: 'include',
          headers,
          body: JSON.stringify({
            tmdbId,
            type,
            season: seasonRef.current,
            episode: episodeRef.current,
            progressSeconds: progress,
            durationSeconds: duration,
          }),
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isPlaying, profileId, tmdbId, type, calcProgress])
}
