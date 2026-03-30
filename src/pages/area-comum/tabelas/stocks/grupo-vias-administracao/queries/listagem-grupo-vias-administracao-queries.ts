import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { GrupoViasAdministracaoTableFilterRequest } from '@/types/dtos/artigos/grupo-vias-administracao.dtos'
import { GrupoViasAdministracaoService } from '@/lib/services/artigos/grupo-vias-administracao-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

function buildParams(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
): GrupoViasAdministracaoTableFilterRequest {
  return {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }
}

export function useGetGruposViasAdministracaoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params = buildParams(pageNumber, pageSize, filters, sorting)

  return useQuery({
    queryKey: ['grupos-vias-administracao-paginated', params],
    queryFn: () =>
      GrupoViasAdministracaoService().getGrupoViasAdministracaoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentGruposViasAdministracao(
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
        queryKey: ['grupos-vias-administracao-paginated', params],
        queryFn: () =>
          GrupoViasAdministracaoService().getGrupoViasAdministracaoPaginated(
            params,
          ),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params = buildParams(page + 1, pageSize, filters, sort)
    await queryClient.prefetchQuery({
      queryKey: ['grupos-vias-administracao-paginated', params],
      queryFn: () =>
        GrupoViasAdministracaoService().getGrupoViasAdministracaoPaginated(
          params,
        ),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export function useGetGrupoViasAdministracao(id: string | null) {
  return useQuery({
    queryKey: ['grupo-vias-administracao', id],
    queryFn: () =>
      id
        ? GrupoViasAdministracaoService().getGrupoViasAdministracao(id)
        : Promise.resolve(null),
    enabled: !!id,
  })
}

