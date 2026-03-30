import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { MedicoExternoTableFilterRequest } from '@/types/dtos/saude/medicos-externos.dtos'
import { MedicoExternoService } from '@/lib/services/saude/medico-externo-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetMedicosExternosPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: MedicoExternoTableFilterRequest = {
    pageNumber,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['medicos-externos-paginated', params],
    queryFn: () => MedicoExternoService('medicos-externos').getMedicosExternosPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentMedicosExternos(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: MedicoExternoTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['medicos-externos-paginated', params],
        queryFn: () =>
          MedicoExternoService('medicos-externos').getMedicosExternosPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: MedicoExternoTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['medicos-externos-paginated', params],
      queryFn: () =>
        MedicoExternoService('medicos-externos').getMedicosExternosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
