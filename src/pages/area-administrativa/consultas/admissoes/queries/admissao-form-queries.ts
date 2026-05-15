import { useQuery } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/types/api/responses'
import type { DoencaTableDTO } from '@/types/dtos/doencas/doenca.dtos'
import type { SalaTableDTO } from '@/types/dtos/consultas/sala.dtos'
import { TipoAdmissaoService } from '@/lib/services/consultas/tipo-admissao-service'
import { TipoConsultaService } from '@/lib/services/tipos-consulta/tipo-consulta-service'
import { MotivoConsultaService } from '@/lib/services/consultas/motivo-consulta-service'
import { SalaService } from '@/lib/services/consultas/sala-service'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { DoencaService } from '@/lib/services/doencas/doenca-service'
import { TipoServicoService } from '@/lib/services/servicos/tipo-servico-service'
import { useMedicosLight } from '@/lib/services/saude/medicos-service/medicos-queries'
import { useMedicosExternosLight } from '@/lib/services/utility/lookups/lookups-queries'

export const useTiposServicoLightAdmissao = (keyword = '', enabled = true) =>
  useQuery({
    queryKey: ['admissao-form', 'tipos-servico', keyword],
    queryFn: () => TipoServicoService().getTipoServicoLight(keyword),
    enabled,
    staleTime: 5 * 60_000,
  })

export const useTiposAdmissao = (enabled = true) =>
  useQuery({
    queryKey: ['admissao-form', 'tipos-admissao'],
    queryFn: async () => {
      const res = await TipoAdmissaoService().getAllTiposAdmissao()
      return res.info?.data ?? []
    },
    enabled,
    staleTime: 5 * 60_000,
  })

export const useTiposConsulta = (enabled = true) =>
  useQuery({
    queryKey: ['admissao-form', 'tipos-consulta'],
    queryFn: async () => {
      const res = await TipoConsultaService().getAllTiposConsulta()
      return res.info?.data ?? []
    },
    enabled,
    staleTime: 5 * 60_000,
  })

export const useMotivosConsulta = (enabled = true) =>
  useQuery({
    queryKey: ['admissao-form', 'motivos-consulta'],
    queryFn: async () => {
      const res = await MotivoConsultaService().getAllMotivosConsulta()
      return res.info?.data ?? []
    },
    enabled,
    staleTime: 5 * 60_000,
  })

export const useSalasAdmissao = (enabled = true) =>
  useQuery({
    queryKey: ['admissao-form', 'salas'],
    queryFn: async () => {
      const res = await SalaService().getSalasPaginated({
        pageNumber: 1,
        pageSize: 300,
        sorting: [{ id: 'nome', desc: false }],
      })
      const payload = res.info?.data as PaginatedResponse<SalaTableDTO> | SalaTableDTO[] | undefined
      if (Array.isArray(payload)) return payload
      return payload?.data ?? []
    },
    enabled,
    staleTime: 5 * 60_000,
  })

export const useSubsistemasPorOrganismo = (organismoId: string, enabled: boolean) =>
  useQuery({
    queryKey: ['admissao-form', 'subsistemas', organismoId],
    queryFn: () =>
      SubsistemaServicoService().getSubsistemaServicoPaginated({
        pageNumber: 1,
        pageSize: 500,
        sorting: [],
        organismoId,
      }),
    enabled: enabled && organismoId.length > 0,
    staleTime: 60_000,
  })

export const useServicosLightAdmissao = (keyword = '', enabled = true) =>
  useQuery({
    queryKey: ['admissao-form', 'servicos-light', keyword],
    queryFn: () => ServicoService().getServicoLight(keyword),
    enabled,
    staleTime: 5 * 60_000,
  })

export const useDoencasSearch = (keyword: string, enabled: boolean) =>
  useQuery({
    queryKey: ['admissao-form', 'doencas', keyword],
    queryFn: async () => {
      const res = await DoencaService().getDoencasPaginated({
        pageNumber: 1,
        pageSize: 40,
        sorting: [],
        filters: { keyword },
      })
      const payload = res.info?.data as PaginatedResponse<DoencaTableDTO> | DoencaTableDTO[] | undefined
      if (Array.isArray(payload)) return payload
      return payload?.data ?? []
    },
    enabled: enabled && keyword.trim().length >= 2,
    staleTime: 30_000,
  })

export { useMedicosLight, useMedicosExternosLight }
