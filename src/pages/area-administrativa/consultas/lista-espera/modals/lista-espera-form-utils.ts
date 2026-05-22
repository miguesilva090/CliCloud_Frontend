import type {
  CreateListaEsperaRequest,
  ListaEsperaDTO,
  UpdateListaEsperaRequest,
} from '@/types/dtos/consultas/lista-espera-administrativo.dtos'

export type ListaEsperaFormState = {
  utenteId: string
  utenteLabel: string
  medicoId: string
  medicoLabel: string
  especialidadeId: string
  especialidadeLabel: string
  organismoId: string
  organismoLabel: string
  prioridadeId: string
  prioridadeLabel: string
  tipoConsultaId: string
  tipoConsultaLabel: string
  data: string
  horaInicio: string
  horaFim: string
  credencial: string
  obs: string
}

function timeSpanToInput(value: string | null | undefined): string {
  if (value == null || value === '') return ''
  const s = String(value)
  const match = s.match(/^(\d{1,2}):(\d{2})/)
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`
  return s.length >= 5 ? s.slice(0, 5) : s
}

export function toTimeSpan(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`
  return trimmed
}

function isoDateOnly(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function createEmptyListaEsperaForm(defaultData?: string): ListaEsperaFormState {
  return {
    utenteId: '',
    utenteLabel: '',
    medicoId: '',
    medicoLabel: '',
    especialidadeId: '',
    especialidadeLabel: '',
    organismoId: '',
    organismoLabel: '',
    prioridadeId: '',
    prioridadeLabel: '',
    tipoConsultaId: '',
    tipoConsultaLabel: '',
    data: defaultData ?? '',
    horaInicio: '',
    horaFim: '',
    credencial: '',
    obs: '',
  }
}

export function mapListaEsperaDtoToForm(dto: ListaEsperaDTO): ListaEsperaFormState {
  return {
    utenteId: dto.utenteId,
    utenteLabel: dto.utenteNome ?? '',
    medicoId: dto.medicoId ?? '',
    medicoLabel: dto.medicoNome ?? '',
    especialidadeId: dto.especialidadeId ?? '',
    especialidadeLabel: dto.especialidadeDesignacao ?? '',
    organismoId: dto.organismoId ?? '',
    organismoLabel: dto.organismoNome ?? '',
    prioridadeId: dto.prioridadeId ?? '',
    prioridadeLabel: dto.prioridadeDesignacao ?? '',
    tipoConsultaId: dto.tipoConsultaId ?? '',
    tipoConsultaLabel: dto.tipoConsultaDesignacao ?? '',
    data: isoDateOnly(dto.data),
    horaInicio: timeSpanToInput(dto.horaInicio),
    horaFim: timeSpanToInput(dto.horaFim),
    credencial: dto.credencial ?? '',
    obs: dto.obs ?? '',
  }
}

export function mapListaEsperaFormToCreatePayload(
  form: ListaEsperaFormState
): CreateListaEsperaRequest {
  return {
    utenteId: form.utenteId,
    medicoId: form.medicoId || undefined,
    especialidadeId: form.especialidadeId,
    organismoId: form.organismoId || undefined,
    prioridadeId: form.prioridadeId || undefined,
    tipoConsultaId: form.tipoConsultaId || undefined,
    data: `${form.data}T00:00:00`,
    horaInicio: toTimeSpan(form.horaInicio),
    horaFim: toTimeSpan(form.horaFim),
    credencial: form.credencial || undefined,
    obs: form.obs || undefined,
  }
}

export function mapListaEsperaFormToUpdatePayload(
  form: ListaEsperaFormState
): UpdateListaEsperaRequest {
  return mapListaEsperaFormToCreatePayload(form)
}
