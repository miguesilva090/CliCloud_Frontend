import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnamneseOrtodonticaATMService } from '@/lib/services/processo-clinico/estomatologia/anamnese-ortodontica-atm-service'
import type {
  AnamneseOrtodonticaATMDTO,
  CreateAnamneseOrtodonticaATMRequest,
  UpdateAnamneseOrtodonticaATMRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-atm.dtos'

const QUERY_KEY = ['anamnese-ortodontica-atm']

export function useGetAnamneseOrtodonticaATMByUtente(utenteId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'by-utente', utenteId],
    queryFn: async () => {
      if (!utenteId) {
        return null as AnamneseOrtodonticaATMDTO | null
      }

      const res = await AnamneseOrtodonticaATMService().getByUtente(utenteId)
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(
          firstMsg ?? 'Erro ao carregar Anamnese Ortodôntica - ATM',
        )
      }

      return (res.info?.data ?? null) as AnamneseOrtodonticaATMDTO | null
    },
    enabled: !!utenteId,
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateAnamneseOrtodonticaATM(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<CreateAnamneseOrtodonticaATMRequest, 'utenteId'>,
    ) => {
      const body: CreateAnamneseOrtodonticaATMRequest = {
        utenteId,
        ...data,
      }

      const res = await AnamneseOrtodonticaATMService().create(body)
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(
          firstMsg ?? 'Erro ao criar Anamnese Ortodôntica - ATM',
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

export function useUpdateAnamneseOrtodonticaATM(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      data: UpdateAnamneseOrtodonticaATMRequest
    }) => {
      const res = await AnamneseOrtodonticaATMService().update(
        payload.id,
        payload.data,
      )
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(
          firstMsg ?? 'Erro ao atualizar Anamnese Ortodôntica - ATM',
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

