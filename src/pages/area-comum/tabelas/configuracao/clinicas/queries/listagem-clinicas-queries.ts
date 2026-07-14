import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { TanstackSorting } from '@/types/dtos/common/table-filters.dtos'
import type { ClinicaTableFilterRequest } from '@/types/dtos/core/clinica.dtos'
import { ClinicaService } from '@/lib/services/core/clinica-service'

export const useGetClinicasPaginated = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: TanstackSorting | null,
) => {
  const params: ClinicaTableFilterRequest = {
    pageNumber: page,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['clinicas-paginated', params],
    queryFn: () => ClinicaService('tabelas').getClinicasPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export const usePrefetchAdjacentClinicas = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
) => {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: ClinicaTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['clinicas-paginated', params],
        queryFn: () => ClinicaService('tabelas').getClinicasPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: ClinicaTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }

    await queryClient.prefetchQuery({
      queryKey: ['clinicas-paginated', params],
      queryFn: () => ClinicaService('tabelas').getClinicasPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}


export { useSetDefaultClinica } from './listagem-clinicas-mutations'
