import { useQuery } from '@tanstack/react-query'
import { ResponseStatus } from '@/types/api/responses'
import type { PaginatedResponse } from '@/types/api/responses'
import { ClinicaService } from '@/lib/services/core/clinica-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { MoedaService } from '@/lib/services/moedas/moeda-service'
import { CondicaoPagamentoService } from '@/lib/services/pagamentos/condicao-pagamento-service'
import { ModoPagamentoService } from '@/lib/services/pagamentos/modo-pagamento-service'
import { DocumentoEmissaoService } from '@/lib/services/faturacao/documento-emissao-service'
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'
import { MotivoRetencaoService } from '@/lib/services/taxas-iva/motivo-retencao-service'
import { useAuthStore } from '@/stores/auth-store'
import { useTaxasIvaLight } from '@/hooks/lookups/use-utility-lookups'
import { parseRegraFaturacao } from '../utils/documento-editor-calculos'
import { fetchReciboAdmissaoPrecarga } from '../utils/map-recibo-admissao-precarga'
import { extractSubsistemaServicoRows } from '@/pages/area-administrativa/consultas/admissoes/modals/admissao-form-utils'
import { ModoListagemAdmissao } from '@/types/dtos/consultas/admissao.dtos'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import type { ClinicaDTO } from '@/types/dtos/core/clinica.dtos'
import type {
  FaturaGlobalObterRequest,
  SinistradosInfoFaturacaoRequest,
} from '@/types/dtos/faturacao/documento-emissao.dtos'

export type FonteAdmissoesFaturacao = 'activo' | 'historico'

function resolveClinicaId(clinica: ClinicaDTO | null | undefined): string {
  if (!clinica) return ''
  const raw = clinica as ClinicaDTO & { Id?: string }
  return raw.id || raw.Id || ''
}

const ID = 'documentos'

/** Lookups do editor — estáveis entre abrir/fechar documentos. */
const EDITOR_LOOKUP_CACHE = {
  staleTime: 30 * 60 * 1000,
  gcTime: 60 * 60 * 1000,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const

export { useTaxasIvaLight as useTaxasIvaDocumento }


export function usePrecargaReciboAdmissao(admissaoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['documento-editor', 'recibo-admissao', admissaoId],
    queryFn: () => fetchReciboAdmissaoPrecarga(admissaoId),
    enabled: enabled && !!admissaoId,
    staleTime: 0,
    retry: false,
  })
}

export function useClinicaFaturacaoConfig() {
  return useQuery({
    queryKey: ['documento-editor', 'clinica-current'],
    queryFn: async () => {
      const res = await ClinicaService(ID).getClinicaCurrent()
      const clinica =
        res.info?.status === ResponseStatus.Success ? res.info.data : null
      const clinicaId =
        resolveClinicaId(clinica) || useAuthStore.getState().clientId || ''
      return {
        clinicaId,
        clinicaNome: clinica?.nome ?? '',
        regraFaturacao: parseRegraFaturacao(clinica?.regrafaturacao),
        regrafaturacao: clinica?.regrafaturacao ?? '1',
      }
    },
    ...EDITOR_LOOKUP_CACHE,
  })
}

export function useServicosLightDocumento(keyword: string, enabled = true) {
  return useQuery({
    queryKey: ['documento-editor', 'servicos-light', keyword],
    queryFn: () => ServicoService(ID).getServicoLight(keyword),
    enabled,
    ...EDITOR_LOOKUP_CACHE,
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
    ...EDITOR_LOOKUP_CACHE,
  })
}

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
    ...EDITOR_LOOKUP_CACHE,
  })
}

export function useCondicoesPagamentoDocumento(keyword = '') {
  return useQuery({
    queryKey: ['documento-editor', 'condicoes-pagamento-light', keyword],
    queryFn: async () => {
      const res =
        await CondicaoPagamentoService(ID).getCondicoesPagamentoLight(keyword)
      if (res.info?.status !== ResponseStatus.Success) return []
      return res.info.data ?? []
    },
    ...EDITOR_LOOKUP_CACHE,
  })
}

export function useModosPagamentoDocumento(keyword = '', apenasAtivos = true) {
  return useQuery({
    queryKey: ['documento-editor', 'modos-pagamento-light', keyword, apenasAtivos],
    queryFn: async () => {
      const res = await ModoPagamentoService(ID).getModosPagamentoLight(
        keyword,
        apenasAtivos,
      )
      if (res.info?.status !== ResponseStatus.Success) return []
      return res.info.data ?? []
    },
    ...EDITOR_LOOKUP_CACHE,
  })
}

export function useOpcoesPagamentoDocumento() {
  return useQuery({
    queryKey: ['documento-editor', 'opcoes-pagamento'],
    queryFn: async () => {
      const res = await DocumentoEmissaoService(ID).getOpcoesPagamento()
      if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
        return {
          tiposSerie: [],
          impostosRetencao: [],
          referenciasMb: [],
        }
      }
      return {
        tiposSerie: res.info.data.tiposSerie ?? [],
        impostosRetencao: res.info.data.impostosRetencao ?? [],
        referenciasMb: res.info.data.referenciasMb ?? [],
      }
    },
    ...EDITOR_LOOKUP_CACHE,
  })
}

export function useMotivosIsencaoDocumento(keyword = '') {
  return useQuery({
    queryKey: ['documento-editor', 'motivos-isencao', keyword],
    queryFn: async () => {
      const res = await MotivoIsencaoService(ID).getMotivosIsencaoLight(keyword)
      if (res.info?.status !== ResponseStatus.Success) return []
      return res.info.data ?? []
    },
    ...EDITOR_LOOKUP_CACHE,
  })
}

export function useMotivosRetencaoDocumento(tipoImposto: string, keyword = '') {
  return useQuery({
    queryKey: ['documento-editor', 'motivos-retencao', tipoImposto, keyword],
    enabled: !!tipoImposto,
    queryFn: async () => {
      const res = await MotivoRetencaoService(ID).getMotivosRetencaoLight(
        keyword,
        tipoImposto,
      )
      if (res.info?.status !== ResponseStatus.Success) return []
      return res.info.data ?? []
    },
    ...EDITOR_LOOKUP_CACHE,
  })
}

export { useSinistradosInfoFaturacaoMutation, useFaturaGlobalObterMutation } from './documento-editor-mutations'
