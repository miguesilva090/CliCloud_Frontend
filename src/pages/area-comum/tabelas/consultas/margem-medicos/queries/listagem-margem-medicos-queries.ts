import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { MargemMedicoTableFilterRequest} from '@/types/dtos/saude/margem-medico.dtos'
import { MargemMedicoService } from '@/lib/services/saude/margem-medico-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null 

function buildParams(
    pageNumber: number, 
    pageSize: number, 
    filters: Filters, 
    sorting: Sorting
): MargemMedicoTableFilterRequest {
    return {
        pageNumber, 
        pageSize, 
        filters: filters ?? undefined,
        sorting: sorting ?? undefined,
    }
}

export function useGetMargemMedicosPaginated(
    pageNumber: number, 
    pageSize: number, 
    filters: Filters, 
    sorting: Sorting 
) {
    const params = buildParams(pageNumber, pageSize, filters, sorting)

    return useQuery({
        queryKey: ['margem-medico-paginated', params],
        queryFn: () => MargemMedicoService().getMargemMedicoPaginated(params),
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    })
}

export function usePrefetchAdjacentMargemMedicos(
    page: number, 
    pageSize: number, 
    filters: Filters,
    sorting: Sorting
) {
    const queryClient = useQueryClient()

    const prefetchPreviousPage = async () => {
        if (page > 1) {
            const params = buildParams(page - 1, pageSize, filters, sorting)
            await queryClient.prefetchQuery({
                queryKey: ['margem-medico-paginated', params],
                queryFn: () => MargemMedicoService().getMargemMedicoPaginated(params)
            })
        }
    }

    const prefetchNextPage = async () => {
        const params = buildParams(page + 1, pageSize, filters, sorting)
        await queryClient.prefetchQuery({
            queryKey: ['margem-medico-paginated', params],
            queryFn: () => MargemMedicoService().getMargemMedicoPaginated(params)
        })
    }

    return {prefetchPreviousPage, prefetchNextPage}
}