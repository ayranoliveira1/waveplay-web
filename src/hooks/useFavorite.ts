import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { library } from '../services/library'
import type { ToggleBody } from '../services/library'
import { useProfile } from './useProfile'

export function useFavorite(tmdbId: number, type: 'movie' | 'series') {
  const { activeProfile } = useProfile()
  const queryClient = useQueryClient()
  const profileId = activeProfile?.id

  const favoritesKey = ['library', 'favorites', profileId]

  const { data: favorites, isLoading } = useQuery({
    queryKey: favoritesKey,
    queryFn: async () => {
      const res = await library.getFavorites(profileId!)
      return res.success ? res.data.favorites : []
    },
    enabled: !!profileId,
  })

  const isFavorite = favorites?.some((f) => f.tmdbId === tmdbId && f.type === type) ?? false

  const { mutate: toggleFavorite } = useMutation({
    mutationFn: (body: ToggleBody) => library.toggleFavorite(profileId!, body),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: favoritesKey })
      const previous = queryClient.getQueryData(favoritesKey)
      queryClient.setQueryData(favoritesKey, (old: typeof favorites) => {
        if (!old) return old
        const exists = old.some((f) => f.tmdbId === tmdbId && f.type === type)
        if (exists) {
          return old.filter((f) => !(f.tmdbId === tmdbId && f.type === type))
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
        queryClient.setQueryData(favoritesKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKey })
    },
  })

  return { isFavorite, isLoading, toggleFavorite }
}
