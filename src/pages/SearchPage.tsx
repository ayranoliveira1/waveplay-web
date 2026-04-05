import { useState, useRef, useEffect } from 'react'
import { Search, X, SearchX } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { catalog } from '../services/catalog'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { MediaCard } from '../components/MediaCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[2/3] rounded-lg" />
              <Skeleton className="h-4 mt-2 w-3/4 rounded" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {results.map((item) => (
              <MediaCard key={`${item.type}-${item.id}`} item={item} size="lg" />
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
