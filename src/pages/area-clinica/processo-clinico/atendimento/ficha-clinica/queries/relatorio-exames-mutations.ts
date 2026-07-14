import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ResponseStatus } from '@/types/api/responses'
import {
  RelatorioExamesService,
  type UpdateRelatorioExamesRequest,
} from '@/lib/services/processo-clinico/relatorio-exames-service'

const client = () => RelatorioExamesService()

export function useUpsertRelatorioExames() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateRelatorioExamesRequest) => {
      const res = await client().upsert(payload)
      if (res.info?.status !== ResponseStatus.Success) {
        const msgs = res.info?.messages ?? {}
        const firstMsg =
          (Object.values(msgs).flat()[0] as string | undefined) ??
          'Erro ao guardar relatório de exames.'
        throw new Error(firstMsg)
      }
      return res
    },
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['relatorio-exames', vars.utenteId],
      })
    },
  })
}
