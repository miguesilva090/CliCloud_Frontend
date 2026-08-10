/** Alinhado a CliCloud.Domain.Enums.CondicaoSns */
export const CONDICOES_SNS = [
  { value: 0, label: 'Não especificado' },
  { value: 1, label: 'Condição SNS' },
  { value: 2, label: 'Terceiro pagador' },
] as const

export function labelCondicaoSns(value: number | null | undefined): string {
  if (value == null) return CONDICOES_SNS[0].label
  return (
    CONDICOES_SNS.find((c) => c.value === value)?.label ??
    CONDICOES_SNS[0].label
  )
}
