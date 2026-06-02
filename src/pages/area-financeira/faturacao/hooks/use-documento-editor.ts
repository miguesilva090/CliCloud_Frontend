import { useEffect, useMemo, useState } from 'react'
import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import type {
  EmitirDocumentoLinhaRequest,
  EmitirDocumentoRequest,
} from '@/types/dtos/faturacao/documento-emissao.dtos'
import { getDocumentoEditorProfile } from '../utils/documento-tipo-editor-profile'
import {
  REGRA_PRECOS_SEM_IVA_INCLUIDO,
  calcularTotaisDocumento,
} from '../utils/documento-editor-calculos'
import type { DocumentoEditorState } from '../types/documento-editor.types'
import {
  useClinicaFaturacaoConfig,
  useMoedasDocumento,
  useMotivosIsencaoDocumento,
  useOpcoesPagamentoDocumento,
} from '../queries/documento-editor-queries'

export function novaLinhaDocumento(): EmitirDocumentoLinhaRequest {
  return {
    descricao: '',
    quantidade: 1,
    precoUnitario: 0,
    taxaIvaPercentagem: 0,
    percentagemDesconto: 0,
    motivoIsencaoId: null,
  }
}

function estadoInicial(
  tipo: TipoDocumentoLightDTO,
  regraFaturacao = REGRA_PRECOS_SEM_IVA_INCLUIDO,
): DocumentoEditorState {
  const hoje = new Date().toISOString().slice(0, 10)
  return {
    tipoDocumentoId: tipo.id,
    tipoAbreviatura: tipo.abreviatura,
    tipoDescricao: tipo.descricao,
    anoFiscal: new Date().getFullYear(),
    dataDocumento: hoje,
    dataVencimentoPagamento: hoje,
    tipoSerie: 'N',
    isentoIva: false,
    motivoIsencaoId: null,
    codigoValidacaoTransporte: '',
    dataTransporte: hoje,
    horaTransporte: new Date().toTimeString().slice(0, 5),
    tipoCliente: 'utente',
    utenteId: null,
    organismoId: null,
    nomeCliente: '',
    moradaCliente: '',
    localidadeCliente: '',
    numeroContribuinteCliente: '',
    codigoPostalId: null,
    codigoPostalTexto: '',
    globalDesde: '',
    globalAte: '',
    numeroSinistrado: '',
    limiteCredito: null,
    observacoes: '',
    moedaId: null,
    moedaCodigo: 'EUR',
    cambio: 1,
    movimentosUtente: [],
    regraFaturacao,
    descontoCliente: 0,
    descontoPagamento: 0,
    percentagemDescontoGlobal: 0,
    ivaCaixa: false,
    retencaoAtiva: false,
    retencaoImposto: '',
    retencaoMotivo: '',
    retencaoTaxa: 0,
    retencaoValor: 0,
    gerarReferenciaMb: 0,
    outros: 0,
    documentoOrigemId: null,
    identificadorUnicoDocumentoOrigem: '',
    dataDocumentoOrigem: '',
    linhas: [],
  }
}

