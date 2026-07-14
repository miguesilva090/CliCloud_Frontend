import { useQuery } from '@tanstack/react-query'
import { GlicemiaCapilarService } from '@/lib/services/processo-clinico/sinais-vitais/glicemia-capilar-service'

import type {
  CreateGlicemiaCapilarRequest,
  GlicemiaCapilarTableFilterRequest,
  UpdateGlicemiaCapilarRequest,
} from '@/types/dtos/sinais-vitais/glicemia-capilar.dtos'

type Filters = GlicemiaCapilarTableFilterRequest['filters']

export function useGetGlicemiaCapilarPaginated(
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
    queryKey: ['glicemia-capilar', 'paginated', utenteId, pageNumber, pageSize],
    queryFn: () => GlicemiaCapilarService().getPaginated(params),
    enabled: utenteId.length > 0,
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateGlicemiaCapilar, useUpdateGlicemiaCapilar, useDeleteGlicemiaCapilar } from './glicemia-capilar-mutations'
