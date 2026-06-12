import type { DocumentoDTO } from '@/types/dtos/faturacao/documento.dtos'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import type { DocumentoEditorState } from '../types/documento-editor.types'
import { REGRA_PRECOS_SEM_IVA_INCLUIDO } from './documento-editor-calculos'

function parseTipoSerie(value?: string | null): 'N' | 'D' | 'M' {
  const v = (value ?? 'N').toUpperCase()
  if (v === 'D' || v === 'M') return v
  return 'N'
}

export function mapDocumentoToEditorState(
  doc: DocumentoDTO,
  tipo: TipoDocumentoLightDTO,
  regraFaturacao = REGRA_PRECOS_SEM_IVA_INCLUIDO,
): DocumentoEditorState {
  const dataStr = doc.data?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)

  return {
    tipoDocumentoId: tipo.id,
    tipoAbreviatura: tipo.abreviatura,
    tipoDescricao: tipo.descricao,
    anoFiscal: doc.anoFiscal,
    dataDocumento: dataStr,
    dataVencimentoPagamento:
      doc.dataVencimentoPagamento?.slice(0, 10) ?? dataStr,
    tipoSerie: parseTipoSerie(doc.tipoSerie),
    isentoIva: doc.isentoIva ?? false,
    motivoIsencaoId: doc.motivoIsencaoId ?? null,
    codigoValidacaoTransporte: doc.codigoValidacaoTransporte ?? '',
    dataTransporte: doc.dataTransporte?.slice(0, 10) ?? dataStr,
    horaTransporte: doc.horaTransporte?.slice(0, 5) ?? '12:00',
    tipoCliente: doc.organismoId && !doc.utenteId ? 'organismo' : 'utente',
    utenteId: doc.utenteId ?? null,
    organismoId: doc.organismoId ?? null,
    organismoRestringeDescontos: false,
    nomeCliente: doc.nomeCliente ?? '',
    moradaCliente: doc.moradaCliente ?? '',
    localidadeCliente: doc.localidadeCliente ?? '',
    numeroContribuinteCliente: doc.numeroContribuinteCliente ?? '',
    codigoPostalId: doc.codigoPostalId ?? null,
    codigoPostalTexto: doc.codigoPostalCodigo ?? '',
    beneficiario: doc.beneficiario ?? '',
    limiteCreditoExibicao: '',
    faturaGlobalDesde: doc.faturaGlobalDataInicio?.slice(0, 10) ?? '',
    faturaGlobalAte: doc.faturaGlobalDataFim?.slice(0, 10) ?? '',
    sinistradoId: null,
    codigoSinistro: '',
    observacoes: doc.observacoes ?? '',
    moedaId: doc.moedaId ?? null,
    moedaCodigo: 'EUR',
    cambio: doc.taxaCambio ?? 1,
    bancoId: doc.bancoId ?? null,
    condicaoPagamento: doc.condicaoPagamento ?? null,
    tipoModoPagamento: doc.tipoModoPagamento ?? null,
    movimentosUtente: [],
    regraFaturacao,
    descontoCliente: doc.descontoCliente ?? 0,
    descontoPagamento: 0,
    percentagemDescontoGlobal: 0,
    ivaCaixa: doc.ivaCaixa ?? false,
    retencaoAtiva: !!(doc.retencaoValor || doc.retencaoTaxa),
    retencaoImposto: (doc.retencaoImposto as 'IRS' | 'IRC' | 'IS' | '') ?? '',
    retencaoMotivo: doc.retencaoMotivo ?? '',
    retencaoTaxa: doc.retencaoTaxa ?? 0,
    retencaoValor: doc.retencaoValor ?? 0,
    gerarReferenciaMb: 0,
    outros: doc.outros ?? 0,
    documentoOrigemId: doc.documentoOrigemId ?? null,
    identificadorUnicoDocumentoOrigem: doc.identificadorUnicoDocumentoOrigem ?? '',
    dataDocumentoOrigem: doc.dataDocumentoOrigem?.slice(0, 10) ?? '',
    linhas: (doc.linhas ?? []).map((l) => ({
      descricao: l.descricao,
      quantidade: l.quantidade,
      precoUnitario: l.precoUnitario,
      taxaIvaPercentagem: l.taxaIvaPercentagem,
      percentagemDesconto: l.percentagemDesconto ?? 0,
      valorDesconto: l.valorDesconto ?? null,
      servicoId: l.servicoId ?? null,
      admissaoServicoId: l.admissaoServicoId ?? null,
      codigoArtigo: l.codigoArtigo ?? null,
      taxaIvaId: null,
      motivoIsencaoId: null,
    })),
  }
}
