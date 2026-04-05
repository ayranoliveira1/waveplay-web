import { useState, useCallback } from 'react'

const STORAGE_KEY = 'waveplay:search_history'
const MAX_ITEMS = 10

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function persistHistory(items: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>(loadHistory)

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return

    setSearchHistory((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())
      const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS)
      persistHistory(updated)
      return updated
    })
  }, [])

  const removeSearch = useCallback((term: string) => {
    setSearchHistory((prev) => {
      const updated = prev.filter((t) => t !== term)
      persistHistory(updated)
      return updated
    })
  }, [])

  const clearSearchHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSearchHistory([])
  }, [])

  return { searchHistory, addSearch, removeSearch, clearSearchHistory }
}
