import type { AdmissaoDTO, AdmissaoServicoDTO } from '@/types/dtos/consultas/admissao.dtos'
import type { EmitirDocumentoLinhaRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'
import type { ServicoDTO } from '@/types/dtos/servicos/servico.dtos'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { TaxaIvaLightDTO } from '@/types/dtos/taxas-iva/taxa-iva.dtos'
import { novaLinhaDocumento } from '../hooks/use-documento-editor'

export function findSubsistemaPreco(
  rows: SubsistemaServicoDTO[],
  servicoId: string,
  organismoId: string,
): SubsistemaServicoDTO | undefined {
  return rows.find(
    (r) => r.servicoId === servicoId && r.organismoId === organismoId && !r.inativo,
  )
}

export function taxaPercentagemFromId(
  taxaIvaId: string | null | undefined,
  taxas: TaxaIvaLightDTO[],
): number {
  if (!taxaIvaId) return 0
  const t = taxas.find((x) => x.id === taxaIvaId)
  return t?.taxa ?? 0
}

export function mapServicoToLinhaPatch(
  servico: ServicoDTO,
  taxas: TaxaIvaLightDTO[],
  opts?: { precoUnitario?: number },
): Partial<EmitirDocumentoLinhaRequest> {
  const taxaPct = taxaPercentagemFromId(servico.taxaIvaId, taxas)
  return {
    servicoId: servico.id,
    descricao: servico.designacao,
    precoUnitario: opts?.precoUnitario ?? servico.preco ?? 0,
    taxaIvaId: servico.taxaIvaId ?? null,
    taxaIvaPercentagem: taxaPct,
    motivoIsencaoId:
      taxaPct === 0 ? (servico.motivoIsencaoId ?? null) : null,
  }
}

export function mapAdmissaoServicoToLinha(
  s: AdmissaoServicoDTO,
  taxas: TaxaIvaLightDTO[],
  servico?: ServicoDTO | null,
  opts?: { usarValorUtRecibo?: boolean },
): EmitirDocumentoLinhaRequest {
  const qty = s.quantidade && s.quantidade > 0 ? s.quantidade : 1
  const totalUt = s.valorUt ?? 0
  const precoUnitUt =
    opts?.usarValorUtRecibo && totalUt >= 0
      ? qty > 0
        ? totalUt / qty
        : totalUt
      : null
  const preco =
    precoUnitUt ??
    s.valorServico ??
    s.valorArtigo ??
    servico?.preco ??
    0
  const descricao =
    (s.nomeArtigo?.trim() || servico?.designacao?.trim() || 'Serviço de admissão') ?? ''

  const base = novaLinhaDocumento()
  const taxaIvaId = servico?.taxaIvaId ?? base.taxaIvaId
  const taxaPct = servico
    ? taxaPercentagemFromId(servico.taxaIvaId, taxas)
    : base.taxaIvaPercentagem

  return {
    ...base,
    servicoId: s.servicoId ?? null,
    admissaoServicoId: s.id ?? null,
    codigoArtigo: s.codigoArtigo ?? null,
    descricao,
    quantidade: qty,
    precoUnitario: preco,
    taxaIvaId: taxaIvaId ?? null,
    taxaIvaPercentagem: taxaPct,
    percentagemDesconto: s.descCli ?? base.percentagemDesconto,
    descontoTipo1: s.descInst ?? undefined,
  }
}

export function mapAdmissaoToEditorCliente(
  admissao: AdmissaoDTO,
  opts?: { faturaRecibo?: boolean },
): {
  tipoCliente: 'utente' | 'organismo'
  utenteId: string | null
  organismoId: string | null
  nomeCliente: string
} {
  const utenteId = admissao.utenteId ?? null
  const organismoId = admissao.organismoId ?? null

  /** FR (legado): cliente do documento é o utente; organismo fica como subsistema. */
  if (opts?.faturaRecibo || !organismoId) {
    return {
      tipoCliente: 'utente',
      utenteId,
      organismoId,
      nomeCliente: admissao.utenteNome ?? '',
    }
  }

  return {
    tipoCliente: 'organismo',
    utenteId,
    organismoId,
    nomeCliente: admissao.organismoNome ?? admissao.utenteNome ?? '',
  }
}

export function linhasTemAdmissaoServicoDuplicado(
  linhas: EmitirDocumentoLinhaRequest[],
  novas: EmitirDocumentoLinhaRequest[],
): string | null {
  const existentes = new Set(
    linhas
      .map((l) => l.admissaoServicoId)
      .filter((id): id is string => !!id),
  )
  for (const l of novas) {
    if (l.admissaoServicoId && existentes.has(l.admissaoServicoId)) {
      return 'Um ou mais serviços desta admissão já estão nas linhas do documento.'
    }
  }
  return null
}

export function mergeLinhasImportadas(
  actuais: EmitirDocumentoLinhaRequest[],
  novas: EmitirDocumentoLinhaRequest[],
): EmitirDocumentoLinhaRequest[] {
  const idsJa = new Set(
    actuais
      .map((l) => l.admissaoServicoId)
      .filter((id): id is string => !!id),
  )
  const novasFiltradas = novas.filter(
    (l) => !l.admissaoServicoId || !idsJa.has(l.admissaoServicoId),
  )

  if (actuais.length === 0) return novasFiltradas
  const soPlaceholder = actuais.every(
    (l) => !l.descricao.trim() && !l.servicoId && !l.admissaoServicoId,
  )
  if (soPlaceholder) return novasFiltradas
  return [...actuais, ...novasFiltradas]
}
