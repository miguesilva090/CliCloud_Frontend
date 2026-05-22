/** Slot de um período (manhã/tarde) por dia da semana. */
export type HorarioDiaSlot = {
  inicio: string
  fim: string
  sala: string
  vagas: string
}

export type HorarioCompletoClinicaInput = {
  interrupcao?: boolean | null
  horaInicManha?: string | null
  horaFimManha?: string | null
  horaInicTarde?: string | null
  horaFimTarde?: string | null
}

const DIAS_SEMANA = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const

const DIAS_UTEIS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'] as const

function fromTimeSpan(s?: string | null): string {
  if (s == null) return ''
  const trimmed = String(s).trim()
  if (!trimmed) return ''
  return trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed
}

function toMinutes(hm: string): number {
  const [h, m] = hm.split(':').map((x) => parseInt(x, 10))
  return (h || 0) * 60 + (m || 0)
}

function emptyGrid(): Record<string, HorarioDiaSlot> {
  return Object.fromEntries(
    DIAS_SEMANA.map((d) => [d, { inicio: '', fim: '', sala: '', vagas: '' }])
  )
}

/**
 * Paridade com HorarioChecked() em MedicosEdt.js — preenche Segunda–Sexta com horário da clínica.
 */
export function buildHorarioCompletoSlots(
  clinica: HorarioCompletoClinicaInput
): { periodo1: Record<string, HorarioDiaSlot>; periodo2: Record<string, HorarioDiaSlot> } {
  const horaManhaIni = fromTimeSpan(clinica.horaInicManha) || '08:00'
  const horaTardeFim = fromTimeSpan(clinica.horaFimTarde) || '20:00'

  let horaManhaFim: string
  let horaTardeIni: string

  if (clinica.interrupcao) {
    horaManhaFim = fromTimeSpan(clinica.horaFimManha) || '12:00'
    horaTardeIni = fromTimeSpan(clinica.horaInicTarde) || '14:00'
  } else {
    const meioDia = '12:00'
    const md = toMinutes(meioDia)
    const ini = toMinutes(horaManhaIni)
    const fim = toMinutes(horaTardeFim)
    if (md > ini && md < fim) {
      horaManhaFim = meioDia
      horaTardeIni = meioDia
    } else {
      horaManhaFim = horaManhaIni
      horaTardeIni = horaManhaIni
    }
  }

  const p1 = emptyGrid()
  const p2 = emptyGrid()

  for (const d of DIAS_UTEIS) {
    p1[d] = { inicio: horaManhaIni, fim: horaManhaFim, sala: '', vagas: '' }
    p2[d] = { inicio: horaTardeIni, fim: horaTardeFim, sala: '', vagas: '' }
  }

  return { periodo1: p1, periodo2: p2 }
}

export function clearHorarioSlots(): {
  periodo1: Record<string, HorarioDiaSlot>
  periodo2: Record<string, HorarioDiaSlot>
} {
  const empty = emptyGrid()
  return { periodo1: { ...empty }, periodo2: { ...empty } }
}

/** Verifica se algum dia guardado tem hora preenchida. */
export function diasTemHorariosPreenchidos(
  dias: Array<{ inicio?: string | null; fim?: string | null }>
): boolean {
  return dias.some((d) => !!fromTimeSpan(d.inicio) || !!fromTimeSpan(d.fim))
}