export type UseDocumentoEditorOptions = {
  /** Estado pré-carregado (modo ver documento emitido). */
  initialState?: DocumentoEditorState | null
  /** Não repor o formulário quando o tipo muda (modo ver). */
  freezeTipoReset?: boolean
}
export function useDocumentoEditor(
  tipo: TipoDocumentoLightDTO,
  options?: UseDocumentoEditorOptions,
) {
  const clinicaQ = useClinicaFaturacaoConfig()
  const regraClinica = clinicaQ.data?.regraFaturacao ?? REGRA_PRECOS_SEM_IVA_INCLUIDO
  const moedasQ = useMoedasDocumento()
  const motivosQ = useMotivosIsencaoDocumento()
  const opcoesPagamentoQ = useOpcoesPagamentoDocumento()
  const [state, setState] = useState<DocumentoEditorState>(() =>
    options?.initialState ?? estadoInicial(tipo, regraClinica),
  )

  useEffect(() => {
    if (options?.freezeTipoReset) return
    setState(estadoInicial(tipo, regraClinica))
  }, [tipo.id, regraClinica, options?.freezeTipoReset])

  useEffect(() => {
    if (options?.initialState) {
      setState(options.initialState)
    }
  }, [options?.initialState])

  useEffect(() => {
    if (clinicaQ.data?.regraFaturacao != null) {
      setState((s) => ({ ...s, regraFaturacao: clinicaQ.data!.regraFaturacao }))
    }
  }, [clinicaQ.data?.regraFaturacao])

  const perfil = useMemo(() => getDocumentoEditorProfile(tipo), [tipo])

  const opcoesCalculo = useMemo(
    () => ({
      regraFaturacao: state.regraFaturacao,
      descontoClientePct: state.descontoCliente,
      descontoPagamentoPct: state.descontoPagamento,
      descontoGlobalPct: state.percentagemDescontoGlobal,
      isentoIva: state.isentoIva,
      outros: state.outros,
      retencaoValor: state.retencaoAtiva ? state.retencaoValor : 0,
    }),
    [
      state.regraFaturacao,
      state.descontoCliente,
      state.descontoPagamento,
      state.percentagemDescontoGlobal,
      state.isentoIva,
      state.outros,
      state.retencaoAtiva,
      state.retencaoValor,
    ],
  )

  const totais = useMemo(
    () => calcularTotaisDocumento(state.linhas, opcoesCalculo),
    [state.linhas, opcoesCalculo],
  )

  const moedaItems = useMemo(
    () =>
      (moedasQ.data ?? []).map((m) => ({
        id: m.id,
        label: m.descricao,
      })),
    [moedasQ.data],
  )
  const motivoIsencaoItems = useMemo(
    () =>
      (motivosQ.data ?? []).map((m) => ({
        id: m.id,
        label: `${m.codigo} — ${m.descricao}`,
      })),
    [motivosQ.data],
  )
  const condicaoPagamentoItems = useMemo(
    () =>
      (opcoesPagamentoQ.data?.condicoesPagamento ?? []).map((o) => ({
        value: String(o.valor),
        label: o.descricao,
      })),
    [opcoesPagamentoQ.data?.condicoesPagamento],
  )
  const modoPagamentoItems = useMemo(
    () =>
      (opcoesPagamentoQ.data?.modosPagamento ?? []).map((o) => ({
        value: String(o.valor),
        label: o.descricao,
      })),
    [opcoesPagamentoQ.data?.modosPagamento],
  )
  const tipoSerieItems = useMemo(
    () =>
      (opcoesPagamentoQ.data?.tiposSerie ?? []).map((o) => ({
        value: o.valor as 'N' | 'D' | 'M',
        label: o.descricao,
      })),
    [opcoesPagamentoQ.data?.tiposSerie],
  )
  const referenciaMbItems = useMemo(
    () =>
      (opcoesPagamentoQ.data?.referenciasMb ?? []).map((o) => ({
        value: String(o.valor),
        label: o.descricao,
      })),
    [opcoesPagamentoQ.data?.referenciasMb],
  )
  const impostosRetencaoItems = useMemo(
    () =>
      (opcoesPagamentoQ.data?.impostosRetencao ?? []).map((o) => ({
        value: o.valor as 'IRS' | 'IRC' | 'IS',
        label: o.descricao,
      })),
    [opcoesPagamentoQ.data?.impostosRetencao],
  )

  const patch = (p: Partial<DocumentoEditorState>) =>
    setState((s) => ({ ...s, ...p }))

  const toEmitirRequest = (): EmitirDocumentoRequest | null => {
    const linhasValidas = state.linhas.filter(
      (l) => l.descricao.trim() && l.quantidade > 0,
    )
    if (!linhasValidas.length) return null
    if (!state.nomeCliente.trim() || !state.moradaCliente.trim()) return null
    if (state.retencaoAtiva && !state.retencaoMotivo.trim()) return null
    if (state.isentoIva && !state.motivoIsencaoId) return null
    if (
      state.retencaoAtiva &&
      state.retencaoTaxa <= 0 &&
      state.retencaoValor <= 0
    )
      return null

    return {
      tipoDocumentoId: state.tipoDocumentoId,
      anoFiscal: state.anoFiscal,
      dataDocumento: state.dataDocumento,
      dataVencimentoPagamento: state.dataVencimentoPagamento,
      tipoSerie: state.tipoSerie,
      utenteId: state.utenteId,
      organismoId: state.organismoId,
      nomeCliente: state.nomeCliente.trim(),
      moradaCliente: state.moradaCliente.trim(),
      localidadeCliente: state.localidadeCliente.trim() || null,
      numeroContribuinteCliente: state.numeroContribuinteCliente.trim() || null,
      codigoPostalId: state.codigoPostalId,
      condicaoPagamento: state.condicaoPagamento ?? null,
      tipoModoPagamento: state.tipoModoPagamento ?? null,
      moedaId: state.moedaId ?? null,
      taxaCambio: state.moedaId ? state.cambio : null,
      tipoCambio: null,
      isentoIva: state.isentoIva,
      motivoIsencaoId: state.isentoIva ? state.motivoIsencaoId : null,
      ivaCaixa: state.ivaCaixa,
      descontoCliente: state.descontoCliente || null,
      descontoPagamento: state.descontoPagamento || null,
      observacoes: state.observacoes.trim() || null,
      codigoValidacaoTransporte: perfil.mostraTransporte
        ? state.codigoValidacaoTransporte || null
        : null,
      dataTransporte: perfil.mostraTransporte ? state.dataTransporte : null,
      horaTransporte: perfil.mostraTransporte ? state.horaTransporte : null,
      outros: state.outros || null,
      retencaoAtiva: state.retencaoAtiva,
      retencaoImposto: state.retencaoAtiva ? state.retencaoImposto || null : null,
      retencaoMotivo: state.retencaoAtiva ? state.retencaoMotivo.trim() || null : null,
      retencaoTaxa: state.retencaoAtiva ? state.retencaoTaxa : null,
      retencaoValor: state.retencaoAtiva ? state.retencaoValor : null,
      gerarReferenciaMb:
        state.gerarReferenciaMb > 0 ? state.gerarReferenciaMb : null,
      percentagemDescontoGlobal: state.percentagemDescontoGlobal,
      moduloOrigem: null,
      documentoOrigemId: state.documentoOrigemId,
      identificadorUnicoDocumentoOrigem:
        state.identificadorUnicoDocumentoOrigem.trim() || null,
      dataDocumentoOrigem: state.dataDocumentoOrigem || null,
      anulado: false,
      liquidado: false,
      linhas: linhasValidas.map((l, i) => ({
        ...l,
        numeroLinha: i + 1,
        motivoIsencaoId: state.isentoIva
          ? (l.motivoIsencaoId ?? state.motivoIsencaoId)
          : null,
      })),
    }
  }

  return {
    state,
    perfil,
    totais,
    opcoesCalculo,
    moedaItems,
    motivoIsencaoItems,
    condicaoPagamentoItems,
    modoPagamentoItems,
    tipoSerieItems,
    referenciaMbItems,
    impostosRetencaoItems,
    patch,
    toEmitirRequest,
    novaLinha: novaLinhaDocumento,
  }
}
