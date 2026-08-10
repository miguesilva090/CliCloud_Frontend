/** Catálogo estático alinhado ao legado (Duracao + unidades/frequências comuns).
 *  Tabelas dbo.TiposFrequenciaMedicamentos / FrequenciasMedicamentos / QuantidadesMedicamentos
 *  serão migradas depois para schema Prescricao. */

export type PosologiaOption = { value: string; label: string }

export const POSOLOGIA_QUANTIDADE_UNIDADES: PosologiaOption[] = [
  { value: 'comprimido', label: 'comprimido' },
  { value: 'capsula', label: 'cápsula' },
  { value: 'ml', label: 'ml' },
  { value: 'gota', label: 'gota' },
  { value: 'aplicacao', label: 'aplicação' },
  { value: 'saqueta', label: 'saqueta' },
  { value: 'dose', label: 'dose' },
  { value: 'unidade', label: 'unidade' },
  { value: 'injecao', label: 'injecção' },
]

export const POSOLOGIA_TIPOS_FREQUENCIA: PosologiaOption[] = [
  { value: '1', label: 'Intervalo' },
  { value: '2', label: 'Diária' },
  { value: '3', label: 'Semanal' },
]

export const POSOLOGIA_FREQUENCIAS: Array<
  PosologiaOption & { tipo: string }
> = [
  { value: '1x24h', label: '1 vez ao dia', tipo: '1' },
  { value: '2x24h', label: 'de 12/12h', tipo: '1' },
  { value: '3x24h', label: 'de 8/8h', tipo: '1' },
  { value: '4x24h', label: 'de 6/6h', tipo: '1' },
  { value: '1xdia', label: '1x/dia', tipo: '2' },
  { value: '2xdia', label: '2x/dia', tipo: '2' },
  { value: '3xdia', label: '3x/dia', tipo: '2' },
  { value: '4xdia', label: '4x/dia', tipo: '2' },
  { value: '1xsem', label: '1x/semana', tipo: '3' },
  { value: '2xsem', label: '2x/semana', tipo: '3' },
  { value: '3xsem', label: '3x/semana', tipo: '3' },
]

export const POSOLOGIA_DURACAO_UNIDADES: PosologiaOption[] = [
  { value: '1', label: 'Dia' },
  { value: '2', label: 'Semana' },
  { value: '3', label: 'Meses' },
  { value: '4', label: 'Anos' },
  { value: '5', label: 'Duração prolongada' },
  { value: '6', label: 'Até próxima consulta' },
  { value: '7', label: 'Até final da embalagem' },
  { value: '8', label: 'Até melhoria dos sintomas' },
]

/** Valores 1–4 exigem duração valor (legado). */
export function duracaoExigeValor(unidade: string | null | undefined): boolean {
  const n = Number(unidade)
  return n >= 1 && n <= 4
}

export function buildPosologiaDescricao(input: {
  quantidadeValor?: string | null
  quantidadeUnidadeLabel?: string | null
  frequenciaLabel?: string | null
  duracaoValor?: string | null
  duracaoUnidadeLabel?: string | null
  instrucoes?: string | null
}): string {
  const parts: string[] = []
  if (input.quantidadeValor && input.quantidadeUnidadeLabel) {
    parts.push(`${input.quantidadeValor} ${input.quantidadeUnidadeLabel}`)
  }
  if (input.frequenciaLabel) {
    parts.push(`(${input.frequenciaLabel})`)
  }
  let text = parts.join(' ')
  if (input.duracaoUnidadeLabel) {
    const dur = [input.duracaoValor, input.duracaoUnidadeLabel]
      .filter(Boolean)
      .join(' ')
    text = text ? `${text} | ${dur}` : dur
  }
  if (input.instrucoes?.trim()) {
    text = text
      ? `${text} | ${input.instrucoes.trim()}`
      : input.instrucoes.trim()
  }
  return text
}

export const INFARMED_PESQUISA_MODOS = [
  { value: 'medicamento' as const, label: 'Medicamento' },
  { value: 'dci' as const, label: 'Substância Activa (DCI)' },
] as const

export type InfarmedPesquisaModo = (typeof INFARMED_PESQUISA_MODOS)[number]['value']
