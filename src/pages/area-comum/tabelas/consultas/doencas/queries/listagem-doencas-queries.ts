import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { convertFiltersToRecord } from '@/utils/table-utils'
import { DoencaService } from '@/lib/services/doencas/doenca-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetDoencasPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: convertFiltersToRecord(filters),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['doencas-paginated', params],
    queryFn: () => DoencaService().getDoencasPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentDoencas(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: convertFiltersToRecord(filters),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: PaginatedRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['doencas-paginated', params],
        queryFn: () => DoencaService().getDoencasPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['doencas-paginated', params],
      queryFn: () => DoencaService().getDoencasPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
