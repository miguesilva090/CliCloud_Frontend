import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useWindowPageState } from '@/stores/use-pages-store'
import { useCurrentWindowId } from '@/utils/window-utils'

type UsePageDataOptions = {
  // Required
  useGetDataPaginated: (
    page: number,
    pageSize: number,
    filters: Array<{ id: string; value: string }>,
    sorting: Array<{ id: string; desc: boolean }>
  ) => any
  usePrefetchAdjacentData: (
    page: number,
    pageSize: number,
    filters: Array<{ id: string; value: string }>,
    sorting?: Array<{ id: string; desc: boolean }>
  ) => any

  // Optional
  onFiltersChange?: (filters: Array<{ id: string; value: string }>) => void
  onPaginationChange?: (page: number, pageSize: number) => void
  onSortingChange?: (sorting: Array<{ id: string; desc: boolean }>) => void
}

export function usePageData(options: UsePageDataOptions) {
  const location = useLocation()
  const currentWindowId = useCurrentWindowId()

  // Sem janela: estado da listagem ligado ao pathname actual (o layout força remount por rota com key=pathname).
  const pageStateKey = currentWindowId || location.pathname

  const locationState = location.state as {
    pagination?: { page: number; pageSize: number }
    sorting?: Array<{ id: string; desc: boolean }>
    initialFilters?: Array<{ id: string; value: string }>
  }

  const {
    filters,
    sorting,
    pagination: { page, pageSize },
    setFilters,
    setSorting,
    setPagination,
  } = useWindowPageState(pageStateKey)

  // Initialize filters, pagination and sorting from location state if they exist
  useEffect(() => {
    if (locationState?.initialFilters) {
      setFilters(locationState.initialFilters)
    }
    if (locationState?.pagination) {
      setPagination(
        locationState.pagination.page,
        locationState.pagination.pageSize
      )
    }
    if (locationState?.sorting) {
      setSorting(locationState.sorting)
    }
  }, [])

  const queryResult = options.useGetDataPaginated(
    page,
    pageSize,
    filters,
    sorting
  )

  const { data, isLoading, isFetching, isPlaceholderData, isError, error } =
    queryResult

  // Track when params are changing to show loading state
  const [isParamsChanging, setIsParamsChanging] = useState(false)
  const [minLoadingTime, setMinLoadingTime] = useState(false)
  const prevFiltersRef = useRef(JSON.stringify(filters))
  const prevPageRef = useRef(page)
  const prevSortingRef = useRef(JSON.stringify(sorting))

  // Detect when filters, page, or sorting change
  useEffect(() => {
    const filtersChanged = prevFiltersRef.current !== JSON.stringify(filters)
    const pageChanged = prevPageRef.current !== page
    const sortingChanged = prevSortingRef.current !== JSON.stringify(sorting)

    if (filtersChanged || pageChanged || sortingChanged) {
      setIsParamsChanging(true)
      setMinLoadingTime(true)
      prevFiltersRef.current = JSON.stringify(filters)
      prevPageRef.current = page
      prevSortingRef.current = JSON.stringify(sorting)

      // Ensure minimum loading time of 300ms for better UX
      const timer = setTimeout(() => {
        setMinLoadingTime(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [filters, page, sorting])

  // Reset isParamsChanging when fetch completes
  useEffect(() => {
    if (!isFetching && isParamsChanging && !minLoadingTime) {
      setIsParamsChanging(false)
    }
  }, [isFetching, isParamsChanging, minLoadingTime])

  // Show loading when:
  // 1. Initial load (isLoading)
  // 2. Minimum loading time is active (minLoadingTime)
  // 3. Fetching after params changed (isFetching && isParamsChanging)
  // 4. Fetching with placeholder data (isFetching && isPlaceholderData)
  const isLoadingData =
    isLoading ||
    minLoadingTime ||
    (isFetching && (isParamsChanging || isPlaceholderData))

  const { prefetchPreviousPage, prefetchNextPage } =
    options.usePrefetchAdjacentData(page, pageSize, filters)

  const handleFiltersChange = (
    newFilters: Array<{ id: string; value: string }>
  ) => {
    setFilters(newFilters)
    setPagination(1, pageSize) // Reset to first page when filters change
    if (options.onFiltersChange) {
      options.onFiltersChange(newFilters)
    }
  }

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPagination(newPage, newPageSize)
    if (options.onPaginationChange) {
      options.onPaginationChange(newPage, newPageSize)
    }
  }

  const handleSortingChange = (
    newSorting: Array<{ id: string; desc: boolean }>
  ) => {
    setSorting(newSorting)
    if (options.onSortingChange) {
      options.onSortingChange(newSorting)
    }
  }

  useEffect(() => {
    prefetchPreviousPage()
    prefetchNextPage()
  }, [page, pageSize, filters, sorting])

  return {
    data,
    isLoading: isLoadingData,
    isError: !!isError,
    error,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  }
}
