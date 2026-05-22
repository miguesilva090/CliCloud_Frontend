import type {
  MarcacaoCalendarioConfigDTO,
  MarcacaoCalendarioEventoDTO,
} from '@/types/dtos/consultas/marcacoes-administrativo.dtos'

/** Legado GS.Lang.DIaFolgaClinicaErro */
export const MSG_HORARIO_INDISPONIVEL = 'Horário indisponível.'

/** Legado GS.Lang.FeriasMedico */
export const MSG_FOLGA_MEDICO = 'Férias/Folga do Médico.'

const TIPOS_BLOQUEIAM_MARCACAO = new Set([
  'Indisponível',
  'Horario Folga',
  'Feriado',
])

/** Permite marcar em Vagas Extra / Horário variável (legado MarcacoesLst). */
const TIPOS_PERMITEM_MARCACAO_NO_BLOCO = new Set(['Horario Variavel', 'Vagas Extra'])

export function isTipoEventoBloqueado(tipoEvento: string): boolean {
  return TIPOS_BLOQUEIAM_MARCACAO.has(tipoEvento)
}

export function isTipoEventoPermiteMarcacaoNoBloco(tipoEvento: string): boolean {
  return TIPOS_PERMITEM_MARCACAO_NO_BLOCO.has(tipoEvento)
}

export function resolveDiasUteis(config?: MarcacaoCalendarioConfigDTO | null): number[] {
  if (config?.diasUteis?.length) return config.diasUteis
  return [1, 2, 3, 4, 5]
}

export function resolveDiasOcultos(config?: MarcacaoCalendarioConfigDTO | null): number[] {
  return config?.diasOcultos ?? []
}

export function isDiaUtilClinica(date: Date, config?: MarcacaoCalendarioConfigDTO | null): boolean {
  const ocultos = resolveDiasOcultos(config)
  if (ocultos.includes(date.getDay())) return false
  const uteis = resolveDiasUteis(config)
  return uteis.includes(date.getDay())
}

function parseEventRange(evt: MarcacaoCalendarioEventoDTO): { start: Date; end: Date } | null {
  const start = new Date(evt.start)
  const end = new Date(evt.end)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  return { start, end }
}

function rangesOverlap(start: Date, end: Date, blockStart: Date, blockEnd: Date): boolean {
  return start < blockEnd && end > blockStart
}

export function findEventoBloqueanteNoIntervalo(
  start: Date,
  end: Date,
  eventos: MarcacaoCalendarioEventoDTO[]
): MarcacaoCalendarioEventoDTO | null {
  for (const evt of eventos) {
    if (!isTipoEventoBloqueado(evt.tipoEvento)) continue
    const range = parseEventRange(evt)
    if (!range) continue
    if (rangesOverlap(start, end, range.start, range.end)) return evt
  }
  return null
}

export function podeMarcarNoIntervalo(
  start: Date,
  end: Date,
  config: MarcacaoCalendarioConfigDTO | undefined,
  eventos: MarcacaoCalendarioEventoDTO[]
): { ok: boolean; mensagem?: string } {
  if (!isDiaUtilClinica(start, config)) {
    return { ok: false, mensagem: MSG_HORARIO_INDISPONIVEL }
  }

  const bloqueante = findEventoBloqueanteNoIntervalo(start, end, eventos)
  if (bloqueante) {
    if (bloqueante.tipoEvento === 'Horario Folga') {
      return { ok: false, mensagem: MSG_FOLGA_MEDICO }
    }
    return { ok: false, mensagem: MSG_HORARIO_INDISPONIVEL }
  }

  return { ok: true }
}

export function mensagemParaTipoEvento(tipoEvento: string): string | null {
  if (tipoEvento === 'Horario Folga') return MSG_FOLGA_MEDICO
  if (isTipoEventoBloqueado(tipoEvento)) return MSG_HORARIO_INDISPONIVEL
  return null
}
