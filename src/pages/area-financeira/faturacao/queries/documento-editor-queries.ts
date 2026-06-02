import { useQuery } from '@tanstack/react-query'
import { ResponseStatus } from '@/types/api/responses'
import type { PaginatedResponse } from '@/types/api/responses'
import { ClinicaService } from '@/lib/services/core/clinica-service'
import { parseRegraFaturacao } from '../utils/documento-editor-calculos'
import {
  ModoListagemAdmissao,
  type AdmissaoTableDTO,
} from '@/types/dtos/consultas/admissao.dtos'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { useTaxasIvaLight } from '@/lib/services/utility/lookups/lookups-queries'
import { extractSubsistemaServicoRows } from '@/pages/area-administrativa/consultas/admissoes/modals/admissao-form-utils'
import { MoedaService } from '@/lib/services/moedas/moeda-service'
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'
import type { MotivoIsencaoLightDTO } from '@/types/dtos/taxas-iva/motivo-isencao.dtos'
import { DocumentoEmissaoService } from '@/lib/services/faturacao/documento-emissao-service'

const ID = 'documentos'

export { useTaxasIvaLight as useTaxasIvaDocumento }

export function useClinicaFaturacaoConfig() {
  return useQuery({
    queryKey: ['documento-editor', 'clinica-current'],
    queryFn: async () => {
      const res = await ClinicaService(ID).getClinicaCurrent()
      const clinica =
        res.info?.status === ResponseStatus.Success ? res.info.data : null
      return {
        regraFaturacao: parseRegraFaturacao(clinica?.regrafaturacao),
        regrafaturacao: clinica?.regrafaturacao ?? '1',
      }
    },
    staleTime: 120_000,
  })
}

export function useServicosLightDocumento(keyword: string, enabled = true) {
  return useQuery({
    queryKey: ['documento-editor', 'servicos-light', keyword],
    queryFn: () => ServicoService(ID).getServicoLight(keyword),
    enabled,
    staleTime: 60_000,
  })
}

export function useSubsistemasOrganismoDocumento(organismoId: string | null) {
  return useQuery({
    queryKey: ['documento-editor', 'subsistemas', organismoId],
    queryFn: async () => {
      const res = await SubsistemaServicoService(ID).getSubsistemaServicoPaginated({
        pageNumber: 1,
        pageSize: 500,
        sorting: [],
        organismoId: organismoId ?? undefined,
      })
      return extractSubsistemaServicoRows(res.info?.data)
    },
    enabled: !!organismoId,
    staleTime: 60_000,
  })
}

export type FonteAdmissoesFaturacao = 'activo' | 'historico'

export function useAdmissoesParaFaturacao(
  utenteId: string | null,
  fonte: FonteAdmissoesFaturacao = 'activo',
) {
  const filters: Array<{ id: string; value: string }> = [
    { id: 'faturado', value: 'false' },
  ]
  if (utenteId) filters.push({ id: 'utenteid', value: utenteId })

  if (fonte === 'historico') {
    const ate = new Date()
    ate.setDate(ate.getDate() - 1)
    filters.push({ id: 'data_ate', value: ate.toISOString().slice(0, 10) })
  }

  return useQuery({
    queryKey: ['documento-editor', 'admissoes', utenteId, fonte],
    queryFn: async () => {
      const res = await AdmissaoAdministrativoService(ID).getPaginated({
        pageNumber: 1,
        pageSize: 80,
        modo: ModoListagemAdmissao.ParaFaturacao,
        filters,
        sorting: [{ id: 'data', desc: true }],
      })
      const payload = res.info as PaginatedResponse<AdmissaoTableDTO> | undefined
      return payload?.data ?? []
    },
    enabled: !!utenteId,
    staleTime: 30_000,
  })
}

export function useMoedasDocumento() {
  return useQuery({
    queryKey: ['documento-editor', 'moedas-light'],
    queryFn: async () => {
      const res = await MoedaService(ID).getMoedasLight('')
      if (res.info?.status !== ResponseStatus.Success) return []
      return res.info.data ?? []
    },
    staleTime: 120_000,
  })
}

export function useOpcoesPagamentoDocumento() {
  return useQuery({
    queryKey: ['documento-editor', 'opcoes-pagamento'],
    queryFn: async () => {
      const res = await DocumentoEmissaoService(ID).getOpcoesPagamento()
      if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
        return {
          condicoesPagamento: [],
          modosPagamento: [],
          tiposSerie: [],
          impostosRetencao: [],
          referenciasMb: [],
        }
      }
      return res.info.data
    },
    staleTime: 120_000,
  })
}

export function useMotivosIsencaoDocumento(keyword = '') {
  return useQuery({
    queryKey: ['documento-editor', 'motivos-isencao', keyword],
    queryFn: async () => {
      const res = await MotivoIsencaoService(ID).getMotivosIsencaoLight(keyword)
      if (res.info?.status !== ResponseStatus.Success) return []
      return (res.info.data ?? []) as MotivoIsencaoLightDTO[]
    },
    staleTime: 120_000,
  })
} 

export type SubsistemaPrecoRow = SubsistemaServicoDTO
