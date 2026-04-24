import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import type { TecnicoTableFilterRequest } from '@/types/dtos/saude/tecnicos.dtos'
import type { TanstackSorting } from '@/types/dtos/common/table-filters.dtos'

export function useGetTecnicosPaginated(
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: TanstackSorting | null
) {
  const params: TecnicoTableFilterRequest = {
    pageNumber: page,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['tecnicos-paginated', params],
    queryFn: () => TecnicoService('tecnicos').getTecnicosPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export function usePrefetchAdjacentTecnicos(
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: TecnicoTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['tecnicos-paginated', params],
        queryFn: () => TecnicoService('tecnicos').getTecnicosPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: TecnicoTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['tecnicos-paginated', params],
      queryFn: () => TecnicoService('tecnicos').getTecnicosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

