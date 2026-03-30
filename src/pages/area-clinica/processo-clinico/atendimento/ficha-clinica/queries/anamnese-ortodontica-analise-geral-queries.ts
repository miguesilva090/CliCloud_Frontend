import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnamneseOrtodonticaAnaliseGeralService } from '@/lib/services/processo-clinico/estomatologia/anamnese-ortodontica-analise-geral-service'
import type {
  AnamneseOrtodonticaAnaliseGeralDTO,
  CreateAnamneseOrtodonticaAnaliseGeralRequest,
  UpdateAnamneseOrtodonticaAnaliseGeralRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-analise-geral.dtos'

const QUERY_KEY = ['anamnese-ortodontica-analise-geral']

export function useGetAnamneseOrtodonticaAnaliseGeralByUtente(utenteId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'by-utente', utenteId],
    queryFn: async () => {
      if (!utenteId) {
        return null as AnamneseOrtodonticaAnaliseGeralDTO | null
      }

      const res = await AnamneseOrtodonticaAnaliseGeralService().getByUtente(utenteId)
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(firstMsg ?? 'Erro ao carregar Anamnese Ortodôntica - Análise Geral')
      }

      return (res.info?.data ?? null) as AnamneseOrtodonticaAnaliseGeralDTO | null
    },
    enabled: !!utenteId,
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateAnamneseOrtodonticaAnaliseGeral(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<CreateAnamneseOrtodonticaAnaliseGeralRequest, 'utenteId'>,
    ) => {
      const body: CreateAnamneseOrtodonticaAnaliseGeralRequest = {
        utenteId,
        ...data,
      }

      const res = await AnamneseOrtodonticaAnaliseGeralService().create(body)
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(
          firstMsg ?? 'Erro ao criar Anamnese Ortodôntica - Análise Geral',
        )
      }
      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'by-utente', utenteId],
      })
    },
  })
}

export function useUpdateAnamneseOrtodonticaAnaliseGeral(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      data: UpdateAnamneseOrtodonticaAnaliseGeralRequest
    }) => {
      const res = await AnamneseOrtodonticaAnaliseGeralService().update(
        payload.id,
        payload.data,
      )
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(
          firstMsg ?? 'Erro ao atualizar Anamnese Ortodôntica - Análise Geral',
        )
      }

      return res
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [...QUERY_KEY, 'by-utente', utenteId],
      })
    },
  })
}

