import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GorduraMassaMuscularService } from '@/lib/services/processo-clinico/sinais-vitais/gordura-massa-muscular-service'
import type {
  CreateGorduraMassaMuscularRequest,
  GorduraMassaMuscularTableFilterRequest,
  UpdateGorduraMassaMuscularRequest,
} from '@/types/dtos/sinais-vitais/gordura-massa-muscular.dtos'

export function useCreateGorduraMassaMuscular(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<CreateGorduraMassaMuscularRequest, 'utenteId'>) => {
      const body: CreateGorduraMassaMuscularRequest = { utenteId, ...data }
      const res = await GorduraMassaMuscularService().create(body)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao criar gordura/massa muscular.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['gordura-massa-muscular', 'paginated', utenteId],
      })
    },
  })
}

export function useUpdateGorduraMassaMuscular(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; data: UpdateGorduraMassaMuscularRequest }) => {
      const res = await GorduraMassaMuscularService().update(payload.id, payload.data)
      if (res.info?.status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0] ?? 'Erro ao atualizar gordura/massa muscular.'
        throw new Error(String(firstMsg))
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['gordura-massa-muscular', 'paginated', utenteId],
      })
    },
  })
}

export function useDeleteGorduraMassaMuscular(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = GorduraMassaMuscularService()
      await Promise.all(ids.map((id) => client.delete(id)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['gordura-massa-muscular', 'paginated', utenteId],
      })
    },
  })
}
