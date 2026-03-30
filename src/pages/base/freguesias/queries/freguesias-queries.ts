import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FreguesiasService } from '@/lib/services/base/freguesias-service'

export const useGetFreguesiasPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  return useQuery({
    queryKey: ['freguesias-paginated', pageNumber, pageLimit, filters, sorting],
    queryFn: () =>
      FreguesiasService('freguesias').getFreguesiasPaginated({
        pageNumber: pageNumber,
        pageSize: pageLimit,
        filters: (filters as unknown as Record<string, string>) ?? undefined,
        sorting: sorting ?? undefined,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const usePrefetchAdjacentFreguesias = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      await queryClient.prefetchQuery({
        queryKey: ['freguesias-paginated', page - 1, pageSize, filters, null],
        queryFn: () =>
          FreguesiasService('freguesias').getFreguesiasPaginated({
            pageNumber: page - 1,
            pageSize: pageSize,
            filters:
              (filters as unknown as Record<string, string>) ?? undefined,
            sorting: undefined,
          }),
      })
    }
  }

  const prefetchNextPage = async () => {
    await queryClient.prefetchQuery({
      queryKey: ['freguesias-paginated', page + 1, pageSize, filters, null],
      queryFn: () =>
        FreguesiasService('freguesias').getFreguesiasPaginated({
          pageNumber: page + 1,
          pageSize: pageSize,
          filters: (filters as unknown as Record<string, string>) ?? undefined,
          sorting: undefined,
        }),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export const useGetAllFreguesias = (
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['freguesias-all', filters, sorting],
    queryFn: () =>
      FreguesiasService('freguesias').getAllFreguesias(
        (filters as unknown as Record<string, string>) ?? undefined,
        sorting ?? undefined
      ),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useFetchAllFreguesiasForPrint = () => {
  const queryClient = useQueryClient()

  return async ({
    filters,
    sorting,
  }: {
    filters: Array<{ id: string; value: string }>
    sorting: Array<{ id: string; desc: boolean }>
  }) => {
    const sanitizedFilters = filters?.filter((filter) => filter.value) || []

    const response = await queryClient.fetchQuery({
      queryKey: ['freguesias-all', sanitizedFilters, sorting],
      queryFn: () =>
        FreguesiasService('freguesias').getAllFreguesias(
          (sanitizedFilters as unknown as Record<string, string>) ?? undefined,
          sorting?.length ? sorting : undefined
        ),
      staleTime: 0,
    })

    return response.info?.data || []
  }
}

export const useGetFreguesias = () => {
  return useQuery({
    queryKey: ['freguesias'],
    queryFn: () => FreguesiasService('freguesias').getFreguesias(),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useGetFreguesiasCount = () => {
  return useQuery({
    queryKey: ['freguesias-count'],
    queryFn: async () => {
      const response = await FreguesiasService('freguesias').getFreguesias()
      return response.info?.data?.length || 0
    },
  })
}

/**
 * Hook to fetch freguesias for select/dropdown lists.
 * Uses the lightweight endpoint for better performance.
 * @param keyword - Optional keyword for filtering freguesias
 */
export const useGetFreguesiasSelect = (keyword?: string) => {
  return useQuery({
    queryKey: ['freguesias-select', keyword],
    queryFn: async () => {
      const response =
        await FreguesiasService('freguesias').getFreguesiasLight(keyword)
      const data = response.info.data || []
      return data.sort((a, b) => a.nome.localeCompare(b.nome))
    },
    staleTime: 30000,
  })
}

export const useGetFreguesia = (id: string) => {
  return useQuery({
    queryKey: ['freguesia', id],
    queryFn: async () => {
      const response = await FreguesiasService('freguesias').getFreguesia(id)
      return response.info?.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
