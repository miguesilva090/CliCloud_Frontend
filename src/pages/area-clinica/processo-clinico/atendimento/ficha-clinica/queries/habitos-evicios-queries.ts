import { useQuery } from '@tanstack/react-query'
import { HabitosEViciosService } from '@/lib/services/processo-clinico/habitos-evicios-service'
import type {
  HabitosEViciosTableFilterRequest,
  HabitosEViciosDTO,
} from '@/types/dtos/saude/habitos-e-vicios.dtos'

type Filters = HabitosEViciosTableFilterRequest['filters']

export function useGetHabitosEViciosByUtente(utenteId: string) {
  const pageNumber = 1
  const pageSize = 1

  const filters: Filters =
    utenteId.length > 0 ? [{ id: 'utenteId', value: utenteId }] : []

  return useQuery({
    queryKey: ['habitos-evicios', utenteId],
    queryFn: async (): Promise<HabitosEViciosDTO | null> => {
      const paginated = await HabitosEViciosService().getHabitosEViciosPaginated({
        pageNumber,
        pageSize,
        filters: filters.length > 0 ? filters : undefined,
      })
      const first = paginated.info?.data?.[0]
      if (!first?.id) return null
      const detail = await HabitosEViciosService().getById(first.id)
      return detail.info ?? null
    },
    enabled: utenteId.length > 0,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}

export { useSaveHabitosEVicios } from './habitos-evicios-mutations'
