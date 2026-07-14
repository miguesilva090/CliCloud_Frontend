import { useQuery } from '@tanstack/react-query'
import { AvaliacaoAntropometricaService } from '@/lib/services/processo-clinico/sinais-vitais/avaliacao-antropometrica-service'

import type {
  CreateAvaliacaoAntropometricaRequest,
  AvaliacaoAntropometricaTableFilterRequest,
  UpdateAvaliacaoAntropometricaRequest,
} from '@/types/dtos/sinais-vitais/avaliacao-antropometrica.dtos'

type Filters = AvaliacaoAntropometricaTableFilterRequest['filters']

export function useGetAvaliacaoAntropometricaPaginated(
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
    queryKey: ['avaliacao-antropometrica', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => AvaliacaoAntropometricaService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateAvaliacaoAntropometrica, useUpdateAvaliacaoAntropometrica, useDeleteAvaliacaoAntropometrica } from './avaliacao-antropometrica-mutations'
