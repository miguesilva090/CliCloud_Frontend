import { useQuery } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { MedicacaoFavoritaService } from '@/lib/services/prescricao/medicacao-favorita-service'

const permissionId = modules.areaClinica.permissions.prescricaoEletronica.id

export function useMedicacaoFavoritaByMedico(
  medicoId: string | null,
  enabled = true,
  tipoLinha?: number
) {
  return useQuery({
    queryKey: ['medicacao-favorita', medicoId, tipoLinha ?? null],
    enabled: Boolean(medicoId) && enabled,
    queryFn: () =>
      MedicacaoFavoritaService(permissionId).getByMedicoId(
        medicoId!,
        tipoLinha
      ),
  })
}
