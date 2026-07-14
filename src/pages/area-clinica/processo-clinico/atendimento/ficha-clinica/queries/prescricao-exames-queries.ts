import { useQuery } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { ExameService } from '@/lib/services/exames/exame-service'


type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetExamesByUtentePaginated(
  utenteId: string | undefined,
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const baseFilters: Array<{ id: string; value: string }> = []

  if (utenteId) {
    // deve coincidir com o id usado no backend (ExameSearchTable)
    baseFilters.push({ id: 'utenteid', value: utenteId })
  }

  const allFilters =
    filters != null && filters.length > 0 ? [...baseFilters, ...filters] : baseFilters

  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: (allFilters as unknown as Record<string, string>) ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['exames-prescritos-paginated', params],
    queryFn: () => ExameService().getExamesPaginated(params),
    enabled: !!utenteId,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
export function useGetExameById(id: string | null | undefined) {
  return useQuery({
    queryKey: ['exame-by-id', id],
    queryFn: () => ExameService().getExameById(id as string),
    enabled: !!id,
    staleTime: 0,
  })
}

export { useCreateExame, useUpdateExame, useDeleteExame } from './prescricao-exames-mutations'
