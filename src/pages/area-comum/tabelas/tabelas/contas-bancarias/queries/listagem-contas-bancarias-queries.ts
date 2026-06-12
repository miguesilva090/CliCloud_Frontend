import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { ContaBancariaService } from '@/lib/services/bancos/conta-bancaria-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetContasBancariasPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['contas-bancarias-paginated', params],
    queryFn: () => ContaBancariaService('bancos').getContasBancariasPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentContasBancarias(
  page: number,
  pageSize: number,
  filters: Filters,
) {
  const queryClient = useQueryClient()
  const baseParams = { pageSize, filters: filters ?? undefined }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: PaginatedRequest = { ...baseParams, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: ['contas-bancarias-paginated', params],
        queryFn: () =>
          ContaBancariaService('bancos').getContasBancariasPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = { ...baseParams, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: ['contas-bancarias-paginated', params],
      queryFn: () =>
        ContaBancariaService('bancos').getContasBancariasPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
