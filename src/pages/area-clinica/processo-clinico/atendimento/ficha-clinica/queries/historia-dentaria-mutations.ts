import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ResponseStatus } from '@/types/api/responses'
import {
  HistoriaDentariaService,
  type CreateHistoriaDentariaRequest,
} from '@/lib/services/processo-clinico/historia-dentaria-service'

const client = () => HistoriaDentariaService()

export function useCreateHistoriaDentaria() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateHistoriaDentariaRequest) => {
      const res = await client().create(payload)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao guardar relatório dentário.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['historia-dentaria', vars.utenteId],
      })
    },
  })
}
