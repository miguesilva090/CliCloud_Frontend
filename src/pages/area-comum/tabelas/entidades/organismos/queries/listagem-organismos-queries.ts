import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { OrganismoTableFilterRequest } from '@/types/dtos/saude/organismos.dtos'
import { OrganismoService } from '@/lib/services/saude/organismo-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetOrganismosPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting
) {
  const params: OrganismoTableFilterRequest = {
    pageNumber,
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
    sorting: sorting ?? undefined,
  }

  return useQuery({
    queryKey: ['organismos-paginated', params],
    queryFn: () =>
      OrganismoService('organismos').getOrganismosPaginated(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentOrganismos(
  page: number,
  pageSize: number,
  filters: Filters
) {
  const queryClient = useQueryClient()

  const baseParams = {
    pageSize,
    filters: (filters ?? []).filter((f) => f.value),
  }

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      const params: OrganismoTableFilterRequest = {
        ...baseParams,
        pageNumber: page - 1,
      }
      await queryClient.prefetchQuery({
        queryKey: ['organismos-paginated', params],
        queryFn: () =>
          OrganismoService('organismos').getOrganismosPaginated(params),
      })
    }
  }

  const prefetchNextPage = async () => {
    const params: OrganismoTableFilterRequest = {
      ...baseParams,
      pageNumber: page + 1,
    }
    await queryClient.prefetchQuery({
      queryKey: ['organismos-paginated', params],
      queryFn: () =>
        OrganismoService('organismos').getOrganismosPaginated(params),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}
