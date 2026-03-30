import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { AntecedentesFamiliaresUtenteService } from '@/lib/services/antecedentes/antecedentes-familiares-utente-service'
import type { AntecedentesFamiliaresUtenteTableFilterRequest } from '@/types/dtos/saude/antecedentes-familiares-utente.dtos'

type Filters = AntecedentesFamiliaresUtenteTableFilterRequest['filters']
type Sorting = AntecedentesFamiliaresUtenteTableFilterRequest['sorting']

export function useGetAntecedentesFamiliaresUtentePaginated(
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
    queryKey: ['antecedentes-familiares-utente-paginated', params],
    queryFn: () =>
      AntecedentesFamiliaresUtenteService().getAntecedentesFamiliaresUtentePaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useInvalidateAntecedentesFamiliaresUtente() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: ['antecedentes-familiares-utente-paginated'],
    })
}

