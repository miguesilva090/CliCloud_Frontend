import { useQuery } from '@tanstack/react-query'
import { GorduraMassaMuscularService } from '@/lib/services/processo-clinico/sinais-vitais/gordura-massa-muscular-service'

import type {
  CreateGorduraMassaMuscularRequest,
  GorduraMassaMuscularTableFilterRequest,
  UpdateGorduraMassaMuscularRequest,
} from '@/types/dtos/sinais-vitais/gordura-massa-muscular.dtos'

type Filters = GorduraMassaMuscularTableFilterRequest['filters']

export function useGetGorduraMassaMuscularPaginated(
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
    queryKey: ['gordura-massa-muscular', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => GorduraMassaMuscularService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateGorduraMassaMuscular, useUpdateGorduraMassaMuscular, useDeleteGorduraMassaMuscular } from './gordura-massa-muscular-mutations'
