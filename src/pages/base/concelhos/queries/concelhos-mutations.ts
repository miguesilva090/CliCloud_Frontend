import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreateConcelhoDTO,
  UpdateConcelhoDTO,
} from '@/types/dtos/base/concelhos.dtos'
import { ConcelhosService } from '@/lib/services/base/concelhos-service'
import { invalidateQueriesGlobally } from '@/utils/query-sync'

export const useDeleteConcelho = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      ConcelhosService('concelhos').deleteConcelho(id),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['concelhos-paginated'],
        ['concelhos'],
        ['concelhos-count'],
        ['concelhos-select'],
      ])
    },
  })
}

export const useCreateConcelho = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateConcelhoDTO) =>
      ConcelhosService('concelhos').createConcelho(data),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['concelhos-paginated'],
        ['concelhos'],
        ['concelhos-count'],
        ['concelhos-select'],
      ])
    },
  })
}

export const useUpdateConcelho = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConcelhoDTO }) =>
      ConcelhosService('concelhos').updateConcelho(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      invalidateQueriesGlobally(queryClient, [
        ['concelhos-paginated'],
        ['concelhos'],
        ['concelhos-count'],
        ['concelhos-select'],
        ['concelho', id],
        // Extra invalidações relacionadas
        ['freguesias-paginated'],
        ['freguesias'],
        ['freguesias-count'],
        ['freguesias-select'],
      ])
    },
  })
}

export const useDeleteMultipleConcelhos = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      ConcelhosService('concelhos').deleteMultipleConcelhos(ids),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['concelhos-paginated'],
        ['concelhos'],
        ['concelhos-count'],
        ['concelhos-select'],
      ])
    },
  })
}
