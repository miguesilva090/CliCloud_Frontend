import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HabitosEViciosService } from '@/lib/services/processo-clinico/habitos-evicios-service'
import type {
  CreateHabitosEViciosRequest,
  UpdateHabitosEViciosRequest,
} from '@/types/dtos/saude/habitos-e-vicios.dtos'

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
      }
      const body: CreateHabitosEViciosRequest = { utenteId, ...payload.data }
      return service.create(body)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['habitos-evicios', utenteId] })
    },
  })
}
