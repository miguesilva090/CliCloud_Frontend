import { useQuery } from '@tanstack/react-query'
import { AvaliacaoPosturalService } from '@/lib/services/processo-clinico/sinais-vitais/avaliacao-postural-service'

import type {
  CreateAvaliacaoPosturalRequest,
  AvaliacaoPosturalTableFilterRequest,
  UpdateAvaliacaoPosturalRequest,
} from '@/types/dtos/sinais-vitais/avaliacao-postural.dtos'

type Filters = AvaliacaoPosturalTableFilterRequest['filters']

export function useGetAvaliacaoPosturalPaginated(
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
    queryKey: ['avaliacao-postural', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => AvaliacaoPosturalService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateAvaliacaoPostural, useUpdateAvaliacaoPostural, useDeleteAvaliacaoPostural } from './avaliacao-postural-mutations'
