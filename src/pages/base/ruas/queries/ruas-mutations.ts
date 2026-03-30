import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateRuaDTO, UpdateRuaDTO } from '@/types/dtos/base/ruas.dtos'
import { RuasService } from '@/lib/services/base/ruas-service'
import { invalidateQueriesGlobally } from '@/utils/query-sync'

export const useDeleteRua = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => RuasService('ruas').deleteRua(id),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['ruas-paginated'],
        ['ruas'],
        ['ruas-count'],
        ['ruas-select'],
      ])
    },
  })
}

export const useCreateRua = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRuaDTO) =>
      RuasService('ruas').createRua(data),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['ruas-paginated'],
        ['ruas'],
        ['ruas-count'],
        ['ruas-select'],
      ])
    },
  })
}

export const useUpdateRua = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRuaDTO }) =>
      RuasService('ruas').updateRua(id, { ...data, id }),
    onSuccess: (_, { id }) => {
      invalidateQueriesGlobally(queryClient, [
        ['ruas-paginated'],
        ['ruas'],
        ['ruas-count'],
        ['ruas-select'],
        ['rua', id],
      ])
    },
  })
}

export const useDeleteMultipleRuas = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => RuasService('ruas').deleteMultipleRuas(ids),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['ruas-paginated'],
        ['ruas'],
        ['ruas-count'],
        ['ruas-select'],
      ])
    },
  })
}
