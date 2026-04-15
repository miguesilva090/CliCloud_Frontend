import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FeriadoService } from '@/lib/services/utility/feriados-service'
import type { FeriadoTableFilter } from '@/types/dtos/utility/feriado.dtos'

type Sorting = Array<{id: string, desc: boolean}> | null 
type Filters = Array<{id: string, value: string}> | null 

function mapFilters(filters: Filters): Partial<FeriadoTableFilter> {
    const f = (filters as unknown as Record<string, string>) ?? {}
    return {
        designacao: f.designacao || undefined,
    }
}

export function useGetFeriadosPaginated(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting,
) {
    const sort = sorting?.[0]
    const params: FeriadoTableFilter =  {
        pageNumber,
        pageSize,
        ...mapFilters(filters),
        sorting: sort ? [{ id: sort.id, desc: sort.desc }] : undefined,
    }

    return useQuery({
        queryKey: ['feriados-paginated', params],
        queryFn:  () => FeriadoService().getFeriadosPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function usePrefetchAdjacentFeriados(
    page: number,
    pageSize: number,
    filters: Filters,
) {
    const queryClient = useQueryClient()
    const baseParams =  {
        pageSize,
        ...mapFilters(filters),
    }

    const prefetchPreviousPage  = async () => {
        if(page > 1) {
            const params: FeriadoTableFilter = {
                ...baseParams,
                pageNumber: page - 1,
            }

            await queryClient.prefetchQuery({
                queryKey: ['feriados-paginated', params],
                queryFn: () => FeriadoService().getFeriadosPaginated(params),
            })
        }
    }

    const prefetchNextPage = async () => {
        const params: FeriadoTableFilter = {
            ...baseParams,
            pageNumber: page + 1,
        }

        await queryClient.prefetchQuery({
            queryKey: ['feriados-paginated', params],
            queryFn: () => FeriadoService().getFeriadosPaginated(params),
        })
    }

    return { prefetchPreviousPage, prefetchNextPage }
}