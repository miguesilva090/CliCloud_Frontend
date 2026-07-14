import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateExameRequest, UpdateExameRequest } from '@/types/dtos/exames/exame.dtos'
import { ExameService } from '@/lib/services/exames/exame-service'
import { ResponseStatus } from '@/types/api/responses'

export function useCreateExame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateExameRequest) => ExameService().createExame(payload),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success) {
        // Invalidar todas as queries de exames prescritos (qualquer combinação de filtros/paginação)
        void queryClient.invalidateQueries({
          queryKey: ['exames-prescritos-paginated'],
          exact: false,
        })
      }
    },
  })
}

export function useUpdateExame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (args: { id: string; data: UpdateExameRequest }) =>
      ExameService().updateExame(args.id, args.data),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success) {
        void queryClient.invalidateQueries({
          queryKey: ['exames-prescritos-paginated'],
          exact: false,
        })
      }
    },
  })
}

export function useDeleteExame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ExameService().deleteExame(id),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success) {
        void queryClient.invalidateQueries({
          queryKey: ['exames-prescritos-paginated'],
          exact: false,
        })
      }
    },
  })
}
