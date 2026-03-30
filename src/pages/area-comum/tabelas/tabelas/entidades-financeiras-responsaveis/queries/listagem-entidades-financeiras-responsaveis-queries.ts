import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EntidadesFinanceirasService } from '@/lib/services/utility/entidades-financeiras-service'
import type { PaginatedRequest } from '@/types/api/responses'

export const useGetEntidadesFinanceirasPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null,
) => {
  const params: PaginatedRequest = {
    pageNumber,
    pageSize: pageLimit,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['entidades-financeiras-paginated', params],
    queryFn: () =>
      EntidadesFinanceirasService(
        'entidades-financeiras-responsaveis',
      ).getEntidadesFinanceirasPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const usePrefetchAdjacentEntidadesFinanceiras = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
) => {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: PaginatedRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['entidades-financeiras-paginated', params],
        queryFn: () =>
          EntidadesFinanceirasService(
            'entidades-financeiras-responsaveis',
          ).getEntidadesFinanceirasPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: PaginatedRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['entidades-financeiras-paginated', params],
      queryFn: () =>
        EntidadesFinanceirasService(
          'entidades-financeiras-responsaveis',
        ).getEntidadesFinanceirasPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

