import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GSResponse } from '@/types/api/responses'
import { ResponseStatus } from '@/types/api/responses'
import {
  HistoriaDentariaService,
  type CreateHistoriaDentariaRequest,
  type HistoriaDentariaDTO,
} from '@/lib/services/processo-clinico/historia-dentaria-service'

const client = () => HistoriaDentariaService()

export function useGetHistoriaDentariaByUtente(utenteId?: string) {
  return useQuery({
    queryKey: ['historia-dentaria', utenteId],
    queryFn: async (): Promise<HistoriaDentariaDTO[]> => {
      if (!utenteId) return []
      const res = await client().getByUtente(utenteId)
      const info = res.info as GSResponse<HistoriaDentariaDTO[] | null | undefined> | null
      const data = info?.data
      return Array.isArray(data) ? data : []
    },
    enabled: !!utenteId && utenteId.length > 0,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
  })
}

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
