import { useQuery } from '@tanstack/react-query'
import { TemperaturaCorporalService } from '@/lib/services/processo-clinico/sinais-vitais/temperatura-corporal-service'

import type {
  CreateTemperaturaCorporalRequest,
  TemperaturaCorporalTableFilterRequest,
  UpdateTemperaturaCorporalRequest,
} from '@/types/dtos/sinais-vitais/temperatura-corporal.dtos'

type Filters = TemperaturaCorporalTableFilterRequest['filters']

export function useGetTemperaturaCorporalPaginated(
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
    queryKey: ['temperatura-corporal', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => TemperaturaCorporalService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateTemperaturaCorporal, useUpdateTemperaturaCorporal, useDeleteTemperaturaCorporal } from './temperatura-corporal-mutations'
