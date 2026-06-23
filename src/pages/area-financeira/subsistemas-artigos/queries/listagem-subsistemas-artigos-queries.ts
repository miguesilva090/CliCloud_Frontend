import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import type { SubsistemaArtigoPaginatedRequest } from '@/types/dtos/stocks/subsistema-artigo.dtos'
import { SubsistemaArtigoService } from '@/lib/services/stocks/subsistema-artigo-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

const QUERY_KEY = 'subsistemas-artigo-paginated'

export function useGetSubsistemasArtigoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const [searchParams] = useSearchParams()
  const organismoIdFromUrl = searchParams.get('organismoId') ?? undefined

  const params: SubsistemaArtigoPaginatedRequest = {
    pageNumber,
    pageSize,
    filters: filters ?? undefined,
    sorting: sorting ?? undefined,
    organismoId: organismoIdFromUrl || undefined,
  }

  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => SubsistemaArtigoService().getSubsistemaArtigoPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentSubsistemasArtigo(
  page: number,
  pageSize: number,
  filters: Filters,
) {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const organismoIdFromUrl = searchParams.get('organismoId') ?? undefined

  const base: Omit<SubsistemaArtigoPaginatedRequest, 'pageNumber'> = {
    pageSize,
    filters: filters ?? undefined,
    organismoId: organismoIdFromUrl || undefined,
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params = { ...base, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: [QUERY_KEY, params],
        queryFn: () =>
          SubsistemaArtigoService().getSubsistemaArtigoPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params = { ...base, pageNumber: page + 1 }
    await queryClient.prefetchQuery({
      queryKey: [QUERY_KEY, params],
      queryFn: () =>
        SubsistemaArtigoService().getSubsistemaArtigoPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
