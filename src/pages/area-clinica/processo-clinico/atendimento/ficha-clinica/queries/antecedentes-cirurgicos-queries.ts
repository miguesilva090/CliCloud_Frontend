import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { AntecedentesCirurgicosService } from '@/lib/services/antecedentes/antecedentes-cirurgicos-service'
import type { AntecedentesCirurgicosTableFilterRequest } from '@/types/dtos/saude/antecedentes-cirurgicos.dtos'

type Filters = AntecedentesCirurgicosTableFilterRequest['filters']
type Sorting = AntecedentesCirurgicosTableFilterRequest['sorting']

export function useGetAntecedentesCirurgicosPaginated(
  utenteId: string,
  pageNumber: number,
  pageSize: number,
  sorting?: Sorting
) {
  const filters: Filters =
    utenteId.length > 0 ? [{ id: 'utenteId', value: utenteId }] : []

  const params: PaginatedRequest & { filters?: Filters } = {
    pageNumber,
    pageSize,
    filters: filters.length > 0 ? filters : undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['antecedentes-cirurgicos-paginated', params],
    queryFn: () => AntecedentesCirurgicosService().getAntecedentesCirurgicosPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useInvalidateAntecedentesCirurgicos() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: ['antecedentes-cirurgicos-paginated'] })
}

