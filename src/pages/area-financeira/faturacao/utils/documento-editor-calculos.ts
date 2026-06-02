import type { EmitirDocumentoLinhaRequest } from '@/types/dtos/faturacao/documento-emissao.dtos'
import type { DocumentoEditorTotais } from '../types/documento-editor.types'

export const REGRA_PRECOS_SEM_IVA_INCLUIDO = 1
export const REGRA_PRECOS_COM_IVA_INCLUIDO = 2

export function parseRegraFaturacao(regrafaturacao?: string | null): number {
  return regrafaturacao?.trim() === '2'
    ? REGRA_PRECOS_COM_IVA_INCLUIDO
    : REGRA_PRECOS_SEM_IVA_INCLUIDO
}

export type LinhaCalculoResult = {
  taxaIvaPercentagem: number
  totalLinhaSemIva: number
  descontoValor: number
  valorIncidencia: number
  valorIva: number
  subTotalLinha: number
  percentagemDescontoEfectiva: number
}

export type ResumoIvaLinha = {
  taxaIvaPercentagem: number
  valorIncidencia: number
  totalIva: number
}

export type OpcoesCalculoDocumento = {
  regraFaturacao: number
  descontoClientePct: number
  descontoPagamentoPct: number
  descontoGlobalPct: number
  isentoIva: boolean
  outros?: number
  retencaoValor?: number
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function calcularPercentagemDescontoEfectiva(
  l: EmitirDocumentoLinhaRequest,
  opts: Pick<
    OpcoesCalculoDocumento,
    'descontoGlobalPct' | 'descontoClientePct' | 'descontoPagamentoPct'
  >,
): number {
  if (opts.descontoGlobalPct > 0) return round2(opts.descontoGlobalPct)
  if (l.percentagemDesconto != null && l.percentagemDesconto > 0) {
    return round2(l.percentagemDesconto)
  }

  const d1 = l.descontoTipo1 ?? 0
  const d2 = l.descontoTipo2 ?? 0
  const d3 = l.descontoTipo3 ?? 0
  const factor =
    (1 - opts.descontoClientePct / 100) *
    (1 - opts.descontoPagamentoPct / 100) *
    (1 - d1 / 100) *
    (1 - d2 / 100) *
    (1 - d3 / 100)

  return round2((1 - factor) * 100)
}

export function calcularLinha(
  l: EmitirDocumentoLinhaRequest,
  opts: OpcoesCalculoDocumento,
): LinhaCalculoResult {
  const taxa = opts.isentoIva ? 0 : (l.taxaIvaPercentagem ?? 0)
  let precoUn = l.precoUnitario

  if (opts.regraFaturacao === REGRA_PRECOS_COM_IVA_INCLUIDO && taxa > 0) {
    precoUn = precoUn / (1 + taxa / 100)
  }

  const totalLinhaSemIva = precoUn * l.quantidade

  let descontoValor: number
  let pctEfectiva: number

  if (l.valorDesconto != null && l.valorDesconto > 0) {
    descontoValor = round2(l.valorDesconto)
    pctEfectiva =
      totalLinhaSemIva > 0 ? round2((descontoValor / totalLinhaSemIva) * 100) : 0
  } else {
    pctEfectiva = calcularPercentagemDescontoEfectiva(l, opts)
    descontoValor = round2(totalLinhaSemIva * (pctEfectiva / 100))
  }

  const totalSemDesconto = totalLinhaSemIva - descontoValor
  const valorIva = round2(totalSemDesconto * (taxa / 100))
  let subTotalLinha = totalSemDesconto
  if (opts.regraFaturacao === REGRA_PRECOS_COM_IVA_INCLUIDO) {
    subTotalLinha = round2(totalSemDesconto + valorIva)
  }

  return {
    taxaIvaPercentagem: taxa,
    totalLinhaSemIva: round2(totalSemDesconto),
    descontoValor,
    valorIncidencia: totalSemDesconto,
    valorIva,
    subTotalLinha,
    percentagemDescontoEfectiva: pctEfectiva,
  }
}

function calcularResumoIva(
  linhas: LinhaCalculoResult[],
  regraFaturacao: number,
): ResumoIvaLinha[] {
  const map = new Map<number, LinhaCalculoResult[]>()
  for (const linha of linhas) {
    const key = linha.taxaIvaPercentagem
    const list = map.get(key) ?? []
    list.push(linha)
    map.set(key, list)
  }

  const resumo: ResumoIvaLinha[] = []
  for (const [taxa, grupo] of map) {
    let valorIncidencia = 0
    let totalIvaGrupo = 0

    for (const linha of grupo) {
      if (regraFaturacao === REGRA_PRECOS_SEM_IVA_INCLUIDO) {
        valorIncidencia += linha.valorIncidencia
      } else {
        totalIvaGrupo += linha.valorIva
        valorIncidencia += linha.subTotalLinha - linha.valorIva
      }
    }

    if (regraFaturacao === REGRA_PRECOS_SEM_IVA_INCLUIDO && taxa > 0) {
      totalIvaGrupo = valorIncidencia * (1 + taxa / 100) - valorIncidencia
    }

    resumo.push({
      taxaIvaPercentagem: taxa,
      valorIncidencia: round2(valorIncidencia),
      totalIva: round2(totalIvaGrupo),
    })
  }

  return resumo.sort((a, b) => a.taxaIvaPercentagem - b.taxaIvaPercentagem)
}

export function calcularTotaisDocumento(
  linhasReq: EmitirDocumentoLinhaRequest[],
  opts: OpcoesCalculoDocumento,
): DocumentoEditorTotais {
  const linhas = linhasReq.map((l) => calcularLinha(l, opts))
  const regra = opts.regraFaturacao

  let totalMercadoria = 0
  let totalDesconto = 0
  let totalImposto = 0

  const map = new Map<number, LinhaCalculoResult[]>()
  for (const linha of linhas) {
    const key = linha.taxaIvaPercentagem
    const list = map.get(key) ?? []
    list.push(linha)
    map.set(key, list)
  }

  for (const [taxa, grupo] of map) {
    let valorIncidencia = 0
    let totalDescGrupo = 0
    let totalIvaGrupo = 0

    for (const linha of grupo) {
      totalDescGrupo += linha.descontoValor
      if (regra === REGRA_PRECOS_SEM_IVA_INCLUIDO) {
        valorIncidencia += linha.valorIncidencia
        totalMercadoria += linha.valorIncidencia + linha.descontoValor
      } else {
        totalIvaGrupo += linha.valorIva
        const incidenciaLinha = linha.subTotalLinha - linha.valorIva
        valorIncidencia += incidenciaLinha
        totalMercadoria += incidenciaLinha + linha.descontoValor
      }
    }

    if (regra === REGRA_PRECOS_SEM_IVA_INCLUIDO && taxa > 0) {
      totalIvaGrupo = valorIncidencia * (1 + taxa / 100) - valorIncidencia
    }

    totalDesconto += totalDescGrupo
    totalImposto += totalIvaGrupo
  }

  const resumoIva = calcularResumoIva(linhas, regra)

  const total = totalMercadoria - totalDesconto + totalImposto
  const acerto = opts.outros ?? 0
  const retencao = opts.retencaoValor ?? 0
  const aPagar = total + acerto - retencao

  return {
    mercadorias: round2(totalMercadoria),
    descontos: round2(totalDesconto),
    impostos: round2(totalImposto),
    total: round2(total),
    acerto,
    retencao,
    aPagar: round2(aPagar),
    resumoIva,
    regraFaturacao: regra,
  }
}

export function calcularSubtotalLinha(
  l: EmitirDocumentoLinhaRequest,
  opts: OpcoesCalculoDocumento,
): number {
  return calcularLinha(l, opts).subTotalLinha
}
