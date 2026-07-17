import { useQuery } from '@tanstack/react-query'
import { UtentePatologiaComparticipacaoService } from '@/lib/services/prescricao/utente-patologia-comparticipacao-service'

export function useUtentePatologiasComparticipacao(utenteId: string | null | undefined) {
    return useQuery({
        queryKey: ['utente-patologia-comparticipacao', utenteId],
        queryFn: () => UtentePatologiaComparticipacaoService('ficha-clinica').getByUtenteId(utenteId as string),
        enabled: !!utenteId,
        staleTime: 60 * 1000,
    })
}