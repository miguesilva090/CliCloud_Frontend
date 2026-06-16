import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreateCodigoPostalDTO,
  UpdateCodigoPostalDTO,
} from '@/types/dtos/base/codigospostais.dtos'
import { CodigosPostaisService } from '@/lib/services/base/codigospostais-service'
import { invalidateQueriesGlobally } from '@/utils/query-sync'

export const useDeleteCodigoPostal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      CodigosPostaisService('codigospostais').deleteCodigoPostal(id),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['codigospostais-paginated'],
        ['codigospostais'],
        ['codigospostais-count'],
        ['codigospostais-select'],
      ])
    },
  })
}

export const useCreateCodigoPostal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCodigoPostalDTO) =>
      CodigosPostaisService('codigospostais').createCodigoPostal(data),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['codigospostais-paginated'],
        ['codigospostais'],
        ['codigospostais-count'],
        ['codigospostais-select'],
      ])
    },
  })
}

export const useUpdateCodigoPostal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCodigoPostalDTO }) =>
      CodigosPostaisService('codigospostais').updateCodigoPostal(id, {
        ...data,
        id,
      }),
    onSuccess: (_, { id }) => {
      invalidateQueriesGlobally(queryClient, [
        ['codigospostais-paginated'],
        ['codigospostais'],
        ['codigospostais-count'],
        ['codigospostais-select'],
        ['codigoPostal', id],
        ['ruas-paginated'],
        ['ruas'],
        ['ruas-count'],
        ['ruas-select'],
      ])
    },
  })
}

export const useDeleteMultipleCodigosPostais = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      CodigosPostaisService('codigospostais').deleteMultipleCodigosPostais(ids),
    onSuccess: () => {
      invalidateQueriesGlobally(queryClient, [
        ['codigospostais-paginated'],
        ['codigospostais'],
        ['codigospostais-count'],
        ['codigospostais-select'],
      ])
    },
  })
}
