import type {
  TratamentoDTO,
  UpdateTratamentoRequest,
} from '@/types/dtos/tratamentos/tratamento.dtos'

export type TratamentoFichaFormValues = {
  utenteId: string
  utenteLabel: string
  organismoId: string
  organismoLabel: string
  medicoId: string
  medicoLabel: string
  fisioterapeutaId: string
  fisioterapeutaLabel: string
  auxiliarId: string
  auxiliarLabel: string
  outroTecnicoId: string
  outroTecnicoLabel: string
  localTratamentoId: string
  localTratamentoLabel: string
  designacao: string
  nomePatologia: string
  numSessao: string
  dataInic: string
  dataFim: string
  data: string
  numBenif: string
  apolice: string
  credencial: string
  nFaltMax: string
  nFaltComax: string
  nFalta: string
  nFaltaCons: string
  suspenso: boolean
  dataSuspensao: string
  provisorio: boolean
  terapiaFala: boolean
  obs: string
  tecObs: string
}

export function toDateInput(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function emptyTratamentoFichaForm(): TratamentoFichaFormValues {
  return {
    utenteId: '',
    utenteLabel: '',
    organismoId: '',
    organismoLabel: '',
    medicoId: '',
    medicoLabel: '',
    fisioterapeutaId: '',
    fisioterapeutaLabel: '',
    auxiliarId: '',
    auxiliarLabel: '',
    outroTecnicoId: '',
    outroTecnicoLabel: '',
    localTratamentoId: '',
    localTratamentoLabel: '',
    designacao: '',
    nomePatologia: '',
    numSessao: '',
    dataInic: '',
    dataFim: '',
    data: '',
    numBenif: '',
    apolice: '',
    credencial: '',
    nFaltMax: '',
    nFaltComax: '',
    nFalta: '',
    nFaltaCons: '',
    suspenso: false,
    dataSuspensao: '',
    provisorio: false,
    terapiaFala: false,
    obs: '',
    tecObs: '',
  }
}

export function dtoToTratamentoFichaForm(
  dto: TratamentoDTO
): TratamentoFichaFormValues {
  return {
    ...emptyTratamentoFichaForm(),
    utenteId: dto.utenteId ?? '',
    organismoId: dto.organismoId ?? '',
    medicoId: dto.medicoId ?? '',
    fisioterapeutaId: dto.fisioterapeutaId ?? '',
    auxiliarId: dto.auxiliarId ?? '',
    outroTecnicoId: dto.outroTecnicoId ?? '',
    localTratamentoId: dto.localTratamentoId ?? '',
    designacao: dto.designacao ?? '',
    nomePatologia: dto.nomePatologia ?? '',
    numSessao: dto.numSessao != null ? String(dto.numSessao) : '',
    dataInic: toDateInput(dto.dataInic),
    dataFim: toDateInput(dto.dataFim),
    data: toDateInput(dto.data),
    numBenif: dto.numBenif ?? '',
    apolice: dto.apolice ?? '',
    credencial: dto.credencial ?? '',
    nFaltMax: dto.nFaltMax != null ? String(dto.nFaltMax) : '',
    nFaltComax: dto.nFaltComax != null ? String(dto.nFaltComax) : '',
    nFalta: dto.nFalta != null ? String(dto.nFalta) : '',
    nFaltaCons: dto.nFaltaCons != null ? String(dto.nFaltaCons) : '',
    suspenso: dto.suspenso === 1,
    dataSuspensao: toDateInput(dto.dataSuspensao),
    provisorio: dto.provisorio === 1,
    terapiaFala: dto.terapiaFala === 1,
    obs: dto.obs ?? '',
    tecObs: dto.tecObs ?? '',
  }
}

function parseOptionalInt(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

function dateOrNull(raw: string): string | null {
  return raw.trim() ? raw : null
}

function idOrNull(raw: string): string | null {
  return raw.trim() || null
}

/**
 * Envia o DTO completo + overrides do formulário.
 * O Update do Backend mapeia todos os campos — omitir FKs apaga-os.
 */
export function buildUpdateTratamentoPayload(
  dto: TratamentoDTO,
  form: TratamentoFichaFormValues
): UpdateTratamentoRequest {
  return {
    utenteId: idOrNull(form.utenteId) ?? dto.utenteId ?? null,
    medicoId: idOrNull(form.medicoId),
    fisioterapeutaId: idOrNull(form.fisioterapeutaId),
    auxiliarId: idOrNull(form.auxiliarId),
    outroTecnicoId: idOrNull(form.outroTecnicoId),
    organismoId: idOrNull(form.organismoId),
    localTratamentoId: idOrNull(form.localTratamentoId),
    tratamentoPredId: dto.tratamentoPredId ?? null,
    localOrigemId: dto.localOrigemId ?? null,
    designacao: form.designacao.trim() || null,
    numSessao: parseOptionalInt(form.numSessao),
    dataInic: dateOrNull(form.dataInic),
    confDfim: dto.confDfim ?? null,
    dataFim: dateOrNull(form.dataFim),
    data: dateOrNull(form.data),
    nFaltMax: parseOptionalInt(form.nFaltMax),
    nFaltComax: parseOptionalInt(form.nFaltComax),
    nFalta: dto.nFalta ?? null,
    nFaltaCons: dto.nFaltaCons ?? null,
    nAltSess: dto.nAltSess ?? null,
    preco: dto.preco ?? null,
    descInst: dto.descInst ?? null,
    descCli: dto.descCli ?? null,
    valorDesc: dto.valorDesc ?? null,
    reciboId: dto.reciboId ?? null,
    dataRecibo: dto.dataRecibo ?? null,
    pago: dto.pago ?? null,
    faturado: dto.faturado ?? null,
    numDevolucao: dto.numDevolucao ?? null,
    numDestacavel: dto.numDestacavel ?? null,
    estadoU: dto.estadoU ?? null,
    estadoI: dto.estadoI ?? null,
    suspenso: form.suspenso ? 1 : 0,
    dataSuspensao: dateOrNull(form.dataSuspensao),
    provisorio: form.provisorio ? 1 : 0,
    obs: form.obs.trim() || null,
    tecObs: form.tecObs.trim() || null,
    isencao: dto.isencao ?? null,
    credencial: form.credencial.trim() || null,
    credencialExterna: dto.credencialExterna ?? null,
    destacavelCredencial: dto.destacavelCredencial ?? null,
    taxaMod: dto.taxaMod ?? null,
    inisess: dto.inisess ?? null,
    horaFisio: dto.horaFisio ?? null,
    horaAux: dto.horaAux ?? null,
    horaOutro: dto.horaOutro ?? null,
    duracaoTotal: dto.duracaoTotal ?? null,
    selOutro: dto.selOutro ?? null,
    numCartao: dto.numCartao ?? null,
    orespons: dto.orespons ?? null,
    confirmaLoc: dto.confirmaLoc ?? null,
    sinistroId: dto.sinistroId ?? null,
    seguradoraId: dto.seguradoraId ?? null,
    documentoId: dto.documentoId ?? null,
    semanaCompleta: dto.semanaCompleta ?? null,
    vemListEsp: dto.vemListEsp ?? null,
    cartaoDevolv: dto.cartaoDevolv ?? null,
    terapiaFala: form.terapiaFala ? 1 : 0,
    numBenif: form.numBenif.trim() || null,
    apolice: form.apolice.trim() || null,
    nomePatologia: form.nomePatologia.trim() || null,
    frespons: dto.frespons ?? null,
    arespons: dto.arespons ?? null,
    lotes: dto.lotes ?? 0,
    sendEmail: false,
  }
}
