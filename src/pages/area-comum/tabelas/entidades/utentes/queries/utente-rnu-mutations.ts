import { useMutation } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'
import { UtentesRnuService } from '@/lib/services/saude/utentes-rnu-service'
import type { ConsultarUtenteRnuRequest } from '@/types/dtos/saude/utente-rnu.dtos'

export const useConsultarUtenteRnu = () => {
  return useMutation({
    mutationFn: async (payload: ConsultarUtenteRnuRequest) => {
      const response = await UtentesRnuService('utentes').consultarUtenteRnu(payload)
      return response.info
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Falha ao consultar RNU'
      toast.error(message, 'RNU')
    },
  })
}
