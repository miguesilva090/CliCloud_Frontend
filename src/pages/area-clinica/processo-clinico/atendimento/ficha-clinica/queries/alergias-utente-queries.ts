import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { AlergiaUtenteService } from '@/lib/services/alergias/alergia-utente-service'
import type { AlergiaUtenteTableFilterRequest } from '@/types/dtos/alergias/alergia-utente.dtos'

type Filters = AlergiaUtenteTableFilterRequest['filters']
type Sorting = AlergiaUtenteTableFilterRequest['sorting']

export function useGetAlergiasUtentePaginated(
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
    queryKey: ['alergias-utente-paginated', params],
    queryFn: () => AlergiaUtenteService().getAlergiaUtentePaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useInvalidateAlergiasUtente() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: ['alergias-utente-paginated'] })
}
