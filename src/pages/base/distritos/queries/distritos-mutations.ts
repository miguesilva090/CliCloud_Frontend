import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreateDistritoDTO,
  UpdateDistritoDTO,
} from '@/types/dtos/base/distritos.dtos'
import { DistritosService } from '@/lib/services/base/distritos-service'
import { invalidateQueriesGlobally } from '@/utils/query-sync'

export const useDeleteDistrito = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      DistritosService('distritos').deleteDistrito(id),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['distritos-paginated'],
        ['distritos'],
        ['distritos-count'],
        ['distritos-select'],
      ])
    },
  })
}

export const useCreateDistrito = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateDistritoDTO) =>
      DistritosService('distritos').createDistrito(data),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['distritos-paginated'],
        ['distritos'],
        ['distritos-count'],
        ['distritos-select'],
      ])
    },
  })
}

export const useUpdateDistrito = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDistritoDTO }) =>
      DistritosService('distritos').updateDistrito(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      invalidateQueriesGlobally(queryClient, [
        ['distritos-paginated'],
        ['distritos'],
        ['distritos-count'],
        ['distritos-select'],
        ['distrito', id],
        // Extra invalidações relacionadas
        ['concelhos-paginated'],
        ['concelhos'],
        ['concelhos-count'],
        ['concelhos-select'],
      ])
    },
  })
}

export const useDeleteMultipleDistritos = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      DistritosService('distritos').deleteMultipleDistritos(ids),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['distritos-paginated'],
        ['distritos'],
        ['distritos-count'],
        ['distritos-select'],
      ])
    },
  })
}
