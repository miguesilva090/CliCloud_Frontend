import type {
  EmitirDocumentoLinhaRequest,
  SinistradosInfoFaturacaoResponse,
} from '@/types/dtos/faturacao/documento-emissao.dtos'
import type { DocumentoEditorState } from '../types/documento-editor.types'

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000'

function isLinhaObservacao(id: string) {
  return !id || id === EMPTY_GUID
}

export function mapSinistradosInfoToEditorPatch(
  data: SinistradosInfoFaturacaoResponse,
): Partial<DocumentoEditorState> {
  const linhas: EmitirDocumentoLinhaRequest[] = data.linhas.map((l) => ({
    descricao: l.descricao,
    codigoArtigo: l.codigoServico ?? null,
    servicoId: l.servicoId ?? null,
    sinistradoLinhaServicoId: isLinhaObservacao(l.sinistradoLinhaServicoId)
      ? null
      : l.sinistradoLinhaServicoId,
    quantidade: l.quantidade,
    precoUnitario: l.precoUnitario,
    taxaIvaId: l.taxaIvaId ?? null,
    taxaIvaPercentagem: l.taxaIvaPercentagem,
    motivoIsencaoId: l.motivoIsencaoId ?? null,
    percentagemDesconto: 0,
    valorDesconto: null,
    descontoTipo1: null,
    descontoTipo2: null,
    descontoTipo3: null,
    admissaoServicoId: null,
  }))

  return {
    tipoCliente: 'organismo',
    utenteId: data.utenteId ?? null,
    organismoId: data.organismoId,
    nomeCliente: data.cliente.nome,
    moradaCliente: data.cliente.morada,
    localidadeCliente: data.cliente.localidade ?? '',
    numeroContribuinteCliente: data.cliente.numeroContribuinte ?? '',
    codigoPostalId: data.cliente.codigoPostalId ?? null,
    sinistradoId: data.sinistradoId,
    codigoSinistro: data.codigoSinistro,
    faturaGlobalDesde: '',
    faturaGlobalAte: '',
    linhas,
  }
}
