import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { library } from '../services/library'
import type { ToggleBody } from '../services/library'
import { useProfile } from './useProfile'

export function useWatchlist(tmdbId: number, type: 'movie' | 'series') {
  const { activeProfile } = useProfile()
  const queryClient = useQueryClient()
  const profileId = activeProfile?.id

  const watchlistKey = ['library', 'watchlist', profileId]

  const { data: watchlist, isLoading } = useQuery({
    queryKey: watchlistKey,
    queryFn: async () => {
      const res = await library.getWatchlist(profileId!)
      return res.success ? res.data.items : []
    },
    enabled: !!profileId,
  })

  const isInWatchlist = watchlist?.some((w) => w.tmdbId === tmdbId && w.type === type) ?? false

  const { mutate: toggleWatchlist } = useMutation({
    mutationFn: (body: ToggleBody) => library.toggleWatchlist(profileId!, body),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: watchlistKey })
      const previous = queryClient.getQueryData(watchlistKey)
      queryClient.setQueryData(watchlistKey, (old: typeof watchlist) => {
        if (!old) return old
        const exists = old.some((w) => w.tmdbId === tmdbId && w.type === type)
        if (exists) {
          return old.filter((w) => !(w.tmdbId === tmdbId && w.type === type))
        }
        return [
          ...old,
          {
            id: '',
            tmdbId,
            type,
            title: '',
            posterPath: null,
            backdropPath: null,
            rating: 0,
            createdAt: new Date().toISOString(),
          },
        ]
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(watchlistKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKey })
    },
  })

  return { isInWatchlist, isLoading, toggleWatchlist }
}
