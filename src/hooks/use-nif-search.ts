import { useState, useCallback } from 'react'

interface UseNifSearchProps {
  onEntityFound?: (entity: any) => void
  onEntityNotFound?: () => void
}

export function useNifSearch({
  onEntityFound,
  onEntityNotFound,
}: UseNifSearchProps = {}) {
  const [foundEntity, setFoundEntity] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleEntityFound = useCallback(
    (entity: any) => {
      setFoundEntity(entity)
      setHasSearched(true)
      setIsSearching(false)
      onEntityFound?.(entity)
    },
    [onEntityFound]
  )

  const handleEntityNotFound = useCallback(() => {
    setFoundEntity(null)
    setHasSearched(true)
    setIsSearching(false)
    onEntityNotFound?.()
  }, [onEntityNotFound])

  const handleSearchStart = useCallback(() => {
    setIsSearching(true)
    setHasSearched(false)
  }, [])

  const handleSearchEnd = useCallback(() => {
    setIsSearching(false)
  }, [])

  const reset = useCallback(() => {
    setFoundEntity(null)
    setIsSearching(false)
    setHasSearched(false)
  }, [])

  return {
    foundEntity,
    isSearching,
    hasSearched,
    handleEntityFound,
    handleEntityNotFound,
    handleSearchStart,
    handleSearchEnd,
    reset,
  }
}
