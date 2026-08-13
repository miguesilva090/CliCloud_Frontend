import { useQuery } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { MedicacaoCronicaService } from '@/lib/services/prescricao/medicacao-cronica-service'

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

export function useMedicacaoCronicaByUtente(
  utenteId: string | null,
  enabled = true
) {
  return useQuery({
    queryKey: ['medicacao-cronica', utenteId],
    enabled: Boolean(utenteId) && enabled,
    queryFn: () =>
      MedicacaoCronicaService(permissionId).getByUtenteId(utenteId!, true),
  })
}
