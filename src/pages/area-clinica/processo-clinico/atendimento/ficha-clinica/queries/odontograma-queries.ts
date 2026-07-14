import { useQuery } from '@tanstack/react-query'
import { EstadosDentariosService } from '@/lib/services/processo-clinico/odontologia/estados-dentarios-service'
import { TiposTratamentoDentarioService } from '@/lib/services/processo-clinico/odontologia/tipos-tratamento-dentario-service'
import { OdontogramaDefinitivoService } from '@/lib/services/processo-clinico/odontologia/odontograma-definitivo-service'
import type {
  EstadosDentariosDTO,
  TiposTratamentoDentarioDTO,
  OdontogramaDefinitivoDTO,
} from '@/types/dtos/odontologia/odontograma-definitivo.dtos'

export const ODONTOGRAMA_QUERY_KEY = ['odontologia', 'odontograma-definitivo']

export function useEstadosDentarios(keyword?: string) {
  return useQuery({
    queryKey: ['odontologia', 'estados-dentarios', keyword ?? ''],
    queryFn: async () => {
      const res = await EstadosDentariosService().getAll(keyword ?? '')
      return (res.info?.data ?? []) as EstadosDentariosDTO[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useTiposTratamentoDentario(keyword?: string) {
  return useQuery({
    queryKey: ['odontologia', 'tipos-tratamento-dentario', keyword ?? ''],
    queryFn: async () => {
      const res = await TiposTratamentoDentarioService().getAll(keyword ?? '')
      return (res.info?.data ?? []) as TiposTratamentoDentarioDTO[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useOdontogramaByUtenteConsulta(utenteId?: string, consultaId?: string | null) {
  return useQuery({
    queryKey: [...ODONTOGRAMA_QUERY_KEY, utenteId ?? '', consultaId ?? ''],
    enabled: !!utenteId && !!consultaId,
    queryFn: async () => {
      if (!utenteId || !consultaId) {
        return [] as OdontogramaDefinitivoDTO[]
      }
      const res = await OdontogramaDefinitivoService().getByUtenteConsulta(utenteId, consultaId)
      return (res.info?.data ?? []) as OdontogramaDefinitivoDTO[]
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export {
  useCreateEstadoDentario,
  useUpdateEstadoDentario,
  useDeleteEstadoDentario,
  useCreateTipoTratamentoDentario,
  useUpdateTipoTratamentoDentario,
  useDeleteTipoTratamentoDentario,
  useCreateOdontogramaLinha,
  useUpdateOdontogramaLinha,
  useDeleteOdontogramaLinha,
} from './odontograma-mutations'
