import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PaisesService } from '@/lib/services/base/paises-service'

export const useGetPaisesPaginated = (
  pageNumber: number,
  pageLimit: number,
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null
) => {
  return useQuery({
    queryKey: ['paises-paginated', pageNumber, pageLimit, filters, sorting],
    queryFn: () =>
      PaisesService('paises').getPaisesPaginated({
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

export const usePrefetchAdjacentPaises = (
  page: number,
  pageSize: number,
  filters: Array<{ id: string; value: string }> | null
) => {
  const queryClient = useQueryClient()

  const prefetchPreviousPage = async () => {
    if (page > 1) {
      await queryClient.prefetchQuery({
        queryKey: ['paises-paginated', page - 1, pageSize, filters, null],
        queryFn: () =>
          PaisesService('aplicacoes').getPaisesPaginated({
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
      queryKey: ['paises-paginated', page + 1, pageSize, filters, null],
      queryFn: () =>
        PaisesService('paises').getPaisesPaginated({
          pageNumber: page + 1,
          pageSize: pageSize,
          filters: (filters as unknown as Record<string, string>) ?? undefined,
          sorting: undefined,
        }),
    })
  }

  return { prefetchPreviousPage, prefetchNextPage }
}

export const useGetPaises = () => {
  return useQuery({
    queryKey: ['paises'],
    queryFn: () => PaisesService('paises').getPaises(),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useGetPaisesCount = () => {
  return useQuery({
    queryKey: ['paises-count'],
    queryFn: async () => {
      const response = await PaisesService('paises').getPaises()
      return response.info?.data?.length || 0
    },
  })
}

/**
 * Hook to fetch paises for select/dropdown lists.
 * Uses the lightweight endpoint for better performance.
 * @param keyword - Optional keyword for filtering paises
 */
export const useGetPaisesSelect = (keyword?: string) => {
  return useQuery({
    queryKey: ['paises-select', keyword],
    queryFn: async () => {
      const response = await PaisesService('paises').getPaisesLight(keyword)
      const data = response.info.data || []
      return data.sort((a, b) => a.nome.localeCompare(b.nome))
    },
  })
}

export const useGetPais = (id: string) => {
  return useQuery({
    queryKey: ['pais', id],
    queryFn: () => PaisesService('paises').getPais(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useGetAllPaises = (
  filters: Array<{ id: string; value: string }> | null,
  sorting: Array<{ id: string; desc: boolean }> | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['paises-all', filters, sorting],
    queryFn: () =>
      PaisesService('paises').getAllPaises(
        (filters as unknown as Record<string, string>) ?? undefined,
        sorting ?? undefined
      ),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useFetchAllPaisesForPrint = () => {
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
      queryKey: ['paises-all', sanitizedFilters, sorting],
      queryFn: () =>
        PaisesService('paises').getAllPaises(
          (sanitizedFilters as unknown as Record<string, string>) ?? undefined,
          sorting?.length ? sorting : undefined
        ),
      staleTime: 0,
    })

    return response.info?.data || []
  }
}
