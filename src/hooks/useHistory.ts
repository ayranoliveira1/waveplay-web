import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from './useProfile'
import { playback } from '../services/playback'

export interface HistoryItem {
  id: number
  title: string
  posterPath: string | null
  type: 'movie' | 'series'
  watchedAt: string
  lastSeason?: number
  lastEpisode?: number
  progressSeconds?: number
  durationSeconds?: number
}

export function useHistory() {
  const { activeProfile } = useProfile()
  const profileId = activeProfile?.id
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['history', profileId],
    queryFn: async () => {
      const res = await playback.getHistory(profileId!)
      return res.success ? res.data.items : []
    },
    enabled: !!profileId,
  })

  const history: HistoryItem[] = useMemo(() => {
    const items = (data ?? []).map((item) => ({
      id: item.tmdbId,
      title: item.title,
      posterPath: item.posterPath,
      type: item.type,
      watchedAt: item.watchedAt,
      lastSeason: item.season,
      lastEpisode: item.episode,
      progressSeconds: item.progressSeconds,
      durationSeconds: item.durationSeconds,
    }))

    const seen = new Map<string, HistoryItem>()
    for (const item of items) {
      const key = `${item.id}-${item.type}`
      const existing = seen.get(key)
      if (!existing || item.watchedAt > existing.watchedAt) {
        seen.set(key, item)
      }
    }

    return Array.from(seen.values())
  }, [data])

  const addToHistory = useCallback(
    async (item: HistoryItem) => {
      if (!profileId) return
      await playback.addToHistory(profileId, {
        tmdbId: item.id,
        type: item.type,
        title: item.title,
        posterPath: item.posterPath,
        progressSeconds: item.progressSeconds,
        durationSeconds: item.durationSeconds,
        season: item.lastSeason,
        episode: item.lastEpisode,
      })
      queryClient.invalidateQueries({ queryKey: ['history', profileId] })
    },
    [profileId, queryClient],
  )

  const clearHistory = useCallback(async () => {
    if (!profileId) return
    await playback.clearHistory(profileId)
    queryClient.invalidateQueries({ queryKey: ['history', profileId] })
  }, [profileId, queryClient])

  return {
    history,
    isLoading,
    addToHistory,
    clearHistory,
  }
}
