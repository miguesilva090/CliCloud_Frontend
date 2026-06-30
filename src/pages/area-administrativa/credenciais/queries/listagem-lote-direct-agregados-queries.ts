import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import { useLoteDirectFuncionalidadeId } from './listagem-lote-direct-queries'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetLoteDirectAgregadosPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const listPermId = useLoteDirectFuncionalidadeId()
  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['lote-direct-agregados-paginated', params],
    queryFn: () => LoteDirectService(listPermId).getAgregadosPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function usePrefetchAdjacentLoteDirectAgregados(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const listPermId = useLoteDirectFuncionalidadeId()
  const queryClient = useQueryClient()
  const baseParams = { pageSize, filters: filters ?? undefined }

  const prefetchPreviousPage = async () => {
    if (page <= 1) return
    const params: PaginatedRequest = { ...baseParams, pageNumber: page - 1 }
    await queryClient.prefetchQuery({
      queryKey: ['lote-direct-agregados-paginated', params],
      queryFn: () => LoteDirectService(listPermId).getAgregadosPaginated(params),
    })
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = { ...baseParams, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: ['lote-direct-agregados-paginated', params],
      queryFn: () => LoteDirectService(listPermId).getAgregadosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
