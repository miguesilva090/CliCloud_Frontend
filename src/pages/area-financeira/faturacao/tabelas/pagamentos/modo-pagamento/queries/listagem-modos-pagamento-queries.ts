import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ModoPagamentoPaginatedRequest } from '@/types/dtos/pagamentos/modo-pagamento.dtos'
import { ModoPagamentoService } from '@/lib/services/pagamentos/modo-pagamento-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetModosPagamentoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
  filtrarHistorico: boolean | undefined,
) {
  const params: ModoPagamentoPaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    filtrarHistorico,
  }

  return useQuery({
    queryKey: ['modos-pagamento-paginated', params],
    queryFn: () => ModoPagamentoService().getModosPagamentoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentModosPagamento(
  page: number,
  pageSize: number,
  filters: Filters,
  filtrarHistorico: boolean | undefined,
) {
  const queryClient = useQueryClient()

  const baseParams: Omit<ModoPagamentoPaginatedRequest, 'pageNumber'> = {
    pageSize,
    filters: filters ?? undefined,
    filtrarHistorico,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: ModoPagamentoPaginatedRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['modos-pagamento-paginated', params],
        queryFn: () => ModoPagamentoService().getModosPagamentoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: ModoPagamentoPaginatedRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['modos-pagamento-paginated', params],
      queryFn: () => ModoPagamentoService().getModosPagamentoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
