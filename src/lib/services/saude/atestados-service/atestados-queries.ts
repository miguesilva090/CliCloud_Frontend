import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  AtestadoTableFilterRequest,
  CreateAtestadoRequest,
} from '@/types/dtos/saude/atestados.dtos'
import { ResponseStatus } from '@/types/api/responses'
import { AtestadosService } from './index'
import { toast } from '@/utils/toast-utils'

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
    staleTime: 30_000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateAtestado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAtestadoRequest) =>
      AtestadosService('saude').createAtestado(payload),
    onSuccess: (response) => {
      const info = response.info
      if (info.status === ResponseStatus.Success) {
        toast.success('Atestado criado com sucesso')
        queryClient.invalidateQueries({ queryKey: ['atestados-paginated'] })
        return
      }
      const firstError =
        info.messages?.['$']?.[0] ||
        Object.values(info.messages || {})?.[0]?.[0] ||
        'Falha ao criar atestado'
      toast.error(firstError)
    },
    onError: () => {
      toast.error('Falha ao criar atestado')
    },
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
