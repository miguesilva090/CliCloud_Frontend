import { useQuery } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { UtentePatologiaComparticipacaoService } from '@/lib/services/prescricao/utente-patologia-comparticipacao-service'
import { MedicamentosInfarmedService } from '@/lib/services/prescricao/medicamentos-infarmed-service'
import { ResponseStatus } from '@/types/api/responses'
import type { UtentePatologiaComparticipacaoDTO } from '@/types/dtos/prescricao/utente-patologia-comparticipacao.dtos'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse } from '@/types/api/responses'

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

export function useReceitaUtentePatologias(utenteId: string | null | undefined) {
  return useQuery({
    queryKey: ['utente-patologia-comparticipacao', utenteId],
    queryFn: () =>
      UtentePatologiaComparticipacaoService(permissionId).getByUtenteId(
        utenteId as string
      ),
    enabled: Boolean(utenteId),
    staleTime: 60 * 1000,
  })
}

export function useRegimesExcepcionaisInfarmed(enabled = true) {
  return useQuery({
    queryKey: ['infarmed-regimes-excecionais'],
    queryFn: () => MedicamentosInfarmedService().getRegimesExcepcionais(),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export function unwrapPatologiasList(
  data:
    | ResponseApi<GSResponse<UtentePatologiaComparticipacaoDTO[]>>
    | undefined
): UtentePatologiaComparticipacaoDTO[] {
  const envelope = data?.info
  if (!envelope || envelope.status !== ResponseStatus.Success) return []
  return envelope.data ?? []
}
