/**
 * Cores Planning — paridade legado CliCloud.ASPcli/Client/Tratamentos/Planning.*
 *
 * Legado: cores vêm de dbo.DESCRICOES_PLANNING (editáveis no color picker).
 * Defaults de referência:
 * - Planning.aspx (legenda comentada / seed visual clássico) para tipos 1–4 e indisponível
 * - script00387 → Falta #c57b65
 * - script00844 → Mais que um técnico #811ff9
 *
 * Mapeamento Planning.js (prim / tipoEvento → índice cores[]):
 *   1→cores[0], 2→cores[1], 3→cores[2], 4→cores[3],
 *   Indisponível→cores[4], 5→cores[5], 6→cores[6], 11→cores[7]
 */
export const PLANNING_AGENDA_VIEW_IDLE = '#ffffff'
export const PLANNING_AGENDA_VIEW_ACTIVE = '#64748b'

/** Cor de fundo “H. Indisponível” (legado cores[4] / codigo 5). */
export const PLANNING_COR_INDISPONIVEL = '#666666'

export const PLANNING_TIPO_CORES: Record<number, string> = {
  1: '#0066ff', // 1ª Sessão
  2: '#b3b3b3', // Sessões Marcadas
  3: '#ff6600', // Última Sessão
  4: '#ff0000', // Última Sessão com Alta
  5: '#555555', // Provisório (legado cores[5] / codigo 6)
  6: '#c57b65', // Falta (legado cores[6] / codigo 7)
  11: '#811ff9', // Mais que um técnico (legado cores[7] / codigo 8)
}

export const PLANNING_TIPO_LABELS: Record<number, string> = {
  1: '1ª Sessão',
  2: 'Sessões Marcadas',
  3: 'Última Sessão',
  4: 'Última Sessão com Alta',
  5: 'Provisório',
  6: 'Falta',
  11: 'Mais que um técnico',
}

export function corPorTipoPlanning(tipoEvento: number): string {
  return PLANNING_TIPO_CORES[tipoEvento] ?? PLANNING_TIPO_CORES[2]
}
