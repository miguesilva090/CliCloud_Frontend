import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AvaliacaoPosturalService } from '@/lib/services/processo-clinico/sinais-vitais/avaliacao-postural-service'
import type {
  CreateAvaliacaoPosturalRequest,
  AvaliacaoPosturalTableFilterRequest,
  UpdateAvaliacaoPosturalRequest,
} from '@/types/dtos/sinais-vitais/avaliacao-postural.dtos'

export function useCreateAvaliacaoPostural(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateAvaliacaoPosturalRequest, 'utenteId'>) => {
      const body: CreateAvaliacaoPosturalRequest = { utenteId, ...data }
      const res = await AvaliacaoPosturalService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar avaliação postural.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-postural', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateAvaliacaoPostural(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateAvaliacaoPosturalRequest }) => {
      const res = await AvaliacaoPosturalService().update(payload.id, payload.data)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar avaliação postural.'
        throw new Error(String(firstMsg))
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-postural', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteAvaliacaoPostural(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = AvaliacaoPosturalService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['avaliacao-postural', 'paginated', utenteId],
      })
    },
  })
}
