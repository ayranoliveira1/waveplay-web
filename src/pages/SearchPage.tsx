import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { Search, X, Film, Star, SearchX } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { catalog } from '../services/catalog'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { TMDB_IMAGE_SIZES } from '../constants/api'
import type { CatalogItem } from '../types/api'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { searchHistory, addSearch, removeSearch, clearSearchHistory } = useSearchHistory()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value.trim())
    }, 500)
  }

  function handleClear() {
    setQuery('')
    setDebouncedQuery('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    inputRef.current?.focus()
  }

  function handleHistoryClick(term: string) {
    setQuery(term)
    setDebouncedQuery(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['catalog', 'search', debouncedQuery],
    queryFn: async () => {
      const res = await catalog.searchMulti(debouncedQuery)
      return res.success ? res.data : null
    },
    enabled: debouncedQuery.length >= 2,
  })

  useEffect(() => {
    if (debouncedQuery.length >= 2 && data && data.results.length > 0) {
      addSearch(debouncedQuery)
    }
  }, [debouncedQuery, data, addSearch])

  const results = data?.results ?? []
  const hasQuery = debouncedQuery.length >= 2

  return (
    <div className="py-4 sm:py-6">
      {/* Search input */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar filmes e séries..."
          className="w-full h-12 pl-11 pr-10 rounded-lg bg-surface text-text text-sm placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"
            aria-label="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && hasQuery && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-20 h-[120px] flex-shrink-0 rounded-lg" />
              <div className="flex-1 py-2 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && hasQuery && results.length > 0 && (
        <>
          <p className="text-sm text-text-muted mb-4">
            Resultados para &quot;{debouncedQuery}&quot;
          </p>
          <div className="space-y-3">
            {results.map((item) => (
              <SearchResultCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </>
      )}

      {/* No results */}
      {!isLoading && hasQuery && results.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="Nenhum resultado"
          description={`Não encontramos resultados para "${debouncedQuery}"`}
        />
      )}

      {/* History (no query) */}
      {!hasQuery && searchHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text">Buscas recentes</h2>
            <button
              onClick={clearSearchHistory}
              className="text-sm text-primary hover:text-primary-light transition-colors cursor-pointer"
            >
              Limpar tudo
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term) => (
              <div
                key={term}
                className="flex items-center gap-1.5 bg-surface rounded-full pl-3 pr-1.5 py-1.5"
              >
                <button
                  onClick={() => handleHistoryClick(term)}
                  className="text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
                >
                  {term}
                </button>
                <button
                  onClick={() => removeSearch(term)}
                  className="p-0.5 text-text-muted hover:text-text transition-colors cursor-pointer"
                  aria-label={`Remover "${term}"`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state (no query, no history) */}
      {!hasQuery && searchHistory.length === 0 && (
        <EmptyState
          icon={Search}
          title="O que você quer assistir?"
          description="Busque por filmes, séries e mais"
        />
      )}
    </div>
  )
}

function SearchResultCard({ item }: { item: CatalogItem }) {
  const href =
    item.type === 'movie' ? `/browse/movie/${item.id}` : `/browse/series/${item.id}`

  return (
    <Link to={href} className="flex gap-3 rounded-lg bg-surface overflow-hidden hover:bg-border transition-colors">
      <div className="w-20 h-[120px] flex-shrink-0">
        {item.posterPath ? (
          <img
            src={`${TMDB_IMAGE_SIZES.poster.small}${item.posterPath}`}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-border">
            <Film size={20} className="text-text-muted" />
          </div>
        )}
      </div>
      <div className="flex-1 py-2 pr-3 min-w-0">
        <p className="text-sm font-semibold text-text line-clamp-2">{item.title}</p>
        <p className="text-xs text-text-muted mt-1">
          {item.type === 'movie' ? 'Filme' : 'Série'}
          {item.releaseDate ? ` • ${item.releaseDate.split('-')[0]}` : ''}
        </p>
        {item.overview && (
          <p className="text-xs text-text-muted mt-1 line-clamp-2">{item.overview}</p>
        )}
        {item.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="text-warning fill-warning" />
            <span className="text-xs text-text-muted">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
