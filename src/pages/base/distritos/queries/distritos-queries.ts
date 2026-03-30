import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DistritosService } from '@/lib/services/base/distritos-service'

export const useGetDistritosPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  return useQuery({
    queryKey: ['distritos-paginated', pageNumber, pageLimit, filters, sorting],
    queryFn: () =>
      DistritosService('distritos').getDistritosPaginated({
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

export const usePrefetchAdjacentDistritos = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      await queryClient.prefetchQuery({
        queryKey: ['distritos-paginated', page - 1, pageSize, filters, null],
        queryFn: () =>
          DistritosService('distritos').getDistritosPaginated({
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
      queryKey: ['distritos-paginated', page + 1, pageSize, filters, null],
      queryFn: () =>
        DistritosService('distritos').getDistritosPaginated({
          pageNumber: page + 1,
          pageSize: pageSize,
          filters: (filters as unknown as Record<string, string>) ?? undefined,
          sorting: undefined,
        }),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export const useGetDistritos = () => {
  return useQuery({
    queryKey: ['distritos'],
    queryFn: () => DistritosService('distritos').getDistritos(),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useGetDistritosCount = () => {
  return useQuery({
    queryKey: ['distritos-count'],
    queryFn: async () => {
      const response = await DistritosService('distritos').getDistritos()
      return response.info?.data?.length || 0
    },
  })
}

/**
 * Hook to fetch distritos for select/dropdown lists.
 * Uses the lightweight endpoint for better performance.
 * @param keyword - Optional keyword for filtering distritos
 * @param paisId - Optional paisId for filtering distritos by country
 */
export const useGetDistritosSelect = (keyword?: string, paisId?: string) => {
  return useQuery({
    queryKey: ['distritos-select', keyword, paisId],
    queryFn: async () => {
      const response = await DistritosService('distritos').getDistritosLight(
        keyword,
        paisId
      )
      const data = response.info.data || []
      return data.sort((a, b) => a.nome.localeCompare(b.nome))
    },
    staleTime: 30000,
  })
}

export const useGetDistrito = (id: string) => {
  return useQuery({
    queryKey: ['distrito', id],
    queryFn: async () => {
      const response = await DistritosService('distritos').getDistrito(id)
      return response.info.data
    },
    enabled: !!id,
  })
}

export const useGetAllDistritos = (
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['distritos-all', filters, sorting],
    queryFn: () =>
      DistritosService('distritos').getAllDistritos(
        (filters as unknown as Record<string, string>) ?? undefined,
        sorting ?? undefined
      ),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useFetchAllDistritosForPrint = () => {
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
      queryKey: ['distritos-all', sanitizedFilters, sorting],
      queryFn: () =>
        DistritosService('distritos').getAllDistritos(
          (sanitizedFilters as unknown as Record<string, string>) ?? undefined,
          sorting?.length ? sorting : undefined
        ),
      staleTime: 0,
    })

    return response.info?.data || []
  }
}
