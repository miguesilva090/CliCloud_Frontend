import { useQuery } from '@tanstack/react-query'
import { IndiceMassaCorporalService } from '@/lib/services/processo-clinico/sinais-vitais/indice-massa-corporal-service'

import type {
  CreateIndiceMassaCorporalRequest,
  IndiceMassaCorporalTableFilterRequest,
  UpdateIndiceMassaCorporalRequest,
} from '@/types/dtos/sinais-vitais/indice-massa-corporal.dtos'

type Filters = IndiceMassaCorporalTableFilterRequest['filters']

export function useGetIndiceMassaCorporalPaginated(
  utenteId: string,
  pageNumber: number,
  pageSize: number
) {
  const filters: Filters =
    utenteId.length > 0 ? [{ id: 'utenteId', value: utenteId }] : []

  const params = {
    pageNumber,
    pageSize,
    filters: filters.length > 0 ? filters : undefined,
  }

  return useQuery({
    queryKey: ['indice-massa-corporal', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => IndiceMassaCorporalService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateIndiceMassaCorporal, useUpdateIndiceMassaCorporal, useDeleteIndiceMassaCorporal } from './indice-massa-corporal-mutations'
