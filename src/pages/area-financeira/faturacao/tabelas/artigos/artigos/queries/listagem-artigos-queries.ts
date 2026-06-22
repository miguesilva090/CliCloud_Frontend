import { useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ArtigoPaginatedRequest,
  TipoArtigoStocks,
} from '@/types/dtos/stocks/artigo.dtos'
import { ArtigoService } from '@/lib/services/stocks/artigo-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetArtigosPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
  inativo: boolean | undefined,
  descontinuado: boolean | undefined,
  tipoArtigo: TipoArtigoStocks | undefined,
) {
  const params: ArtigoPaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    inativo,
    descontinuado,
    tipoArtigo,
  }

  return useQuery({
    queryKey: ['artigos-paginated', params],
    queryFn: () => ArtigoService().getArtigosPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentArtigos(
  page: number,
  pageSize: number,
  filters: Filters,
  inativo: boolean | undefined,
  descontinuado: boolean | undefined,
  tipoArtigo: TipoArtigoStocks | undefined,
) {
  const queryClient = useQueryClient()

  const baseParams: Omit<ArtigoPaginatedRequest, 'pageNumber'> = {
    pageSize,
    filters: filters ?? undefined,
    inativo,
    descontinuado,
    tipoArtigo,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: ArtigoPaginatedRequest = { ...baseParams, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: ['artigos-paginated', params],
        queryFn: () => ArtigoService().getArtigosPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: ArtigoPaginatedRequest = { ...baseParams, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: ['artigos-paginated', params],
      queryFn: () => ArtigoService().getArtigosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
