import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { TipoDocumentoService } from '@/lib/services/faturacao/tipo-documento-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetSeriesDocumentoPaginated(
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
    queryKey: ['series-documento-paginated', params],
    queryFn: () => TipoDocumentoService().getTiposDocumentoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentSeriesDocumento(
  page: number,
  pageSize: number,
  filters: Filters,
) {
  const queryClient = useQueryClient()
  const baseParams = {
    pageSize,
    filters: filters ?? undefined,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: PaginatedRequest = { ...baseParams, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: ['series-documento-paginated', params],
        queryFn: () => TipoDocumentoService().getTiposDocumentoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = { ...baseParams, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: ['series-documento-paginated', params],
      queryFn: () => TipoDocumentoService().getTiposDocumentoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
