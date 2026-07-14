import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { AtestadoTableFilterRequest } from '@/types/dtos/saude/atestados.dtos'
import { AtestadosService } from '@/lib/services/saude/atestados-service'

export function useGetAtestadosPaginated(
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) {
  const params: AtestadoTableFilterRequest = {
    pageNumber,
    pageSize: pageLimit,
    sorting: sorting ?? undefined,
    filters: (filters ?? []).filter((f) => f.value),
  }

  return useQuery({
    queryKey: ['atestados-paginated', params],
    queryFn: () => AtestadosService('saude').getAtestadosPaginated(params),
    placeholderData: (previousData) => previousData,
  })
}

export function usePrefetchAdjacentAtestados(
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: AtestadoTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['atestados-paginated', params],
        queryFn: () => AtestadosService('saude').getAtestadosPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: AtestadoTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['atestados-paginated', params],
      queryFn: () => AtestadosService('saude').getAtestadosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export {
  useCreateAtestado,
  useReenviarAtestadoOffline,
  useReenviarPendentesOffline,
  useObterErroComunicacao,
} from './atestados-mutations'
