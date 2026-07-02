export const COMUNICACAO_FATURAS_ESTADO_COM_OPCOES = [
  { value: 'por_comunicar_sem_pdf', label: 'Por Comunicar s/ PDF' },
  { value: 'por_comunicar_com_pdf', label: 'Por Comunicar c/ PDF' },
  { value: 'comunicado', label: 'Comunicado' },
  { value: 'fechado', label: 'Fechado' },
] as const

export type ComunicacaoFaturasEstadoComValue =
  (typeof COMUNICACAO_FATURAS_ESTADO_COM_OPCOES)[number]['value']

export function getComunicacaoFaturasEstadoComLabel(
  value: string | null | undefined
): string | null {
  if (!value) return null
  return (
    COMUNICACAO_FATURAS_ESTADO_COM_OPCOES.find((opt) => opt.value === value)
      ?.label ?? null
  )
}
