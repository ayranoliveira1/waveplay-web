import { useEffect, useRef, useCallback } from 'react'
import { useProfile } from './useProfile'
import { useProgress } from './useProgress'
import { useHistory, type HistoryItem } from './useHistory'
import { API_BASE_URL } from '../constants/api'
import { getAccessToken } from '../services/token-storage'

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
}: UsePlaybackSyncParams) {
  const { activeProfile } = useProfile()
  const { updateProgress, syncToApi, saveNow, getProgress } = useProgress()
  const { addToHistory } = useHistory()

  const startTimeRef = useRef(0)
  const previousProgressRef = useRef(0)
  const hasRecordedRef = useRef(false)

  const profileId = activeProfile?.id

  const calcProgress = useCallback(() => {
    if (startTimeRef.current === 0) return 0
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
    return Math.min(previousProgressRef.current + elapsed, runtimeSeconds)
  }, [runtimeSeconds])

  const makeHistoryItem = useCallback(
    (progressSeconds?: number, durationSeconds?: number): HistoryItem => ({
      id: tmdbId,
      title,
      posterPath,
      type,
      watchedAt: new Date().toISOString(),
      lastSeason: season,
      lastEpisode: episode,
      progressSeconds,
      durationSeconds,
    }),
    [tmdbId, type, title, posterPath, season, episode],
  )

  // Start playback: record history + load previous progress
  useEffect(() => {
    if (!isPlaying || !profileId) return

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
      const progress = calcProgress()
      updateProgress(tmdbId, type, progress, runtimeSeconds, season, episode)
      addToHistory(makeHistoryItem(progress, runtimeSeconds))
      syncToApi()
    }, SYNC_INTERVAL)

    return () => clearInterval(interval)
  }, [
    isPlaying,
    profileId,
    tmdbId,
    type,
    runtimeSeconds,
    season,
    episode,
    calcProgress,
    updateProgress,
    addToHistory,
    makeHistoryItem,
    syncToApi,
  ])

  // Flush on stop / unmount
  useEffect(() => {
    if (isPlaying) return

    // Only flush if we had started before
    if (startTimeRef.current > 0) {
      const progress = calcProgress()
      updateProgress(tmdbId, type, progress, runtimeSeconds, season, episode)
      addToHistory(makeHistoryItem(progress, runtimeSeconds))
      saveNow()
      startTimeRef.current = 0
    }
  }, [isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  // beforeunload — keepalive fetch
  useEffect(() => {
    if (!isPlaying || !profileId) return

    function handleBeforeUnload() {
      if (startTimeRef.current === 0) return
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const progress = Math.min(previousProgressRef.current + elapsed, runtimeSeconds)

      const token = getAccessToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      if (progress >= 0 && progress <= runtimeSeconds && runtimeSeconds > 0) {
        fetch(`${API_BASE_URL}/progress/${profileId}`, {
          method: 'PUT',
          keepalive: true,
          credentials: 'include',
          headers,
          body: JSON.stringify({
            tmdbId,
            type,
            season,
            episode,
            progressSeconds: progress,
            durationSeconds: runtimeSeconds,
          }),
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isPlaying, profileId, tmdbId, type, runtimeSeconds, season, episode])
}
