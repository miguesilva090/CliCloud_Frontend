import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RuasService } from '@/lib/services/base/ruas-service'

export const useGetRuasPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  return useQuery({
    queryKey: ['ruas-paginated', pageNumber, pageLimit, filters, sorting],
    queryFn: () =>
      RuasService('ruas').getRuasPaginated({
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

export const usePrefetchAdjacentRuas = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      await queryClient.prefetchQuery({
        queryKey: ['ruas-paginated', page - 1, pageSize, filters, null],
        queryFn: () =>
          RuasService('ruas').getRuasPaginated({
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
      queryKey: ['ruas-paginated', page + 1, pageSize, filters, null],
      queryFn: () =>
        RuasService('ruas').getRuasPaginated({
          pageNumber: page + 1,
          pageSize: pageSize,
          filters: (filters as unknown as Record<string, string>) ?? undefined,
          sorting: undefined,
        }),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export const useGetRuas = () => {
  return useQuery({
    queryKey: ['ruas'],
    queryFn: () => RuasService('ruas').getRuas(),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useGetRuasCount = () => {
  return useQuery({
    queryKey: ['ruas-count'],
    queryFn: async () => {
      const response = await RuasService('ruas').getRuas()
      return response.info?.data?.length || 0
    },
  })
}

/**
 * Hook to fetch ruas for select/dropdown lists.
 * Uses the lightweight endpoint for better performance.
 * @param keyword - Optional keyword for filtering ruas
 */
export const useGetRuasSelect = (keyword?: string) => {
  return useQuery({
    queryKey: ['ruas-select', keyword],
    queryFn: async () => {
      const response = await RuasService('ruas').getRuasLight(keyword)
      const data = response.info.data || []
      return data.sort((a, b) => a.nome.localeCompare(b.nome))
    },
  })
}

export const useGetRua = (id: string) => {
  return useQuery({
    queryKey: ['rua', id],
    queryFn: () => RuasService('ruas').getRua(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useFetchAllRuasForPrint = () => {
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
      queryKey: ['ruas-all', sanitizedFilters, sorting],
      queryFn: () =>
        RuasService('ruas').getAllRuas(
          (sanitizedFilters as unknown as Record<string, string>) ?? undefined,
          sorting?.length ? sorting : undefined
        ),
      staleTime: 0,
    })

    return response.info?.data || []
  }
}
