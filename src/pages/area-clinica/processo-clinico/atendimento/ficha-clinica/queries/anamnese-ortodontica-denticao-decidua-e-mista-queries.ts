import { useQuery } from '@tanstack/react-query'
import { AnamneseOrtodonticaDenticaoDeciduaeMistaService } from '@/lib/services/processo-clinico/estomatologia/anamnese-ortodontica-denticao-decidua-e-mista-service'

import type {
  AnamneseOrtodonticaDenticaoDeciduaeMistaDTO,
  CreateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
  UpdateAnamneseOrtodonticaDenticaoDeciduaeMistaRequest,
} from '@/types/dtos/saude/anamnese-ortodontica-denticao-decidua-e-mista.dtos'

const QUERY_KEY = ['anamnese-ortodontica-denticao-decidua-e-mista']

export function useGetAnamneseOrtodonticaDenticaoDeciduaeMistaByUtente(utenteId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'by-utente', utenteId],
    queryFn: async () => {
      if (!utenteId) {
        return null as AnamneseOrtodonticaDenticaoDeciduaeMistaDTO | null
      }

      const res = await AnamneseOrtodonticaDenticaoDeciduaeMistaService().getByUtente(utenteId)
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(
          firstMsg ??
            'Erro ao carregar Anamnese Ortodôntica - Dentição Decídua e Mista',
        )
      }

      return (res.info?.data ?? null) as AnamneseOrtodonticaDenticaoDeciduaeMistaDTO | null
    },
    enabled: !!utenteId,
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateAnamneseOrtodonticaDenticaoDeciduaeMista, useUpdateAnamneseOrtodonticaDenticaoDeciduaeMista } from './anamnese-ortodontica-denticao-decidua-e-mista-mutations'
