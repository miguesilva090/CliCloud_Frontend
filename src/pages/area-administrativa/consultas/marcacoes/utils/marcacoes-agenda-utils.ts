import type { EventInput } from '@fullcalendar/core'
import type {
  MarcacaoAdministrativoTableDTO,
  MarcacaoCalendarioEventoDTO,
} from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import {
  corPorTipoEvento,
  isEventoBackground,
  isEventoMarcacao,
} from './marcacoes-agenda-cores'

const DEFAULT_SLOT_MINUTES = 30

export function parseHoraMarcacao(horaInicio?: string | null): { h: number; m: number } | null {
  if (!horaInicio) return null
  const parts = horaInicio.split(':')
  if (parts.length < 2) return null
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return { h, m }
}

export function buildMarcacaoEventStart(row: MarcacaoAdministrativoTableDTO): Date | null {
  if (!row.data) return null
  const base = new Date(row.data)
  if (Number.isNaN(base.getTime())) return null
  const hora = parseHoraMarcacao(row.horaInicio)
  if (hora) {
    base.setHours(hora.h, hora.m, 0, 0)
  }
  return base
}

export function mapMarcacaoToCalendarEvent(
  row: MarcacaoAdministrativoTableDTO
): EventInput | null {
  const start = buildMarcacaoEventStart(row)
  if (!start) return null

  const end = new Date(start)
  end.setMinutes(end.getMinutes() + DEFAULT_SLOT_MINUTES)

  const utente = [row.utenteNumero, row.utenteNome].filter(Boolean).join(' — ')
  const title = utente || 'Marcação'
  const bg = corPorTipoEvento('Marcacao', null)

  return {
    id: row.id,
    title,
    start,
    end,
    extendedProps: { row, tipoEvento: 'Marcacao' },
    backgroundColor: bg,
    borderColor: bg,
  }
}

export function mapCalendarioEventoToFullCalendar(
  evt: MarcacaoCalendarioEventoDTO
): EventInput | null {
  const start = new Date(evt.start)
  const end = new Date(evt.end)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  const bg = corPorTipoEvento(evt.tipoEvento, evt.codigoLegadoTipoConsulta)
  const background = isEventoBackground(evt.tipoEvento)

  return {
    id: evt.id,
    title: background ? '' : evt.title,
    start,
    end,
    display: background ? 'background' : 'auto',
    backgroundColor: bg,
    borderColor: bg,
    editable: isEventoMarcacao(evt.tipoEvento),
    extendedProps: {
      tipoEvento: evt.tipoEvento,
      marcacaoId: evt.marcacaoId,
      codigoLegadoTipoConsulta: evt.codigoLegadoTipoConsulta,
    },
  }
}

/** Converte "08:00" ou "08:00:00" para slotMinTime do FullCalendar. */
export function toFullCalendarTime(value?: string | null, fallback = '08:00:00'): string {
  if (!value) return fallback
  const parts = value.split(':')
  if (parts.length >= 2) {
    const h = parts[0].padStart(2, '0')
    const m = parts[1].padStart(2, '0')
    const s = parts[2]?.padStart(2, '0') ?? '00'
    return `${h}:${m}:${s}`
  }
  return fallback
}

export function formatIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatTimeForApi(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}:00`
}
