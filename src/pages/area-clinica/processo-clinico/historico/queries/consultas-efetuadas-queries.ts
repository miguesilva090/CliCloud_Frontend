import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { ConsultaService } from '@/lib/services/consultas/consulta-service'

type Filters = Array<{ id: string; value: string }>
type Sorting = Array<{ id: string; desc: boolean }> | null

export function useGetConsultasEfetuadasPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: PaginatedRequest & { filters?: Filters } = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['consultas-efetuadas-paginated', params],
    queryFn: () => ConsultaService().getConsultaPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function usePrefetchAdjacentConsultasEfetuadas(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: filters ?? undefined,
  }

  return {
    prefetchPreviousPage: async () => {
      if (page > 1) {
        const params = { ...baseParams, pageNumber: page - 1 }
        await queryClient.prefetchQuery({
          queryKey: ['consultas-efetuadas-paginated', params],
          queryFn: () => ConsultaService().getConsultaPaginated(params),
        })
      }
    },
    prefetchNextPage: async () => {
      const params = { ...baseParams, pageNumber: page + 1 }
      await queryClient.prefetchQuery({
        queryKey: ['consultas-efetuadas-paginated', params],
        queryFn: () => ConsultaService().getConsultaPaginated(params),
      })
    },
  }
}
