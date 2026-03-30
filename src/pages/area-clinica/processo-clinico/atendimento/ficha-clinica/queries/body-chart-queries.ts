import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import {
  MapaBodyChartService,
  NotasBodyChartService,
} from '@/lib/services/processo-clinico/body-chart-service'
import type {
  MapaBodyChartDTO,
  MapaBodyChartLightDTO,
  NotasBodyChartDTO,
  NotasBodyChartTableFilterRequest,
  CreateNotasBodyChartRequest,
  UpdateNotasBodyChartRequest,
  DeleteMultipleNotasBodyChartRequest,
} from '@/types/dtos/processo-clinico/body-chart.dtos'

type NotasFilters = NotasBodyChartTableFilterRequest['filters']

export function useMapaBodyChartLight() {
  return useQuery({
    queryKey: ['bodychart', 'mapas', 'light'],
    queryFn: async () => {
      const res = await MapaBodyChartService().getLight()
      return (res.info?.data ?? []) as MapaBodyChartLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useMapaBodyChartById(id?: string) {
  return useQuery({
    queryKey: ['bodychart', 'mapa', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null
      const res = await MapaBodyChartService().getById(id)
      return (res.info?.data ?? null) as MapaBodyChartDTO | null
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useNotasBodyChartByMapa(mapaBodyChartId?: string, tratamentoId?: string) {
  const pageNumber = 1
  const pageSize = 200

  const filters: NotasFilters = []
  if (mapaBodyChartId && mapaBodyChartId.length > 0) {
    filters.push({ id: 'mapaBodyChartId', value: mapaBodyChartId })
  }
  if (tratamentoId && tratamentoId.length > 0) {
    filters.push({ id: 'tratamentoId', value: tratamentoId })
  }

  const params: PaginatedRequest & { filters?: NotasFilters } = {
    pageNumber,
    pageSize,
    filters: filters.length > 0 ? (filters as unknown as Record<string, string> & NotasFilters) : undefined,
  }

  return useQuery({
    queryKey: ['bodychart', 'notas', mapaBodyChartId, tratamentoId],
    queryFn: async () => {
      const res = await NotasBodyChartService().getPaginated(params)
      return (res.info.data ?? []) as NotasBodyChartDTO[]
    },
    enabled: !!mapaBodyChartId && mapaBodyChartId.length > 0,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

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

