import type { PageFilter } from '@/utils/page-data-utils'

type FlagMap = Record<string, '1' | '0' | ''>

function flagsToFilters(flags: FlagMap): PageFilter[] {
  return Object.entries(flags)
    .filter(([, v]) => v === '1' || v === '0')
    .map(([id, value]) => ({ id, value }))
}

const CLEAR_FLAGS: FlagMap = {
  agendadoSim: '',
  agendadoNao: '',
  recusadoSim: '',
  recusadoNao: '',
  emailPedidoSim: '',
  emailPedidoNao: '',
  smsPedidoSim: '',
  smsPedidoNao: '',
  emailAgendadoSim: '',
  emailAgendadoNao: '',
  smsAgendadoSim: '',
  smsAgendadoNao: '',
}

/** Presets alinhados com FiltrarPorEstado / FiltrarPorEmail / FiltrarPorSms (legado). */
export function buildEstadoPreset(estado: number): PageFilter[] {
  const f: FlagMap = { ...CLEAR_FLAGS }
  switch (estado) {
    case 2:
      f.agendadoNao = '1'
      f.recusadoNao = '1'
      break
    case 3:
      f.agendadoSim = '1'
      break
    case 4:
      f.recusadoSim = '1'
      break
    case 5:
      f.emailPedidoNao = '1'
      f.smsPedidoNao = '1'
      break
    case 6:
      f.agendadoSim = '1'
      f.emailAgendadoNao = '1'
      f.smsAgendadoNao = '1'
      break
    default:
      break
  }
  return flagsToFilters(f)
}

export function buildEmailPreset(estado: number): PageFilter[] {
  const f: FlagMap = { ...CLEAR_FLAGS }
  switch (estado) {
    case 2:
      f.emailPedidoSim = '1'
      break
    case 3:
      f.emailPedidoNao = '1'
      break
    case 4:
      f.agendadoSim = '1'
      f.emailAgendadoSim = '1'
      break
    case 5:
      f.agendadoSim = '1'
      f.emailAgendadoNao = '1'
      break
    default:
      break
  }
  return flagsToFilters(f)
}

export function buildSmsPreset(estado: number): PageFilter[] {
  const f: FlagMap = { ...CLEAR_FLAGS }
  switch (estado) {
    case 2:
      f.smsPedidoSim = '1'
      break
    case 3:
      f.smsPedidoNao = '1'
      break
    case 4:
      f.agendadoSim = '1'
      f.smsAgendadoSim = '1'
      break
    case 5:
      f.agendadoSim = '1'
      f.smsAgendadoNao = '1'
      break
    default:
      break
  }
  return flagsToFilters(f)
}

export function mergePresetWithExisting(
  existing: PageFilter[],
  presetFlags: PageFilter[]
): PageFilter[] {
  const presetIds = new Set([
    'agendadoSim',
    'agendadoNao',
    'recusadoSim',
    'recusadoNao',
    'emailPedidoSim',
    'emailPedidoNao',
    'smsPedidoSim',
    'smsPedidoNao',
    'emailAgendadoSim',
    'emailAgendadoNao',
    'smsAgendadoSim',
    'smsAgendadoNao',
  ])
  const kept = existing.filter((f) => !presetIds.has(f.id))
  return [...kept, ...presetFlags]
}
