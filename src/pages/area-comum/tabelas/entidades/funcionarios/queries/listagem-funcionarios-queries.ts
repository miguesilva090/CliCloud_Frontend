import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FuncionarioTableFilterRequest } from '@/types/dtos/saude/funcionarios.dtos'
import { FuncionarioService } from '@/lib/services/saude/funcionario-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetFuncionariosPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: FuncionarioTableFilterRequest = {
    pageNumber,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['funcionarios-paginated', params],
    queryFn: () =>
      FuncionarioService('funcionarios').getFuncionariosPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentFuncionarios(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: FuncionarioTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['funcionarios-paginated', params],
        queryFn: () =>
          FuncionarioService('funcionarios').getFuncionariosPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: FuncionarioTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['funcionarios-paginated', params],
      queryFn: () =>
        FuncionarioService('funcionarios').getFuncionariosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
