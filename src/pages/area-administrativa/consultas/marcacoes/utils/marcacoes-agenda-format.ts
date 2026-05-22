/** Cabeçalho de coluna no calendário — legado «Qua 20/5». */
const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const

export function formatDiaCabecalhoLegado(date: Date): string {
  const dia = DIAS_ABREV[date.getDay()] ?? ''
  return `${dia} ${date.getDate()}/${date.getMonth() + 1}`
}
