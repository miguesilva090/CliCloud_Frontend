import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnamneseOrtodonticaDenticaoDeciduaeMistaService } from '@/lib/services/processo-clinico/estomatologia/anamnese-ortodontica-denticao-decidua-e-mista-service'
import type {
  AnamneseOrtodonticaDenticaoDeciduaeMistaDTO,
  CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
  UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-denticao-decidua-e-mista.dtos'

const QUERY_KEY = ['anamnese-ortodontica-denticao-decidua-e-mista']

export function useCreateAnamneseOrtodonticaDenticaoDeciduaeMista(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: Omit<CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest, 'utenteId'>,
    ) => {
      const body: CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest = {
        utenteId,
        ...data,
      }

      const res = await AnamneseOrtodonticaDenticaoDeciduaeMistaService().create(body)
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(
          firstMsg ??
            'Erro ao criar Anamnese Ortodôntica - Dentição Decídua e Mista',
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

export function useUpdateAnamneseOrtodonticaDenticaoDeciduaeMista(utenteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      id: string
      data: UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest
    }) => {
      const res = await AnamneseOrtodonticaDenticaoDeciduaeMistaService().update(
        payload.id,
        payload.data,
      )
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(
          firstMsg ??
            'Erro ao atualizar Anamnese Ortodôntica - Dentição Decídua e Mista',
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
