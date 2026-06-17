import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { MotivoAltaService } from '@/lib/services/motivos-alta'


type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetMotivoAltaPaginated(
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
        queryKey: ['motivos-alta-paginated', params],
        queryFn: () => MotivoAltaService().getMotivoAltaPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function usePrefetchAdjacentMotivoAlta(
    page: number,
    pageSize: number,
    filters: Filters
) {
    const queryClient = useQueryClient()

    const baseParams = {
        pageSize,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
    }

    const prefetchPreviousPage = async () => {
        if (page > 1) {
            const params: PaginatedRequest = {
                ...baseParams,
                pageNumber: page - 1,
            }
            await queryClient.prefetchQuery({
                queryKey: ['motivos-alta-paginated', params],
                queryFn: () => MotivoAltaService().getMotivoAltaPaginated(params),
            })
        }
    }

    const prefetchNextPage = async () => {
        const params: PaginatedRequest = {
            ...baseParams,
            pageNumber: page + 1,
        }
        await queryClient.prefetchQuery({
            queryKey: ['motivos-alta-paginated', params],
            queryFn: () => MotivoAltaService().getMotivoAltaPaginated(params),
        })
    }

    return { prefetchPreviousPage, prefetchNextPage }
}