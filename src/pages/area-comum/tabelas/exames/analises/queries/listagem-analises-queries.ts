import { useQuery , useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { AnalisesService } from '@/lib/services/exames/analises-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetAnalisesPaginated(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting
) {
    const params: PaginatedRequest = {
        pageNumber,
        pageSize,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
        sorting: sorting ?? undefined,
    }

    return useQuery({
        queryKey: ['analises-paginated', params],
        queryFn: () => AnalisesService().getAnalisesPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function usePrefetchAdjacentAnalises(
    page: number,
    pageSize: number, 
    filters: Filters,
) {
    const queryClient = useQueryClient()
    const baseParams = {
        pageSize,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
    }

    return {
        prefetchPreviousPage: async () => {
            if (page > 1) {
                await queryClient.prefetchQuery({
                    queryKey: ['analises-paginated', { ...baseParams, pageNumber: page - 1 }],
                    queryFn: () => AnalisesService().getAnalisesPaginated({ ...baseParams, pageNumber: page - 1 }),
                })
            }
        },
        prefetchNextPage: async () => {
            await queryClient.prefetchQuery({
                queryKey: ['analises-paginated', { ...baseParams, pageNumber: page + 1 }],
                queryFn: () => AnalisesService().getAnalisesPaginated({ ...baseParams, pageNumber: page + 1 }),
            })
        },
    }
}