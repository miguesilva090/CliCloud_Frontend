import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { TipoServicoTableFilterRequest } from '@/types/dtos/servicos/tipo-servico.dtos'
import { TipoServicoService } from '@/lib/services/servicos/tipo-servico-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function buildParams(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
): TipoServicoTableFilterRequest {
  return {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }
}

export function useGetTiposServicoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params = buildParams(pageNumber, pageSize, filters, sorting)

  return useQuery({
    queryKey: ['tipos-servico-paginated', params],
    queryFn: () => TipoServicoService().getTipoServicoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentTiposServico(
  page: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const queryClient = useQueryClient()

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params = buildParams(page - 1, pageSize, filters, sorting)
      await queryClient.prefetchQuery({
        queryKey: ['tipos-servico-paginated', params],
        queryFn: () => TipoServicoService().getTipoServicoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params = buildParams(page + 1, pageSize, filters, sorting)
    await queryClient.prefetchQuery({
      queryKey: ['tipos-servico-paginated', params],
      queryFn: () => TipoServicoService().getTipoServicoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

