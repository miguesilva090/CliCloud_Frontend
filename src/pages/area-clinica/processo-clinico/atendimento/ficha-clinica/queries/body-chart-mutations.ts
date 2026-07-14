import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NotasBodyChartService } from '@/lib/services/processo-clinico/body-chart-service'
import type {
  MapaBodyChartDTO,
  MapaBodyChartLightDTO,
  NotasBodyChartDTO,
  NotasBodyChartTableFilterRequest,
  CreateNotasBodyChartRequest,
  UpdateNotasBodyChartRequest,
  DeleteMultipleNotasBodyChartRequest,
} from '@/types/dtos/processo-clinico/body-chart.dtos'

export function useSaveNotaBodyChart(
  mapaBodyChartId: string | undefined,
  tratamentoId: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      existingId?: string | null
      data: Omit<CreateNotasBodyChartRequest, 'mapaBodyChartId' | 'tratamentoId'>
    }) => {
      const service = NotasBodyChartService()
      if (!mapaBodyChartId) throw new Error('MapaBodyChartId é obrigatório')
      if (!tratamentoId) throw new Error('TratamentoId é obrigatório')

      if (payload.existingId) {
        const body: UpdateNotasBodyChartRequest = {
          tratamentoId,
          mapaBodyChartId,
          ...payload.data,
        }
        return service.update(payload.existingId, body)
      } else {
        const body: CreateNotasBodyChartRequest = {
          tratamentoId,
          mapaBodyChartId,
          ...payload.data,
        }
        return service.create(body)
      }
    },
    onSuccess: () => {
      if (mapaBodyChartId) {
        void queryClient.invalidateQueries({
          queryKey: ['bodychart', 'notas', mapaBodyChartId],
        })
      }
    },
  })
}
export function useDeleteNotaBodyChart(mapaBodyChartId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const service = NotasBodyChartService()
      return service.delete(id)
    },
    onSuccess: () => {
      if (mapaBodyChartId) {
        void queryClient.invalidateQueries({
          queryKey: ['bodychart', 'notas', mapaBodyChartId],
        })
      }
    },
  })
}

export function useDeleteMultipleNotasBodyChart(mapaBodyChartId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: DeleteMultipleNotasBodyChartRequest) => {
      const service = NotasBodyChartService()
      return service.deleteMultiple(body)
    },
    onSuccess: () => {
      if (mapaBodyChartId) {
        void queryClient.invalidateQueries({
          queryKey: ['bodychart', 'notas', mapaBodyChartId],
        })
      }
    },
  })
}
