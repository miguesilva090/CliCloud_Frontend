import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { FamiliaArtigoPaginatedRequest } from '@/types/dtos/stocks/familia-artigo.dtos'
import { FamiliaArtigoService } from '@/lib/services/stocks/familia-artigo-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetFamiliasArtigoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
  parentId?: string | null,
) {
  const params: FamiliaArtigoPaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    parentId: parentId ?? null,
  }

  return useQuery({
    queryKey: ['familias-artigo-paginated', params],
    queryFn: () => FamiliaArtigoService().getFamiliasArtigoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentFamiliasArtigo(
  page: number,
  pageSize: number,
  filters: Filters,
  parentId?: string | null,
) {
  const queryClient = useQueryClient()

  const baseParams: Omit<FamiliaArtigoPaginatedRequest, 'pageNumber'> = {
    pageSize,
    filters: filters ?? undefined,
    parentId: parentId ?? null,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: FamiliaArtigoPaginatedRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['familias-artigo-paginated', params],
        queryFn: () => FamiliaArtigoService().getFamiliasArtigoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: FamiliaArtigoPaginatedRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['familias-artigo-paginated', params],
      queryFn: () => FamiliaArtigoService().getFamiliasArtigoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export function useGetFamiliaArtigoAncestors(parentId?: string | null) {
  return useQuery({
    queryKey: ['familias-artigo-ancestors', parentId ?? null],
    queryFn: () => FamiliaArtigoService().getAncestors(parentId ?? null),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  })
}