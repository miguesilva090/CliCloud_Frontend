import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ServicoTableFilterRequest } from '@/types/dtos/servicos/servico.dtos'
import { ServicoService } from '@/lib/services/servicos/servico-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function buildParams(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
): ServicoTableFilterRequest {
  return {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }
}

export function useGetServicosPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params = buildParams(pageNumber, pageSize, filters, sorting)

  return useQuery({
    queryKey: ['servicos-paginated', params],
    queryFn: () => ServicoService().getServicoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentServicos(
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
        queryKey: ['servicos-paginated', params],
        queryFn: () => ServicoService().getServicoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params = buildParams(page + 1, pageSize, filters, sorting)
    await queryClient.prefetchQuery({
      queryKey: ['servicos-paginated', params],
      queryFn: () => ServicoService().getServicoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

