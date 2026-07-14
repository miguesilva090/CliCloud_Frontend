import { useQuery } from '@tanstack/react-query'
import {
  MapaBodyChartService,
  NotasBodyChartService,
} from '@/lib/services/processo-clinico/body-chart-service'
import type {
  MapaBodyChartDTO,
  MapaBodyChartLightDTO,
  NotasBodyChartDTO,
  NotasBodyChartTableFilterRequest,
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

  return useQuery({
    queryKey: ['bodychart', 'notas', mapaBodyChartId, tratamentoId],
    queryFn: async () => {
      const res = await NotasBodyChartService().getPaginated({
        pageNumber,
        pageSize,
        filters: filters.length > 0 ? filters : undefined,
      })
      return (res.info?.data ?? []) as NotasBodyChartDTO[]
    },
    enabled: !!mapaBodyChartId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export {
  useSaveNotaBodyChart,
  useDeleteNotaBodyChart,
  useDeleteMultipleNotasBodyChart,
} from './body-chart-mutations'
