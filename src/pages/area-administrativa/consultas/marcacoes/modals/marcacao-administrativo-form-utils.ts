import type {
  CreateMarcacaoAdministrativoRequest,
  MarcacaoAdministrativoDTO,
  UpdateMarcacaoAdministrativoRequest,
} from '@/types/dtos/consultas/marcacoes-administrativo.dtos'

export type MarcacaoAdministrativoFormState = {
  utenteId: string
  utenteLabel: string
  medicoId: string
  medicoLabel: string
  especialidadeId: string
  especialidadeLabel: string
  data: string
  horaInicio: string
  horaFim: string
  tipoConsultaId: string
  tipoAdmissaoId: string
  organismoId: string
  organismoLabel: string
  credencial: string
  obs: string
  listaEsperaId: string
  vemListaEspera: boolean
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

export function createEmptyMarcacaoForm(
  defaultData?: string,
  defaults?: Partial<MarcacaoAdministrativoFormState>
): MarcacaoAdministrativoFormState {
  return {
    utenteId: '',
    utenteLabel: '',
    medicoId: '',
    medicoLabel: '',
    especialidadeId: '',
    especialidadeLabel: '',
    data: defaultData ?? '',
    horaInicio: '',
    horaFim: '',
    tipoConsultaId: '',
    tipoAdmissaoId: '',
    organismoId: '',
    organismoLabel: '',
    credencial: '',
    obs: '',
    listaEsperaId: '',
    vemListaEspera: false,
    ...defaults,
  }
}

export function mapMarcacaoDtoToForm(dto: MarcacaoAdministrativoDTO): MarcacaoAdministrativoFormState {
  return {
    utenteId: dto.utenteId,
    utenteLabel: dto.utenteNome ?? '',
    medicoId: dto.medicoId ?? '',
    medicoLabel: dto.medicoNome ?? '',
    especialidadeId: dto.especialidadeId ?? '',
    especialidadeLabel: dto.especialidadeDesignacao ?? '',
    data: isoDateOnly(dto.data),
    horaInicio: timeSpanToInput(dto.horaInicio),
    horaFim: timeSpanToInput(dto.horaFim),
    tipoConsultaId: dto.tipoConsultaId ?? '',
    tipoAdmissaoId: dto.tipoAdmissaoId ?? '',
    organismoId: dto.organismoId ?? '',
    organismoLabel: '',
    credencial: dto.credencial ?? '',
    obs: dto.obs ?? '',
    listaEsperaId: '',
    vemListaEspera: false,
  }
}

export function mapMarcacaoFormToCreatePayload(
  form: MarcacaoAdministrativoFormState
): CreateMarcacaoAdministrativoRequest {
  return {
    utenteId: form.utenteId,
    medicoId: form.medicoId || undefined,
    especialidadeId: form.especialidadeId || undefined,
    data: `${form.data}T00:00:00`,
    horaInicio: toTimeSpan(form.horaInicio) as string,
    horaFim: toTimeSpan(form.horaFim),
    tipoConsultaId: form.tipoConsultaId || undefined,
    tipoAdmissaoId: form.tipoAdmissaoId || undefined,
    organismoId: form.organismoId || undefined,
    credencial: form.credencial || undefined,
    obs: form.obs || undefined,
  }
}

export function mapMarcacaoFormToUpdatePayload(
  form: MarcacaoAdministrativoFormState
): UpdateMarcacaoAdministrativoRequest {
  return mapMarcacaoFormToCreatePayload(form)
}
