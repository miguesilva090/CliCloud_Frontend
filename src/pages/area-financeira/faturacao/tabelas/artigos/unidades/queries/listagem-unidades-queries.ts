import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { UnidadeMedidaPaginatedRequest } from '@/types/dtos/stocks/unidade-medida.dtos'
import { UnidadeMedidaService } from '@/lib/services/stocks/unidade-medida-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetUnidadesMedidaPaginated(
    pageNumber: number,
    pageSize: number,
    filters: Filters,
    sorting: Sorting,
) {
    const params: UnidadeMedidaPaginatedRequest = {
        pageNumber,
        pageSize,
        filters: filters ?? undefined,
        sorting: sorting ?? undefined,
    }

    return useQuery({
        queryKey: ['unidades-medida-paginated', params],
        queryFn: () => UnidadeMedidaService().getUnidadesMedidaPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function usePrefetchAdjacentUnidadesMedida(
    page: number,
    pageSize: number,
    filters: Filters,
) {
    const queryClient = useQueryClient()

    const baseParams: Omit<UnidadeMedidaPaginatedRequest, 'pageNumber'> = {
        pageSize,
        filters: filters ?? undefined,
    }

    const prefetchPreviousPage = async () => {
        if (page > 1) {
            const params: UnidadeMedidaPaginatedRequest = {
                ...baseParams,
                pageNumber: page - 1,
            }
            await queryClient.prefetchQuery({
                queryKey: ['unidades-medida-paginated', params],
                queryFn: () =>
                    UnidadeMedidaService().getUnidadesMedidaPaginated(params),
            })
        }
    }

    const prefetchNextPage = async () => {
        const params: UnidadeMedidaPaginatedRequest = {
            ...baseParams,
            pageNumber: page + 1,
        }
        await queryClient.prefetchQuery({
            queryKey: ['unidades-medida-paginated', params],
            queryFn: () =>
                UnidadeMedidaService().getUnidadesMedidaPaginated(params),
        })
    }

    return { prefetchPreviousPage, prefetchNextPage }
}
