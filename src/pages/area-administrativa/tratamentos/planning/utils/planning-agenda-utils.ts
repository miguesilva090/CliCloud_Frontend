import type { EventInput } from '@fullcalendar/core'
import type { PlanningSessaoEventoDTO } from '@/types/dtos/tratamentos/planning-tratamento.dtos'
import { corPorTipoPlanning, PLANNING_TIPO_LABELS } from './planning-agenda-cores'

function textoSobreCor(hex: string): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return '#ffffff'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma > 0.62 ? '#1e293b' : '#ffffff'
}

export function mapPlanningEventoToFullCalendar(
  ev: PlanningSessaoEventoDTO
): EventInput {
  const bg = corPorTipoPlanning(ev.tipoEvento)
  const fg = textoSobreCor(bg)
  return {
    id: ev.sessaoId,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    backgroundColor: bg,
    borderColor: bg,
    textColor: fg,
    extendedProps: {
      ...ev,
      tipoLabel: PLANNING_TIPO_LABELS[ev.tipoEvento] ?? 'Sessão',
    },
  }
}

export function formatIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
