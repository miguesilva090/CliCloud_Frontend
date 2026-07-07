/** Horas 00–23 */
export const TIME_HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
)

/** Minutos em intervalos de 5 */
export const TIME_MINUTE_OPTIONS = [
  '00',
  '05',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
]

export function snapMinuteToStep(minute: string | number, step = 5): string {
  const n = typeof minute === 'string' ? parseInt(minute, 10) : minute
  if (Number.isNaN(n)) return '00'
  const snapped = Math.round(n / step) * step
  const clamped = Math.min(55, Math.max(0, snapped))
  return String(clamped).padStart(2, '0')
}

export function parseTimeParts(
  value?: string | null,
  minuteStep = 5
): { hour: string; minute: string } {
  if (!value?.trim()) return { hour: '', minute: '' }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!match) return { hour: '', minute: '' }

  const hourNum = parseInt(match[1], 10)
  if (Number.isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
    return { hour: '', minute: '' }
  }

  return {
    hour: String(hourNum).padStart(2, '0'),
    minute: snapMinuteToStep(match[2], minuteStep),
  }
}

export function buildTimeValue(hour: string, minute: string): string {
  if (!hour || !minute) return ''
  return `${hour}:${minute}`
}

export function normalizeTimeValue(
  value?: string | null,
  minuteStep = 5
): string {
  const { hour, minute } = parseTimeParts(value, minuteStep)
  return buildTimeValue(hour, minute)
}
