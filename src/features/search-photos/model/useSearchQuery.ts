import { useState, useCallback } from 'react'

export function useSearchQuery(initialValue = '') {
  const [query, setQuery] = useState(initialValue)

  const clearQuery = useCallback(() => setQuery(''), [])

  return { query, setQuery, clearQuery }
}
