import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GSResponse } from '@/types/api/responses'
import { ResponseStatus } from '@/types/api/responses'
import {
  RelatorioExamesService,
  type RelatorioExamesDTO,
  type UpdateRelatorioExamesRequest,
} from '@/lib/services/processo-clinico/relatorio-exames-service'

const client = () => RelatorioExamesService()

export function useGetRelatorioExamesByUtente(utenteId?: string) {
  return useQuery({
    queryKey: ['relatorio-exames', utenteId],
    queryFn: async () => {
      if (!utenteId) return null
      const res = await client().getByUtente(utenteId)
      const info = res.info as GSResponse<RelatorioExamesDTO | null> | null
      return info?.data ?? null
    },
    enabled: !!utenteId && utenteId.length > 0,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}

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

