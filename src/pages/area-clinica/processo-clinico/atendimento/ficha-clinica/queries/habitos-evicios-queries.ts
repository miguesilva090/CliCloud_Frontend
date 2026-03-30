import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { HabitosEViciosService } from '@/lib/services/processo-clinico/habitos-evicios-service'
import type {
  HabitosEViciosTableFilterRequest,
  HabitosEViciosDTO,
  CreateHabitosEViciosRequest,
  UpdateHabitosEViciosRequest,
} from '@/types/dtos/saude/habitos-e-vicios.dtos'

type Filters = HabitosEViciosTableFilterRequest['filters']

export function useGetHabitosEViciosByUtente(utenteId: string) {
  const pageNumber = 1
  const pageSize = 1

  const filters: Filters =
    utenteId.length > 0 ? [{ id: 'utenteId', value: utenteId }] : []

  const params: PaginatedRequest & { filters?: Filters } = {
    pageNumber,
    pageSize,
    filters:
      filters.length > 0
        ? (filters as unknown as Record<string, string> & Filters)
        : undefined,
  }

  return useQuery({
    queryKey: ['habitos-evicios', utenteId],
    queryFn: async () => {
      const res = await HabitosEViciosService().getHabitosEViciosPaginated(params)
      const first = res.info.data[0] as HabitosEViciosDTO | undefined
      return first ?? null
    },
    enabled: utenteId.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Cria/atualiza o registo de Hábitos e Vícios de um utente
export function useSaveHabitosEVicios(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      existingId?: string | null
      data: Omit<CreateHabitosEViciosRequest, 'utenteId'>
    }) => {
      const service = HabitosEViciosService()
      if (payload.existingId) {
        const body: UpdateHabitosEViciosRequest = { ...payload.data }
        return service.update(payload.existingId, body)
      } else {
        const body: CreateHabitosEViciosRequest = { utenteId, ...payload.data }
        return service.create(body)
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['habitos-evicios', utenteId] })
    },
  })
}