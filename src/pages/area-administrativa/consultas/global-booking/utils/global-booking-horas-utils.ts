import type {
  MarcacaoCalendarioDTO,
  MarcacaoCalendarioEventoDTO,
} from '@/types/dtos/consultas/marcacoes-administrativo.dtos'

const BLOCKING_TIPOS = new Set([
  'Marcacao',
  'Feriado',
  'Horario Folga',
  'Indisponível',
])

function parseHm(value: string): number {
  const [h, m] = value.split(':').map((x) => parseInt(x, 10))
  return (h || 0) * 60 + (m || 0)
}

function formatHm(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parseIntervalMinutes(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function eventosNoDia(
  eventos: MarcacaoCalendarioEventoDTO[],
  dataIso: string
): MarcacaoCalendarioEventoDTO[] {
  return eventos.filter((e) => e.start.startsWith(dataIso))
}

function periodosTrabalho(
  eventos: MarcacaoCalendarioEventoDTO[],
  limiteManha: number,
  limiteTarde: number
): Array<{ inicio: number; fim: number }> {
  const indisponivel = eventos
    .filter((e) => e.tipoEvento === 'Indisponível')
    .map((e) => ({
      inicio: parseIntervalMinutes(e.start),
      fim: parseIntervalMinutes(e.end),
    }))
    .sort((a, b) => a.inicio - b.inicio)

  if (indisponivel.length === 0) {
    return [{ inicio: limiteManha, fim: limiteTarde }]
  }

  const work: Array<{ inicio: number; fim: number }> = []
  let cursor = limiteManha
  for (const block of indisponivel) {
    if (block.inicio > cursor) {
      work.push({ inicio: cursor, fim: Math.min(block.inicio, limiteTarde) })
    }
    if (block.fim > cursor) {
      cursor = block.fim
    }
  }
  if (cursor < limiteTarde) {
    work.push({ inicio: cursor, fim: limiteTarde })
  }
  return work.filter((p) => p.fim > p.inicio)
}

function slotBloqueado(
  slotStart: number,
  slotEnd: number,
  eventos: MarcacaoCalendarioEventoDTO[]
): boolean {
  return eventos.some((e) => {
    if (!BLOCKING_TIPOS.has(e.tipoEvento)) return false
    if (e.tipoEvento === 'Indisponível') return false
    const ini = parseIntervalMinutes(e.start)
    const fim = parseIntervalMinutes(e.end)
    return slotStart < fim && slotEnd > ini
  })
}

/**
 * Horas livres para agendar (paridade com OrdemMarcacoesObterDisponibilidadeHoras via calendário).
 */
export function extrairHorasDisponiveis(
  calendario: MarcacaoCalendarioDTO | undefined,
  dataIso: string
): string[] {
  if (!calendario?.config) return []

  const diaEventos = eventosNoDia(calendario.eventos, dataIso)
  if (diaEventos.some((e) => e.tipoEvento === 'Feriado')) return []
  const folgaDia = diaEventos.filter((e) => e.tipoEvento === 'Horario Folga')
  const limiteManha = parseHm(calendario.config.limiteManha)
  const limiteTarde = parseHm(calendario.config.limiteTarde)
  const intervalo = parseHm(calendario.config.intervaloMarcacao?.slice(0, 5) ?? '00:30')

  if (
    folgaDia.some((e) => {
      const ini = parseIntervalMinutes(e.start)
      const fim = parseIntervalMinutes(e.end)
      return ini <= limiteManha && fim >= limiteTarde
    })
  ) {
    return []
  }

  const trabalho = periodosTrabalho(diaEventos, limiteManha, limiteTarde)
  const horas: string[] = []

  for (const periodo of trabalho) {
    for (let t = periodo.inicio; t + intervalo <= periodo.fim; t += intervalo) {
      const slotEnd = t + intervalo
      if (!slotBloqueado(t, slotEnd, diaEventos)) {
        horas.push(formatHm(t))
      }
    }
  }

  return [...new Set(horas)].sort()
}
