import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreatePaisDTO, UpdatePaisDTO } from '@/types/dtos/base/paises.dtos'
import { PaisesService } from '@/lib/services/base/paises-service'
import { invalidateQueriesGlobally } from '@/utils/query-sync'

export const useDeletePais = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => PaisesService('paises').deletePais(id),
    onSuccess: (_, id) => {
      invalidateQueriesGlobally(queryClient, [
        ['paises-paginated'],
        ['paises'],
        ['paises-count'],
        ['paises-select'],
        ['pais', id],
      ])
    },
  })
}

export const useCreatePais = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePaisDTO) =>
      PaisesService('paises').createPais(data),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['paises-paginated'],
        ['paises'],
        ['paises-count'],
        ['paises-select'],
      ])
    },
  })
}

export const useUpdatePais = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaisDTO }) =>
      PaisesService('paises').updatePais(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      invalidateQueriesGlobally(queryClient, [
        ['paises-paginated'],
        ['paises'],
        ['paises-count'],
        ['paises-select'],
        ['pais', id],
        // Extra invalidações relacionadas
        ['distritos-paginated'],
        ['distritos'],
        ['distritos-count'],
        ['distritos-select'],
        ['concelhos-paginated'],
        ['concelhos'],
        ['concelhos-count'],
        ['concelhos-select'],
      ])
    },
  })
}

export const useDeleteMultiplePaises = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      PaisesService('paises').deleteMultiplePaises(ids),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['paises-paginated'],
        ['paises'],
        ['paises-count'],
        ['paises-select'],
      ])
    },
  })
}
