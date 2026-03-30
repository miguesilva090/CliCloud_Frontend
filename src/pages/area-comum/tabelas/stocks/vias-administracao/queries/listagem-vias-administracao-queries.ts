import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ViaAdministracaoTableFilterRequest } from '@/types/dtos/artigos/via-administracao.dtos'
import { ViaAdministracaoService } from '@/lib/services/artigos/via-administracao-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function buildParams(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
): ViaAdministracaoTableFilterRequest {
  return {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }
}

export function useGetViasAdministracaoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params = buildParams(pageNumber, pageSize, filters, sorting)

  return useQuery({
    queryKey: ['vias-administracao-paginated', params],
    queryFn: () => ViaAdministracaoService().getViaAdministracaoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentViasAdministracao(
  page: number,
  pageSize: number,
  filters: Filters,
  sorting?: Sorting,
) {
  const queryClient = useQueryClient()
  const sort = sorting ?? []

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params = buildParams(page - 1, pageSize, filters, sort)
      await queryClient.prefetchQuery({
        queryKey: ['vias-administracao-paginated', params],
        queryFn: () => ViaAdministracaoService().getViaAdministracaoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params = buildParams(page + 1, pageSize, filters, sort)
    await queryClient.prefetchQuery({
      queryKey: ['vias-administracao-paginated', params],
      queryFn: () => ViaAdministracaoService().getViaAdministracaoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

