import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { SubsistemaServicoTableFilterRequest } from '@/types/dtos/servicos/subsistema-servico.dtos'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function buildParams(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
): SubsistemaServicoTableFilterRequest {
  return {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }
}

export function useGetSubsistemasServicosPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params = buildParams(pageNumber, pageSize, filters, sorting)

  return useQuery({
    queryKey: ['subsistemas-servicos-paginated', params],
    queryFn: () => SubsistemaServicoService().getSubsistemaServicoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentSubsistemasServicos(
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
        queryKey: ['subsistemas-servicos-paginated', params],
        queryFn: () =>
          SubsistemaServicoService().getSubsistemaServicoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params = buildParams(page + 1, pageSize, filters, sorting)
    await queryClient.prefetchQuery({
      queryKey: ['subsistemas-servicos-paginated', params],
      queryFn: () => SubsistemaServicoService().getSubsistemaServicoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

