import { useMutation } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'
import { UtentesRnuService } from '@/lib/services/saude/utentes-rnu-service'
import type {
    ConsultarUtenteRnuRequest,
    ConsultarUtenteRnuResponse,
} from '@/types/dtos/saude/utente-rnu.dtos'

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

export function aplicarRnuNoFormulario(
    rnu: ConsultarUtenteRnuResponse,
    setValue: (name: string, value: unknown , opts?: { shouldValidate?: boolean; shouldDirty?: boolean }) => void,
    getValue: (name: string) => unknown,
) {
    const setIfEmpty = (field: string , value: unknown) => {
        const current = getValue(field)
        const empty = 
            current == null || 
            current === '' || 
            (typeof current === 'string' && current.trim() === '')
        
        if(empty && value != null && value !== '') {
            setValue(field, value, {shouldDirty: true})
        }
    }

    setIfEmpty('nome', rnu.nomeCompleto ?? '') 
    setIfEmpty('numeroUtente', rnu.numeroSns ?? '')
}