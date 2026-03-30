import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { convertFiltersToRecord } from '@/utils/table-utils'
import { TipoConsultaService } from '@/lib/services/tipos-consulta/tipo-consulta-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetAllTiposConsulta() {
  return useQuery({
    queryKey: ['tipos-consulta-all'],
    queryFn: () => TipoConsultaService().getAllTiposConsulta({}),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useGetTiposConsultaPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: convertFiltersToRecord(filters),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['tipos-consulta-paginated', params],
    queryFn: () => TipoConsultaService().getTiposConsultaPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentTiposConsulta(
  page: number,
  pageSize: number,
  filters: Filters,
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: convertFiltersToRecord(filters),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: PaginatedRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['tipos-consulta-paginated', params],
        queryFn: () => TipoConsultaService().getTiposConsultaPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['tipos-consulta-paginated', params],
      queryFn: () => TipoConsultaService().getTiposConsultaPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

