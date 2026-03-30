import { useQuery, useQueryClient } from '@tanstack/react-query'
import { HistoriaClinicaService } from '@/lib/services/historia-clinica/historia-clinica-service'
import type { HistoriaClinicaTableFilterRequest } from '@/types/dtos/saude/historia-clinica.dtos'

type Filters = HistoriaClinicaTableFilterRequest['filters']
type Sorting = HistoriaClinicaTableFilterRequest['sorting']

export function useGetHistoriasClinicasPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['historias-clinicas-paginated', params],
    queryFn: () => HistoriaClinicaService().getHistoriaClinicaPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function usePrefetchAdjacentHistoriasClinicas(
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
          queryKey: ['historias-clinicas-paginated', params],
          queryFn: () => HistoriaClinicaService().getHistoriaClinicaPaginated(params),
        })
      }
    },
    prefetchNextPage: async () => {
      const params = { ...baseParams, pageNumber: page + 1 }
      await queryClient.prefetchQuery({
        queryKey: ['historias-clinicas-paginated', params],
        queryFn: () => HistoriaClinicaService().getHistoriaClinicaPaginated(params),
      })
    },
  }
}