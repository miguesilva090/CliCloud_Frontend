import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreateFreguesiaDTO,
  UpdateFreguesiaDTO,
} from '@/types/dtos/base/freguesias.dtos'
import { FreguesiasService } from '@/lib/services/base/freguesias-service'
import { invalidateQueriesGlobally } from '@/utils/query-sync'

export const useDeleteFreguesia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      FreguesiasService('freguesias').deleteFreguesia(id),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['freguesias-paginated'],
        ['freguesias'],
        ['freguesias-count'],
        ['freguesias-select'],
      ])
    },
  })
}

export const useCreateFreguesia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateFreguesiaDTO) =>
      FreguesiasService('freguesias').createFreguesia(data),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['freguesias-paginated'],
        ['freguesias'],
        ['freguesias-count'],
        ['freguesias-select'],
      ])
    },
  })
}

export const useUpdateFreguesia = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFreguesiaDTO }) =>
      FreguesiasService('freguesias').updateFreguesia(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      invalidateQueriesGlobally(queryClient, [
        ['freguesias-paginated'],
        ['freguesias'],
        ['freguesias-count'],
        ['freguesias-select'],
        ['freguesia', id],
        // Extra invalidações relacionadas
        ['ruas-paginated'],
        ['ruas'],
        ['ruas-count'],
        ['ruas-select'],
      ])
    },
  })
}

export const useDeleteMultipleFreguesias = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      FreguesiasService('freguesias').deleteMultipleFreguesias(ids),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['freguesias-paginated'],
        ['freguesias'],
        ['freguesias-count'],
        ['freguesias-select'],
      ])
    },
  })
}
