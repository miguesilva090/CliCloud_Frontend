import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { SeguradoraTableFilterRequest } from '@/types/dtos/seguradoras/seguradora.dtos'
import { SeguradoraService } from '@/lib/services/seguradoras/seguradora-service'
import { modules } from '@/config/modules'

const seguradorasPermId = modules.areaComum.permissions.seguradoras.id

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetSeguradorasPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params: SeguradoraTableFilterRequest = {
    pageNumber,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['seguradoras-paginated', params],
    queryFn: () =>
      SeguradoraService(seguradorasPermId).getSeguradorasPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentSeguradoras(
  page: number,
  pageSize: number,
  filters: Filters,
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: SeguradoraTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['seguradoras-paginated', params],
        queryFn: () =>
          SeguradoraService(seguradorasPermId).getSeguradorasPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: SeguradoraTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['seguradoras-paginated', params],
      queryFn: () =>
        SeguradoraService(seguradorasPermId).getSeguradorasPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
