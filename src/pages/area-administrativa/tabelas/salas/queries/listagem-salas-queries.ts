import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { SalaService } from '@/lib/services/consultas/sala-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetSalasPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['salas-paginated', params],
    queryFn: () => SalaService().getSalasPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentSalas(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()
  const baseParams = {
    pageSize,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: PaginatedRequest = { ...baseParams, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: ['salas-paginated', params],
        queryFn: () => SalaService().getSalasPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = { ...baseParams, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: ['salas-paginated', params],
      queryFn: () => SalaService().getSalasPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
