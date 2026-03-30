import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TipoEntidadeFinanceiraService } from '@/lib/services/utility/tipo-entidade-financeira-service'

export const useGetTiposEntidadePaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null,
) => {
  return useQuery({
    queryKey: ['tipos-entidade-paginated', pageNumber, pageLimit, filters, sorting],
    queryFn: () =>
      TipoEntidadeFinanceiraService('tipos-entidade').getTiposEntidadePaginated({
        pageNumber,
        pageSize: pageLimit,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
        sorting: sorting ?? undefined,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const usePrefetchAdjacentTiposEntidade = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null,
) => {
  const queryClient = useQueryClient()

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      await queryClient.prefetchQuery({
        queryKey: ['tipos-entidade-paginated', page - 1, pageSize, filters, null],
        queryFn: () =>
          TipoEntidadeFinanceiraService('tipos-entidade').getTiposEntidadePaginated(
            {
              pageNumber: page - 1,
              pageSize,
              filters: (filters as unknown as Record<string, string>) ?? undefined,
              sorting: undefined,
            },
          ),
      })
    }
  }

  const prefetchNextPage = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['tipos-entidade-paginated', page + 1, pageSize, filters, null],
      queryFn: () =>
        TipoEntidadeFinanceiraService('tipos-entidade').getTiposEntidadePaginated(
          {
            pageNumber: page + 1,
            pageSize,
            filters: (filters as unknown as Record<string, string>) ?? undefined,
            sorting: undefined,
          },
        ),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

