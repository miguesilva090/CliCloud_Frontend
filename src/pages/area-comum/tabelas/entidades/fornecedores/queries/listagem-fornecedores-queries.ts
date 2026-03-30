import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FornecedorTableFilterRequest } from '@/types/dtos/saude/fornecedores.dtos'
import { FornecedorService } from '@/lib/services/saude/fornecedor-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetFornecedoresPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: FornecedorTableFilterRequest = {
    pageNumber,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['fornecedores-paginated', params],
    queryFn: () =>
      FornecedorService('fornecedores').getFornecedoresPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentFornecedores(
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
      const params: FornecedorTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['fornecedores-paginated', params],
        queryFn: () =>
          FornecedorService('fornecedores').getFornecedoresPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: FornecedorTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['fornecedores-paginated', params],
      queryFn: () =>
        FornecedorService('fornecedores').getFornecedoresPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
