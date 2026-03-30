import { useQuery } from '@tanstack/react-query'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { PrioridadeService } from '@/lib/services/prioridades/prioridade-service'
import { PatologiaService } from '@/lib/services/patologias/patologia-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { PeriocidadeTratamentoService } from '@/lib/services/tratamentos/periocidade-tratamento-service'
import type { OrganismoLightDTO } from '@/types/dtos/saude/organismos.dtos'
import type { PrioridadeLightDTO } from '@/types/dtos/prioridades/prioridade.dtos'
import type { PatologiaLightDTO } from '@/types/dtos/patologias/patologia.dtos'
import type { MedicoLightDTO } from '@/types/dtos/saude/medicos.dtos'
import type { LocalTratamentoLightDTO } from '@/types/dtos/locais-tratamento/local-tratamento.dtos'
import type { PeriocidadeTratamentoLightDTO } from '@/types/dtos/tratamentos/periocidade-tratamento.dtos'

export function useOrganismosLight() {
  return useQuery({
    queryKey: ['organismos-light'],
    queryFn: async () => {
      const res = await OrganismoService('tratamentos').getOrganismoLight('')
      return (res.info?.data ?? []) as OrganismoLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePrioridadesLight() {
  return useQuery({
    queryKey: ['prioridades-light'],
    queryFn: async () => {
      const res = await PrioridadeService('tratamentos').getPrioridadesLight()
      return (res.info?.data ?? []) as PrioridadeLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePatologiasLight() {
  return useQuery({
    queryKey: ['patologias-light'],
    queryFn: async () => {
      const res = await PatologiaService('tratamentos').getPatologiasLight()
      return (res.info?.data ?? []) as PatologiaLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useMedicosLight() {
  return useQuery({
    queryKey: ['medicos-light'],
    queryFn: async () => {
      const res = await MedicosService('tratamentos').getMedicosLight('')
      return (res.info?.data ?? []) as MedicoLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useLocaisTratamentoLight() {
  return useQuery({
    queryKey: ['locais-tratamento-light'],
    queryFn: async () => {
      const res = await LocalTratamentoService('tratamentos').getLocaisTratamentoLight()
      return (res.info?.data ?? []) as LocalTratamentoLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePeriocidadesTratamentoLight() {
  return useQuery({
    queryKey: ['periocidade-tratamento-light'],
    queryFn: async () => {
      const res = await PeriocidadeTratamentoService('tratamentos').getPeriocidadesLight()
      return (res.info?.data ?? []) as PeriocidadeTratamentoLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

