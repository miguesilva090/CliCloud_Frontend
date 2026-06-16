import { useEffect, useMemo, useRef, useState } from 'react'
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
  useCondicoesPagamentoDocumento,
  useModosPagamentoDocumento,
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
    organismoRestringeDescontos: false,
    nomeCliente: '',
    moradaCliente: '',
    localidadeCliente: '',
    numeroContribuinteCliente: '',
    codigoPostalId: null,
    codigoPostalTexto: '',
    beneficiario: '',
    limiteCreditoExibicao: '',
    faturaGlobalDesde: '',
    faturaGlobalAte: '',
    sinistradoId: null,
    codigoSinistro: '',
    observacoes: '',
    bancoId: null,
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
    retencaoCodigoMotivo: null,
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
  /** Campos iniciais extra (ex.: contexto ficheiro electrónico → organismo). */
  initialPatch?: Partial<DocumentoEditorState> | null
  /** Não repor o formulário quando o tipo muda (modo ver). */
  freezeTipoReset?: boolean
}

function mergeEstadoEditor(
  tipo: TipoDocumentoLightDTO,
  regraFaturacao: number,
  options?: UseDocumentoEditorOptions,
): DocumentoEditorState {
  const base = options?.initialState ?? estadoInicial(tipo, regraFaturacao)
  return options?.initialPatch ? { ...base, ...options.initialPatch } : base
}

export function useDocumentoEditor(
  tipo: TipoDocumentoLightDTO,
  options?: UseDocumentoEditorOptions,
) {
  const clinicaQ = useClinicaFaturacaoConfig()
  const regraClinica = clinicaQ.data?.regraFaturacao ?? REGRA_PRECOS_SEM_IVA_INCLUIDO
  const moedasQ = useMoedasDocumento()
  const motivosQ = useMotivosIsencaoDocumento()
  const condicoesPagamentoQ = useCondicoesPagamentoDocumento()
  const modosPagamentoQ = useModosPagamentoDocumento('', true)
  const opcoesPagamentoQ = useOpcoesPagamentoDocumento()
  const tipoIdAnteriorRef = useRef(tipo.id)
  const [state, setState] = useState<DocumentoEditorState>(() =>
    mergeEstadoEditor(tipo, regraClinica, options),
  )

  useEffect(() => {
    if (options?.freezeTipoReset) return
    if (tipoIdAnteriorRef.current === tipo.id) return
    tipoIdAnteriorRef.current = tipo.id
    setState(mergeEstadoEditor(tipo, regraClinica, options))
  }, [tipo.id, regraClinica, options?.freezeTipoReset, options?.initialPatch, options?.initialState])

  useEffect(() => {
    if (options?.initialState) {
      setState(options.initialState)
    }
  }, [options?.initialState])

  useEffect(() => {
    if (!options?.initialPatch || options.freezeTipoReset) return
    setState((s) => ({ ...s, ...options.initialPatch! }))
  }, [options?.initialPatch, options?.freezeTipoReset])

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
      (motivosQ.data ?? []).map((m) => {
        const saft = m.codigoSaft?.trim()
        const motivo = m.descricao?.trim() ?? ''
        const norma = m.norma?.trim()
        const mencao = m.mencao?.trim()
        let label = saft ? `${saft} - ${motivo}` : `${m.codigo} — ${motivo}`
        if (norma) label += ` (${norma})`
        else if (mencao) label += ` (${mencao})`
        return { id: m.id, label }
      }),
    [motivosQ.data],
  )
  const condicaoPagamentoItems = useMemo(
    () =>
      (condicoesPagamentoQ.data ?? []).map((c) => ({
        value: c.id,
        label: c.descricao,
      })),
    [condicoesPagamentoQ.data],
  )
  const modoPagamentoItems = useMemo(
    () =>
      (modosPagamentoQ.data ?? []).map((m) => ({
        value: m.id,
        label: m.autocompleteLabel?.trim()
          ? m.autocompleteLabel
          : m.abreviatura?.trim()
            ? `${m.descricao} (${m.abreviatura})`
            : m.descricao,
      })),
    [modosPagamentoQ.data],
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

  useEffect(() => {
    if (!state.retencaoAtiva || state.retencaoTaxa <= 0) return
    const base = totais.total + totais.acerto
    const valor = Math.round(base * (state.retencaoTaxa / 100) * 100) / 100
    if (Math.abs(valor - state.retencaoValor) < 0.005) return
    setState((s) => ({ ...s, retencaoValor: valor }))
  }, [
    state.retencaoAtiva,
    state.retencaoTaxa,
    state.retencaoValor,
    totais.total,
    totais.acerto,
  ])

  const patch = (p: Partial<DocumentoEditorState>) =>
    setState((s) => {
      const next: DocumentoEditorState = { ...s, ...p }
      if (p.isentoIva === true) {
        next.linhas = next.linhas.map((l) => ({
          ...l,
          taxaIvaPercentagem: 0,
          motivoIsencaoId: next.motivoIsencaoId ?? l.motivoIsencaoId,
        }))
      }
      return next
    })

  const toEmitirRequest = (): EmitirDocumentoRequest | null => {
    const linhasValidas = state.linhas.filter(
      (l) => l.descricao.trim() && l.quantidade > 0,
    )
    if (!linhasValidas.length) return null
    if (!state.nomeCliente.trim() || !state.moradaCliente.trim()) return null
    if (state.retencaoAtiva && !state.retencaoMotivo.trim() && state.retencaoCodigoMotivo == null)
      return null
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
      beneficiario: state.beneficiario.trim() || null,
      bancoId: state.bancoId ?? null,
      faturaGlobalDataInicio: state.faturaGlobalDesde
        ? `${state.faturaGlobalDesde}T00:00:00`
        : null,
      faturaGlobalDataFim: state.faturaGlobalAte
        ? `${state.faturaGlobalAte}T00:00:00`
        : null,
      condicaoPagamentoId: state.condicaoPagamentoId ?? null,
      modoPagamentoId: state.modoPagamentoId ?? null,
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
      retencaoCodigoMotivo: state.retencaoAtiva ? state.retencaoCodigoMotivo : null,
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
      sinistradoId: state.sinistradoId,
      anulado: false,
      liquidado: false,
      linhas: linhasValidas.map((l, i) => ({
        ...l,
        numeroLinha: i + 1,
        motivoIsencaoId:
          l.taxaIvaPercentagem === 0 || state.isentoIva
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
    condicoesPagamento: condicoesPagamentoQ.data ?? [],
    modosPagamento: modosPagamentoQ.data ?? [],
    tipoSerieItems,
    referenciaMbItems,
    impostosRetencaoItems,
    patch,
    toEmitirRequest,
    novaLinha: novaLinhaDocumento,
  }
}
