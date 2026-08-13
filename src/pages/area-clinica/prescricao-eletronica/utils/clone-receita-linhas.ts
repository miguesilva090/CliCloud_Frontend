import type {
  CreateReceitaLinhaRequest,
  ReceitaLinhaDTO,
  ReceitaMedicaDTO,
} from '@/types/dtos/prescricao/receita-medica.dtos'

/** Resultado do clone — paridade LoadReceita(..., novareceita=true). */
export type CloneReceitaAnteriorResult = {
  linhas: CreateReceitaLinhaRequest[]
  tipoReceita: number
  receitaRenovavel: number
  numeroVias: number
  observacoes: string
  numeroBeneficiarioEfr: string
  siglaEfr: string | null
}

function cloneLinha(l: ReceitaLinhaDTO, ordem: number): CreateReceitaLinhaRequest {
  return {
    ordem,
    tipoLinha: l.tipoLinha || 1,
    embId: l.embId ?? null,
    cnpem: l.cnpem ?? null,
    designacao: l.designacao,
    descricaoEmbalagem: l.descricaoEmbalagem ?? null,
    quantidade: l.quantidade || 1,
    pvp: l.pvp ?? null,
    comparticipacao: l.comparticipacao ?? null,
    valorUtente: l.valorUtente ?? null,
    posologia: l.posologia ?? null,
    posologiaQuantidadeUnidade: l.posologiaQuantidadeUnidade ?? null,
    posologiaQuantidadeValor: l.posologiaQuantidadeValor ?? null,
    posologiaFrequenciaUnidade: l.posologiaFrequenciaUnidade ?? null,
    posologiaFrequenciaValor: l.posologiaFrequenciaValor ?? null,
    posologiaDuracaoUnidade: l.posologiaDuracaoUnidade ?? null,
    posologiaDuracaoValor: l.posologiaDuracaoValor ?? null,
    posologiaInstrucoes: l.posologiaInstrucoes ?? null,
    codValidade: l.codValidade ?? 1,
    codJustificacaoQuantidade: l.codJustificacaoQuantidade ?? null,
    justificacaoQuantidade: l.justificacaoQuantidade ?? null,
    codTipoPrescricao: l.codTipoPrescricao ?? 1,
    codMotivo: l.codMotivo ?? null,
    codIndicacaoTerapeutica: l.codIndicacaoTerapeutica ?? null,
    diploma: l.diploma ?? null,
  }
}

/**
 * Clona receita anterior para rascunho novo.
 * Não copia id / nº SPMS / enviada / anulada / data (data fica a actual no edit).
 */
export function cloneReceitaAnterior(
  receita: ReceitaMedicaDTO
): CloneReceitaAnteriorResult {
  const linhas = (receita.linhas ?? []).map((l, idx) =>
    cloneLinha(l, idx + 1)
  )
  return {
    linhas,
    tipoReceita: receita.tipoReceita || 1,
    receitaRenovavel: receita.receitaRenovavel ?? 0,
    numeroVias: receita.numeroVias ?? 1,
    observacoes: receita.observacoes ?? '',
    numeroBeneficiarioEfr: receita.numeroBeneficiarioEfr ?? '',
    siglaEfr: receita.siglaEfr ?? null,
  }
}

export const MSG_RECEITAS_ANTERIORES = {
  utenteMissing: 'Seleccione o utente.',
  vazia: 'Este utente não tem receitas anteriores.',
  carregada: 'Linhas da receita anterior carregadas no rascunho.',
  erro: 'Não foi possível carregar a receita seleccionada.',
} as const
