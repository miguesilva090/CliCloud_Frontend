/**
 * Paleta legado MarcacoesLst (toolbar, legenda, calendário).
 * Referência visual: barra «Agenda» teal, filtros brancos, barra Dia/Semana cinza claro.
 */
export const MARCACOES_AGENDA_HEADER_BG = '#1f5f5b'
export const MARCACOES_AGENDA_NAV_BG = '#f0f0f0'
export const MARCACOES_AGENDA_TEAL = '#33a199'
export const MARCACOES_AGENDA_TEAL_ACTIVE = '#2a8580'
export const MARCACOES_AGENDA_ACTION_BLUE = '#4b8df8'
export const MARCACOES_AGENDA_VIEW_IDLE = '#ffffff'
export const MARCACOES_AGENDA_VIEW_ACTIVE = '#64748b'

/** @deprecated Usar MARCACOES_AGENDA_HEADER_BG ou MARCACOES_AGENDA_NAV_BG */
export const MARCACOES_AGENDA_CHROME_BG = MARCACOES_AGENDA_HEADER_BG

export const MARCACOES_AGENDA_CORES = {
  primeiraConsulta: '#b7791f',
  subsequente: '#64748b',
  avFinal: '#6b8f71',
  posOperatorio: '#7c6f87',
  tipoOutro: '#8b8b8b',
  indisponivel: '#e5e7eb',
  feriado: '#f1d0a2',
  vagasExtra: '#d6d8a8',
  horarioVariavel: '#d7b56d',
  horarioFolga: '#cbd5e1',
} as const

/** Botões secundários na barra teal (Lista Espera, Listagens). */
export const MARCACOES_AGENDA_HEADER_BTN =
  'h-8 border border-white/90 bg-white/20 text-white shadow-sm hover:bg-white/30 hover:text-white'

/** Botões de ação azuis (Disponibilidade, Envio SMS). */
export const MARCACOES_AGENDA_ACTION_BTN =
  'h-8 border-0 text-white hover:opacity-90'

export function corPorCodigoLegadoTipoConsulta(codigo?: number | null): string {
  if (codigo === 1) return MARCACOES_AGENDA_CORES.primeiraConsulta
  if (codigo === 2) return MARCACOES_AGENDA_CORES.subsequente
  if (codigo === 3) return MARCACOES_AGENDA_CORES.avFinal
  if (codigo === 4) return MARCACOES_AGENDA_CORES.posOperatorio
  return MARCACOES_AGENDA_CORES.tipoOutro
}

export function corPorTipoEvento(tipoEvento: string, codigoLegado?: number | null): string {
  switch (tipoEvento) {
    case 'Horario Variavel':
      return MARCACOES_AGENDA_CORES.horarioVariavel
    case 'Horario Folga':
      return MARCACOES_AGENDA_CORES.horarioFolga
    case 'Indisponível':
      return MARCACOES_AGENDA_CORES.indisponivel
    case 'Feriado':
      return MARCACOES_AGENDA_CORES.feriado
    case 'Vagas Extra':
      return MARCACOES_AGENDA_CORES.vagasExtra
    case 'Marcacao':
      return corPorCodigoLegadoTipoConsulta(codigoLegado)
    default:
      return MARCACOES_AGENDA_CORES.tipoOutro
  }
}

export function isEventoMarcacao(tipoEvento: string): boolean {
  return tipoEvento === 'Marcacao'
}

export function isEventoBackground(tipoEvento: string): boolean {
  return (
    tipoEvento === 'Horario Variavel' ||
    tipoEvento === 'Horario Folga' ||
    tipoEvento === 'Indisponível' ||
    tipoEvento === 'Feriado' ||
    tipoEvento === 'Vagas Extra'
  )
}
