import { useQuery } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { OrdemEntradaAdministrativoService } from '@/lib/services/consultas/ordem-entrada-administrativo-service'
import type { OrdemEntradaHorasDisponiveisRequest } from '@/types/dtos/consultas/ordem-entrada.dtos'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

export const ORDEM_ENTRADA_REGISTO_QUERY_KEY = ['ordem-entrada-registo'] as const
export const ORDEM_ENTRADA_HORAS_QUERY_KEY = ['ordem-entrada-horas'] as const

export function useOrdemEntradaRegisto(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [...ORDEM_ENTRADA_REGISTO_QUERY_KEY, id],
    queryFn: () => OrdemEntradaAdministrativoService(listPermId).getRegisto(id!),
    enabled: enabled && Boolean(id),
    staleTime: 0,
  })
}

export function useOrdemEntradaHorasDisponiveis(
  payload: OrdemEntradaHorasDisponiveisRequest | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: [...ORDEM_ENTRADA_HORAS_QUERY_KEY, payload],
    queryFn: () =>
      OrdemEntradaAdministrativoService(listPermId).getHorasDisponiveis(payload!),
    enabled: enabled && payload != null,
    staleTime: 0,
  })
}
