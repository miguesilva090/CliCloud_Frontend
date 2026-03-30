import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { QuestionarioUtenteService } from '@/lib/services/processo-clinico/questionario-utente-service'
import type { QuestionarioUtenteTableFilterRequest } from '@/types/dtos/saude/questionario-utente.dtos'

type Filters = QuestionarioUtenteTableFilterRequest['filters']
type Sorting = QuestionarioUtenteTableFilterRequest['sorting']

export function useGetQuestionariosUtentePaginated(
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
    queryKey: ['questionarios-utente-paginated', params],
    queryFn: () => QuestionarioUtenteService().getQuestionariosPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useInvalidateQuestionariosUtente() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['questionarios-utente-paginated'] })
}

