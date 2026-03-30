import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { CentroSaudeTableFilterRequest } from '@/types/dtos/saude/centro-saude.dtos'
import { CentroSaudeService } from '@/lib/services/saude/centro-saude-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetCentrosSaudePaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: CentroSaudeTableFilterRequest = {
    pageNumber,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['centros-saude-paginated', params],
    queryFn: () =>
      CentroSaudeService('tabelas').getCentrosSaudePaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentCentrosSaude(
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
      const params: CentroSaudeTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['centros-saude-paginated', params],
        queryFn: () =>
          CentroSaudeService('tabelas').getCentrosSaudePaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: CentroSaudeTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['centros-saude-paginated', params],
      queryFn: () =>
        CentroSaudeService('tabelas').getCentrosSaudePaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
