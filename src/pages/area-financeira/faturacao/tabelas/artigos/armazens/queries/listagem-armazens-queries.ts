import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { ArmazemPaginatedRequest } from "@/types/dtos/stocks/armazem.dtos"
import { ArmazemService } from "@/lib/services/stocks/armazem-service"

type Sorting = Array<{id: string, desc: boolean}> | null
type Filters = Array<{id: string, value: string}> | null


export function useGetArmazensPaginated(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting,
    armazemGeral: boolean | undefined,
)
{
    const params: ArmazemPaginatedRequest = {
        pageNumber,
        pageSize,
        filters: filters ?? undefined,
        sorting: sorting ?? undefined,
        armazemGeral,
    }

    return useQuery({
        queryKey: ['armazens-paginated', params],
        queryFn: () => ArmazemService().getArmazensPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function usePrefetchAdjacentArmazens(
    page: number,
    pageSize: number,
    filters: Filters,
    armazemGeral: boolean | undefined,
)
{
    const queryClient = useQueryClient()

    const baseParams: Omit<ArmazemPaginatedRequest, 'pageNumber' > = {
        pageSize,
        filters: filters ?? undefined,
        armazemGeral,
    }

    const prefetchPreviousPage = async () => {
        if (page > 1) {
            const params: ArmazemPaginatedRequest = {
                ...baseParams,
                pageNumber: page - 1,
            }
            await queryClient.prefetchQuery({
                queryKey: ['armazens-paginated', params],
                queryFn: () => ArmazemService().getArmazensPaginated(params),
            })
        }
    }

    const prefetchNextPage = async () => {
        const params: ArmazemPaginatedRequest = {
            ...baseParams,
            pageNumber: page + 1,
        }
        await queryClient.prefetchQuery({
            queryKey: ['armazens-paginated', params],
            queryFn: () => ArmazemService().getArmazensPaginated(params),
        })
    }

    return { prefetchPreviousPage, prefetchNextPage }
}
