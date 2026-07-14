import { useQuery } from '@tanstack/react-query'
import { AnamneseOdontopediatriaService } from '@/lib/services/processo-clinico/estomatologia/anamnese-odontopediatria-service'
import type {
  AnamneseOdontopediatriaDTO,
  CreateAnamneseOdontopediatriaRequest,
  UpdateAnamneseOdontopediatriaRequest,
} from '@/types/dtos/saude/anamnese-odontopediatria.dtos'

const QUERY_KEY = ['anamnese-odontopediatria']

export function useGetAnamneseOdontopediatriaByUtente(utenteId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'by-utente', utenteId],
    queryFn: async () => {
      if (!utenteId) {
        return null as AnamneseOdontopediatriaDTO | null
      }

      const res = await AnamneseOdontopediatriaService().getByUtente(utenteId)
      const status = res.info?.status
      if (status !== 0) {
        const msgs = res.info?.messages ?? {}
        const firstMsg = Object.values(msgs).flat()[0]
        throw new Error(firstMsg ?? 'Erro ao carregar anamnese odontopediatria')
      }

      return (res.info?.data ?? null) as AnamneseOdontopediatriaDTO | null
    },
    enabled: !!utenteId,
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export { useCreateAnamneseOdontopediatria, useUpdateAnamneseOdontopediatria } from './anamnese-odontopediatria-mutations'
