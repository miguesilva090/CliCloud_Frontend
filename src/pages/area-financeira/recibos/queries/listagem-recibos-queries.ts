import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { ReciboService } from '@/lib/services/faturacao/recibo-service'
import type {
  ReciboAllFilter,
  ReciboTableFilter,
} from '@/types/dtos/faturacao/recibo.dtos'

type Sorting = Array<{ id: string; desc: boolean}> | null
type Filters = Array<{ id: string; value: string}> | null

export const reciboQueryKeys = {
    all: ['recibos'] as const,
    list: (keyword:string) => ['recibos', 'list', keyword] as const,
    light: (keyword:string) => ['recibos', 'light', keyword] as const,
    paginated: (params: ReciboTableFilter) => ['recibos', 'paginated', params] as const,
    allFiltered: (params: ReciboAllFilter) => ['recibos', 'all-filtered', params] as const,
    byId: (id:string) => ['recibos', 'by-id', id] as const,
}

export function useGetRecibos(keyword = '', idFuncionalidade = '') {
    return useQuery({
        queryKey: reciboQueryKeys.list(keyword),
        queryFn: () => ReciboService(idFuncionalidade).getRecibos(keyword),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function useGetRecibosLight(keyword = '', idFuncionalidade = '') {
    return useQuery({
        queryKey: reciboQueryKeys.light(keyword),
        queryFn: () => ReciboService(idFuncionalidade).getRecibosLight(keyword),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function useGetRecibosPaginated(
    params: ReciboTableFilter,
    idFuncionalidade = '',
) {
    return useQuery({
        queryKey: reciboQueryKeys.paginated(params),
        queryFn: () => ReciboService(idFuncionalidade).getRecibosPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}
export function useGetRecibosAll(
    params: ReciboAllFilter,
    idFuncionalidade = '',
) {
    return useQuery({
        queryKey: reciboQueryKeys.allFiltered(params),
        queryFn: () => ReciboService(idFuncionalidade).getRecibosAll(params),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}
export function useGetReciboById(
    id: string,
    idFuncionalidade = '',
) {
    return useQuery({
        queryKey: reciboQueryKeys.byId(id),
        queryFn: () => ReciboService(idFuncionalidade).getReciboById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}
export function useGetRecibosPaginatedPageData(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting,
    idFuncionalidade = '',
){
    const params: PaginatedRequest = {
        pageNumber,
        pageSize,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
        sorting: sorting ?? undefined,
    }

    return useGetRecibosPaginated(params, idFuncionalidade)
}
export function usePrefetchAdjacentRecibos(
    page: number,
    pageSize: number,
    filters: Filters,
    sorting?: Sorting,
    idFuncionalidade = '',
) {
    const queryClient = useQueryClient()

    const baseParams = {
        pageSize,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
        sorting: sorting ?? undefined,
    }

    const prefetchPreviousPage = async () => {
        if(page > 1) {
            const params: PaginatedRequest = {
                ...baseParams,
                pageNumber: page - 1, 
            }
            await queryClient.prefetchQuery({
                queryKey: reciboQueryKeys.paginated(params),
                queryFn: () => ReciboService(idFuncionalidade).getRecibosPaginated(params),
            })
        }
    }

    const prefetchNextPage = async () => {
        const params: PaginatedRequest = {
            ...baseParams,
            pageNumber: page + 1,
        }
        await queryClient.prefetchQuery({
            queryKey: reciboQueryKeys.paginated(params),
            queryFn: () => ReciboService(idFuncionalidade).getRecibosPaginated(params),
        })
    }

    return { prefetchPreviousPage, prefetchNextPage}
}

export { useInvalidateRecibosMutation } from './listagem-recibos-mutations'
