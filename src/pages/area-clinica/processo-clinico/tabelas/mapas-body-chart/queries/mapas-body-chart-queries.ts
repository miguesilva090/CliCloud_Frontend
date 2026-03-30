import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { MapaBodyChartService } from '@/lib/services/processo-clinico/body-chart-service'
import type { MapaBodyChartTableFilterRequest } from '@/types/dtos/processo-clinico/body-chart.dtos'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetMapasBodyChartPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params: PaginatedRequest & { filters?: MapaBodyChartTableFilterRequest['filters'] } = {
    pageNumber,
    pageSize,
    filters: (filters as unknown as MapaBodyChartTableFilterRequest['filters']) ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['mapas-body-chart-paginated', params],
    queryFn: () => MapaBodyChartService().getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentMapasBodyChart(
  page: number,
  pageSize: number,
  filters: Filters,
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters as unknown as MapaBodyChartTableFilterRequest['filters']) ?? undefined,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: PaginatedRequest & {
        filters?: MapaBodyChartTableFilterRequest['filters']
      } = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['mapas-body-chart-paginated', params],
        queryFn: () => MapaBodyChartService().getPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest & {
      filters?: MapaBodyChartTableFilterRequest['filters']
    } = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['mapas-body-chart-paginated', params],
      queryFn: () => MapaBodyChartService().getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

