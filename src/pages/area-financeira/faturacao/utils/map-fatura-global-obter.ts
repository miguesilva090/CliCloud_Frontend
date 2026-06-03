import type {
  EmitirDocumentoLinhaRequest,
  FaturaGlobalObterResponse,
} from '@/types/dtos/faturacao/documento-emissao.dtos'
import type {
  DocumentoEditorState,
  MovimentoUtenteEditor,
} from '../types/documento-editor.types'

function linhaPreco(l: FaturaGlobalObterResponse['linhas'][number]) {
  if (l.precoOrganismo > 0) return l.precoOrganismo
  return l.precoUnitario
}

export function mapFaturaGlobalObterToEditorPatch(
  data: FaturaGlobalObterResponse,
): Partial<DocumentoEditorState> {
  const linhas: EmitirDocumentoLinhaRequest[] = data.linhas.map((l) => {
    const ids = l.admissaoServicosIds ?? []
    return {
      descricao: l.descricao,
      codigoArtigo: l.codigoArtigo ?? null,
      servicoId: l.servicoId ?? null,
      admissaoServicoId: ids.length === 1 ? ids[0] : null,
      admissaoServicosIds: ids.length > 1 ? ids : undefined,
      quantidade: l.quantidade,
      precoUnitario: linhaPreco(l),
      taxaIvaId: l.taxaIvaId ?? null,
      taxaIvaPercentagem: l.taxaIvaPercentagem,
      motivoIsencaoId: l.motivoIsencaoId ?? null,
      percentagemDesconto: 0,
      valorDesconto: null,
      descontoTipo1: null,
      descontoTipo2: null,
      descontoTipo3: null,
      sinistradoLinhaServicoId: null,
    }
  })

  const movimentosUtente: MovimentoUtenteEditor[] = data.admissoes.map((a) => ({
    key: a.admissaoId,
    modulo: 'Consultas',
    admissaoId: a.admissaoId,
    codigoAdmissao: a.codigoExibicao,
  }))

  const dataDe = data.dataDe?.slice(0, 10) ?? ''
  const dataAte = data.dataAte?.slice(0, 10) ?? ''

  return {
    tipoCliente: 'organismo',
    utenteId: data.utenteId ?? null,
    organismoId: data.organismoId,
    nomeCliente: data.cliente.nome,
    moradaCliente: data.cliente.morada,
    localidadeCliente: data.cliente.localidade ?? '',
    numeroContribuinteCliente: data.cliente.numeroContribuinte ?? '',
    codigoPostalId: data.cliente.codigoPostalId ?? null,
    faturaGlobalDesde: dataDe,
    faturaGlobalAte: dataAte,
    sinistradoId: null,
    codigoSinistro: '',
    linhas,
    movimentosUtente,
  }
}
