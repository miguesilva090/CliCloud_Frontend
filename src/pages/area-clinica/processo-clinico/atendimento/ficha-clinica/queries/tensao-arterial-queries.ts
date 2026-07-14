import { useQuery } from '@tanstack/react-query'
import { TensaoArterialService } from '@/lib/services/processo-clinico/sinais-vitais/tensao-arterial-service'

import type {
  CreateTensaoArterialRequest,
  TensaoArterialTableFilterRequest,
  UpdateTensaoArterialRequest,
} from '@/types/dtos/sinais-vitais/tensao-arterial.dtos'

type Filters = TensaoArterialTableFilterRequest['filters']

export function useGetTensaoArterialPaginated(
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
    queryKey: ['tensao-arterial', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => TensaoArterialService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateTensaoArterial, useUpdateTensaoArterial, useDeleteTensaoArterial } from './tensao-arterial-mutations'
