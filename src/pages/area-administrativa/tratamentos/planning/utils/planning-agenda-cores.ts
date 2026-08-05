/** Cores aproximadas à legenda legado Planning. */
export const PLANNING_TIPO_CORES: Record<number, string> = {
  1: '#22c55e', // 1ª sessão
  2: '#3b82f6', // marcada
  3: '#f59e0b', // última
  4: '#ef4444', // última + alta
  5: '#a855f7', // provisório
  6: '#6b7280', // falta
  11: '#14b8a6', // multi-técnico
}

export const PLANNING_TIPO_LABELS: Record<number, string> = {
  1: '1ª sessão',
  2: 'Sessão marcada',
  3: 'Última sessão',
  4: 'Última + alta',
  5: 'Provisório',
  6: 'Falta',
  11: 'Multi-técnico',
}

export function corPorTipoPlanning(tipoEvento: number): string {
  return PLANNING_TIPO_CORES[tipoEvento] ?? PLANNING_TIPO_CORES[2]
}
