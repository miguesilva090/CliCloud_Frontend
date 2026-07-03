import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { EstadosDentariosService } from '@/lib/services/processo-clinico/odontologia/estados-dentarios-service'
import { modules } from '@/config/modules'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

const permId = modules.areaClinica.permissions.estadosDentarios.id
const service = () => EstadosDentariosService(permId)

function buildKeyword(filters: Filters): string | undefined {
  if (!filters?.length) return undefined
  const descricao = filters.find((f) => f.id === 'descricao')?.value?.trim()
  const codigo = filters.find((f) => f.id === 'codigo')?.value?.trim()
  return descricao || codigo || undefined
}

function buildPaginatedParams(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
): PaginatedRequest & { keyword?: string } {
  const keyword = buildKeyword(filters)
  return {
    pageNumber,
    pageSize,
    sorting: sorting ?? undefined,
    ...(keyword ? { keyword } : {}),
  }
}

export function useGetEstadosDentariosPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params = buildPaginatedParams(pageNumber, pageSize, filters, sorting)

  return useQuery({
    queryKey: ['estados-dentarios-paginated', params],
    queryFn: () => service().getPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentEstadosDentarios(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    keyword: buildKeyword(filters),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params = { ...baseParams, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: ['estados-dentarios-paginated', params],
        queryFn: () => service().getPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params = { ...baseParams, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: ['estados-dentarios-paginated', params],
      queryFn: () => service().getPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
