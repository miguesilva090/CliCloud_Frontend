import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ConcelhosService } from '@/lib/services/base/concelhos-service'

export const useGetConcelhosPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  return useQuery({
    queryKey: ['concelhos-paginated', pageNumber, pageLimit, filters, sorting],
    queryFn: () =>
      ConcelhosService('concelhos').getConcelhosPaginated({
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

export const usePrefetchAdjacentConcelhos = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      await queryClient.prefetchQuery({
        queryKey: ['concelhos-paginated', page - 1, pageSize, filters, null],
        queryFn: () =>
          ConcelhosService('concelhos').getConcelhosPaginated({
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
      queryKey: ['concelhos-paginated', page + 1, pageSize, filters, null],
      queryFn: () =>
        ConcelhosService('concelhos').getConcelhosPaginated({
          pageNumber: page + 1,
          pageSize: pageSize,
          filters: (filters as unknown as Record<string, string>) ?? undefined,
          sorting: undefined,
        }),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export const useGetConcelhos = () => {
  return useQuery({
    queryKey: ['concelhos'],
    queryFn: () => ConcelhosService('concelhos').getConcelhos(),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useGetConcelhosCount = () => {
  return useQuery({
    queryKey: ['concelhos-count'],
    queryFn: async () => {
      const response = await ConcelhosService('concelhos').getConcelhos()
      return response.info?.data?.length || 0
    },
  })
}

/**
 * Hook to fetch concelhos for select/dropdown lists.
 * Uses the lightweight endpoint for better performance.
 * @param keyword - Optional keyword for filtering concelhos
 */
export const useGetConcelhosSelect = (keyword?: string) => {
  return useQuery({
    queryKey: ['concelhos-select', keyword],
    queryFn: async () => {
      const response =
        await ConcelhosService('concelhos').getConcelhosLight(keyword)
      const data = response.info.data || []
      return data.sort((a, b) => a.nome.localeCompare(b.nome))
    },
    staleTime: 30000,
  })
}

export const useGetConcelho = (id: string) => {
  return useQuery({
    queryKey: ['concelho', id],
    queryFn: async () => {
      const response = await ConcelhosService('concelhos').getConcelho(id)
      return response.info?.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useGetAllConcelhos = (
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['concelhos-all', filters, sorting],
    queryFn: () =>
      ConcelhosService('concelhos').getAllConcelhos(
        (filters as unknown as Record<string, string>) ?? undefined,
        sorting ?? undefined
      ),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useFetchAllConcelhosForPrint = () => {
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
      queryKey: ['concelhos-all', sanitizedFilters, sorting],
      queryFn: () =>
        ConcelhosService('concelhos').getAllConcelhos(
          (sanitizedFilters as unknown as Record<string, string>) ?? undefined,
          sorting?.length ? sorting : undefined
        ),
      staleTime: 0,
    })

    return response.info?.data || []
  }
}
