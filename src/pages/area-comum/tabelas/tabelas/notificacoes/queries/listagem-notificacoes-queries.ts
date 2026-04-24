import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificacaoPaginatedRequest } from '@/lib/services/notificacoes/notificacao-service/notificacao-client'
import { NotificacaoService } from '@/lib/services/notificacoes/notificacao-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetNotificacoesPaginated(
  listMode: number,
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params: NotificacaoPaginatedRequest = {
    listMode,
    pageNumber,
    pageSize,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['notificacoes-paginated', listMode, params],
    queryFn: () => NotificacaoService().getNotificacoesPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function createUseNotificacoesPaginatedForMode(listMode: number) {
  return function useNotificacoesPaginatedForMode(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting,
  ) {
    return useGetNotificacoesPaginated(
      listMode,
      pageNumber,
      pageSize,
      filters,
      sorting,
    )
  }
}

export function usePrefetchAdjacentNotificacoes(
  listMode: number,
  page: number,
  pageSize: number,
  filters: Filters,
) {
  const queryClient = useQueryClient()

  const baseParams = {
    listMode,
    pageSize,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: NotificacaoPaginatedRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['notificacoes-paginated', listMode, params],
        queryFn: () => NotificacaoService().getNotificacoesPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: NotificacaoPaginatedRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['notificacoes-paginated', listMode, params],
      queryFn: () => NotificacaoService().getNotificacoesPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export function createPrefetchNotificacoesForMode(listMode: number) {
  return function usePrefetchNotificacoesForMode(
    page: number,
    pageSize: number,
    filters: Filters,
  ) {
    return usePrefetchAdjacentNotificacoes(listMode, page, pageSize, filters)
  }
}
