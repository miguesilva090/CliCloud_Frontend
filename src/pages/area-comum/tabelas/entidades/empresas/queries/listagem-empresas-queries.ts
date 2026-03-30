import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { EmpresaTableFilterRequest } from '@/types/dtos/saude/empresas.dtos'
import { EmpresaService } from '@/lib/services/saude/empresa-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetEmpresasPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: EmpresaTableFilterRequest = {
    pageNumber,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['empresas-paginated', params],
    queryFn: () =>
      EmpresaService('empresas').getEmpresasPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentEmpresas(
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
      const params: EmpresaTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['empresas-paginated', params],
        queryFn: () =>
          EmpresaService('empresas').getEmpresasPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: EmpresaTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['empresas-paginated', params],
      queryFn: () =>
        EmpresaService('empresas').getEmpresasPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

