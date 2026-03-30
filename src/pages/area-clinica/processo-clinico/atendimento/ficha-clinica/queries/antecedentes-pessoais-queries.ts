import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { AntecedentesPessoaisService } from '@/lib/services/antecedentes/antecedentes-pessoais-service'
import type { AntecedentesPessoaisTableFilterRequest } from '@/types/dtos/saude/antecedentes-pessoais.dtos'

type Filters = AntecedentesPessoaisTableFilterRequest['filters']
type Sorting = AntecedentesPessoaisTableFilterRequest['sorting']

export function useGetAntecedentesPessoaisPaginated(
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
    queryKey: ['antecedentes-pessoais-paginated', params],
    queryFn: () => AntecedentesPessoaisService().getAntecedentesPessoaisPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useInvalidateAntecedentesPessoais() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: ['antecedentes-pessoais-paginated'] })
}

