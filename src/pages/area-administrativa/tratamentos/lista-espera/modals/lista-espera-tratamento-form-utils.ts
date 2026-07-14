import type {
  CreateListaEsperaTratamentoRequest,
  ListaEsperaTratamentoDTO,
  ListaEsperaTratamentoProximoIdentificadorDTO,
  ListaEsperaTratamentoServicoDTO,
  ListaEsperaTratamentoServicoRequest,
  UpdateListaEsperaTratamentoRequest,
} from '@/types/dtos/tratamentos/lista-espera-tratamento-administrativo.dtos'

export type TaxaModeradoraOpcao = '' | 'isento' | 'nao-isento' | 'f11' | 'h'

export type ListaEsperaTratamentoServicoForm = {
  id: string
  servicoId: string
  subsistemaServicoId: string
  codigoServico: string
  designacao: string
  subsistemaDesignacao: string
  duracao: string
  ordem: number
  selected: boolean
}

export type ListaEsperaTratamentoFormState = {
  codigoListaEspera: string
  ordemOriginal: string
  ordemAtual: string
  dataEntrada: string
  utenteId: string
  utenteLabel: string
  numeroUtente: string
  numeroBeneficiario: string
  numeroApolice: string
  medicoId: string
  medicoLabel: string
  organismoId: string
  organismoLabel: string
  prioridadeId: string
  prioridadeLabel: string
  estadoListaEsperaId: string
  estadoLabel: string
  localTratamentoId: string
  localTratamentoLabel: string
  patologiaId: string
  patologiaLabel: string
  designacao: string
  numSessoes: string
  horaDesejada: string
  nFaltMax: string
  nFaltComax: string
  credencial: string
  validadeCredencial: string
  taxaModeradora: string
  taxaModeradoraOpcao: TaxaModeradoraOpcao
  credencialExterna: boolean
  tecObs: string
  duracaoTotal: string
  obs: string
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

function todayIsoDateOnly(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = Number.parseInt(trimmed, 10)
  return Number.isNaN(n) ? undefined : n
}

export function newListaEsperaServicoForm(ordem: number): ListaEsperaTratamentoServicoForm {
  return {
    id: crypto.randomUUID(),
    servicoId: '',
    subsistemaServicoId: '',
    codigoServico: '',
    designacao: '',
    subsistemaDesignacao: '',
    duracao: '',
    ordem,
    selected: false,
  }
}

export function createEmptyListaEsperaTratamentoForm(): ListaEsperaTratamentoFormState {
  const hoje = todayIsoDateOnly()
  return {
    codigoListaEspera: '',
    ordemOriginal: '',
    ordemAtual: '',
    dataEntrada: hoje,
    utenteId: '',
    utenteLabel: '',
    numeroUtente: '',
    numeroBeneficiario: '',
    numeroApolice: '',
    medicoId: '',
    medicoLabel: '',
    organismoId: '',
    organismoLabel: '',
    prioridadeId: '',
    prioridadeLabel: '',
    estadoListaEsperaId: '',
    estadoLabel: '',
    localTratamentoId: '',
    localTratamentoLabel: '',
    patologiaId: '',
    patologiaLabel: '',
    designacao: '',
    numSessoes: '1',
    horaDesejada: '',
    nFaltMax: '4',
    nFaltComax: '2',
    credencial: '',
    validadeCredencial: hoje,
    taxaModeradora: '',
    taxaModeradoraOpcao: '',
    credencialExterna: false,
    tecObs: '',
    duracaoTotal: '',
    obs: '',
  }
}

export function applyProximoIdentificadorToForm(
  preview: ListaEsperaTratamentoProximoIdentificadorDTO
): Pick<ListaEsperaTratamentoFormState, 'codigoListaEspera' | 'ordemOriginal' | 'ordemAtual'> {
  const ordem = String(preview.proximaOrdem)
  return {
    codigoListaEspera: String(preview.codigoListaEspera),
    ordemOriginal: ordem,
    ordemAtual: ordem,
  }
}

export function mapDtoServicosToForm(
  servicos: ListaEsperaTratamentoServicoDTO[] | undefined
): ListaEsperaTratamentoServicoForm[] {
  return (servicos ?? []).map((s) => ({
    id: s.id,
    servicoId: s.servicoId ?? '',
    subsistemaServicoId: s.subsistemaServicoId ?? '',
    codigoServico: s.codigoServico ?? '',
    designacao: s.designacao ?? '',
    subsistemaDesignacao: s.subsistemaDesignacao ?? '',
    duracao: s.duracao ?? '',
    ordem: s.ordem,
    selected: false,
  }))
}

export function mapServicosFormToPayload(
  servicos: ListaEsperaTratamentoServicoForm[]
): ListaEsperaTratamentoServicoRequest[] {
  return servicos
    .filter((s) => s.servicoId || s.designacao.trim())
    .sort((a, b) => a.ordem - b.ordem)
    .map((s) => ({
      servicoId: s.servicoId || undefined,
      subsistemaServicoId: s.subsistemaServicoId || undefined,
      codigoServico: s.codigoServico || undefined,
      designacao: s.designacao || undefined,
      subsistemaDesignacao: s.subsistemaDesignacao || undefined,
      duracao: s.duracao || undefined,
      ordem: s.ordem,
    }))
}

export function mapListaEsperaTratamentoDtoToForm(
  dto: ListaEsperaTratamentoDTO
): ListaEsperaTratamentoFormState {
  return {
    codigoListaEspera: String(dto.codigoLegado || dto.ordem || ''),
    ordemOriginal:
      dto.ordemOrigem != null ? String(dto.ordemOrigem) : dto.ordem != null ? String(dto.ordem) : '',
    ordemAtual: dto.ordem != null ? String(dto.ordem) : '',
    dataEntrada: isoDateOnly(dto.dataEntrada),
    utenteId: dto.utenteId,
    utenteLabel: dto.utenteNome ?? '',
    numeroUtente: '',
    numeroBeneficiario: '',
    numeroApolice: '',
    medicoId: dto.medicoId ?? '',
    medicoLabel: dto.medicoNome ?? '',
    organismoId: dto.organismoId ?? '',
    organismoLabel: dto.organismoNome ?? '',
    prioridadeId: dto.prioridadeId ?? '',
    prioridadeLabel: dto.prioridadeDesignacao ?? '',
    estadoListaEsperaId: dto.estadoListaEsperaId ?? '',
    estadoLabel: dto.estadoDesignacao ?? '',
    localTratamentoId: dto.localTratamentoId ?? '',
    localTratamentoLabel: dto.localTratamentoDesignacao ?? '',
    patologiaId: dto.patologiaId ?? '',
    patologiaLabel: dto.patologiaDesignacao ?? '',
    designacao: dto.designacao ?? '',
    numSessoes: dto.numSessoes != null ? String(dto.numSessoes) : '1',
    horaDesejada: dto.horaDesejada ?? '',
    nFaltMax: dto.nFaltMax != null ? String(dto.nFaltMax) : '4',
    nFaltComax: dto.nFaltComax != null ? String(dto.nFaltComax) : '2',
    credencial: dto.credencial ?? '',
    validadeCredencial: isoDateOnly(dto.validadeCredencial),
    taxaModeradora: dto.taxaModeradora != null ? String(dto.taxaModeradora) : '',
    taxaModeradoraOpcao: '',
    credencialExterna: dto.credencialExterna ?? false,
    tecObs: dto.tecObs ?? '',
    duracaoTotal: dto.duracaoTotal ?? '',
    obs: '',
  }
}

function mapCommonPayload(form: ListaEsperaTratamentoFormState) {
  return {
    medicoId: form.medicoId || undefined,
    organismoId: form.organismoId || undefined,
    prioridadeId: form.prioridadeId || undefined,
    estadoListaEsperaId: form.estadoListaEsperaId || undefined,
    localTratamentoId: form.localTratamentoId || undefined,
    patologiaId: form.patologiaId || undefined,
    designacao: form.designacao || undefined,
    numSessoes: parseOptionalInt(form.numSessoes),
    horaDesejada: form.horaDesejada || undefined,
    nFaltMax: parseOptionalInt(form.nFaltMax),
    nFaltComax: parseOptionalInt(form.nFaltComax),
    credencial: form.credencial || undefined,
    validadeCredencial: form.validadeCredencial
      ? `${form.validadeCredencial}T00:00:00`
      : undefined,
    taxaModeradora: parseOptionalInt(form.taxaModeradora),
    tecObs: form.tecObs || undefined,
    duracaoTotal: form.duracaoTotal || undefined,
    credencialExterna: form.credencialExterna,
    ordem: parseOptionalInt(form.ordemAtual),
  }
}

export function mapListaEsperaTratamentoFormToCreatePayload(
  form: ListaEsperaTratamentoFormState,
  servicos: ListaEsperaTratamentoServicoForm[]
): CreateListaEsperaTratamentoRequest {
  return {
    utenteId: form.utenteId,
    obs: form.obs || undefined,
    servicos: mapServicosFormToPayload(servicos),
    ...mapCommonPayload(form),
  }
}

export function mapListaEsperaTratamentoFormToUpdatePayload(
  form: ListaEsperaTratamentoFormState,
  servicos: ListaEsperaTratamentoServicoForm[]
): UpdateListaEsperaTratamentoRequest {
  return {
    servicos: mapServicosFormToPayload(servicos),
    ...mapCommonPayload(form),
  }
}
