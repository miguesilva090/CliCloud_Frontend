import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { TipoAparelhoService } from '@/lib/services/tipo-aparelho'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetTipoAparelhoPaginated(
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
    queryKey: ['tipos-aparelho-paginated', params],
    queryFn: () => TipoAparelhoService().getTipoAparelhoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentTipoAparelho(
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
      await queryClient.prefetchQuery({
        queryKey: ['tipos-aparelho-paginated', { ...baseParams, pageNumber: page - 1 }],
        queryFn: () =>
          TipoAparelhoService().getTipoAparelhoPaginated({
            ...baseParams,
            pageNumber: page - 1,
          }),
      })
    }
  }
  const prefetchNextPage = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['tipos-aparelho-paginated', { ...baseParams, pageNumber: page + 1 }],
      queryFn: () =>
        TipoAparelhoService().getTipoAparelhoPaginated({
          ...baseParams,
          pageNumber: page + 1,
        }),
    })
  }
  return { prefetchPreviousPage, prefetchNextPage }
}
