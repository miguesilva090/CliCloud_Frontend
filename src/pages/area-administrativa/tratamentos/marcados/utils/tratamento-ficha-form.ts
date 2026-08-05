import type {
  TratamentoDTO,
  UpdateTratamentoRequest,
} from '@/types/dtos/tratamentos/tratamento.dtos'

export type TratamentoFichaFormValues = {
  utenteId: string
  utenteNome: string
  numeroUtente: string
  telefone: string
  telemovel: string
  utenteLabel: string
  organismoId: string
  organismoLabel: string
  medicoId: string
  medicoLabel: string
  /** Médico associado ao utente (RO) */
  medicoUtenteNome: string
  fisioterapeutaId: string
  fisioterapeutaLabel: string
  auxiliarId: string
  auxiliarLabel: string
  outroTecnicoId: string
  outroTecnicoLabel: string
  unidadeTempoFisio: number
  unidadeTempoAux: number
  unidadeTempoOutro: number
  localTratamentoId: string
  localTratamentoLabel: string
  localOrigemId: string
  localOrigemLabel: string
  designacao: string
  nomePatologia: string
  duracaoTotal: string
  numSessao: string
  dataInic: string
  dataFim: string
  data: string
  numBenif: string
  apolice: string
  credencial: string
  sinistroId: string
  nFaltMax: string
  nFaltComax: string
  nFalta: string
  nFaltaCons: string
  suspenso: boolean
  dataSuspensao: string
  provisorio: boolean
  terapiaFala: boolean
  /** Alta → confDfim no legado */
  alta: boolean
  /** Checkbox “Taxa Moderadora” → taxaMod */
  taxaModAtiva: boolean
  /** 1 = Isento, 2 = Não Isento (legado) */
  isencao: string
  numCartao: string
  cartaoDevolv: boolean
  numDevolucao: string
  /** Display RO (data última alteração) */
  utilizadorLabel: string
  obs: string
  tecObs: string
}

export function toDateInput(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function formatDateTimeLabel(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}`
}

export function emptyTratamentoFichaForm(): TratamentoFichaFormValues {
  return {
    utenteId: '',
    utenteNome: '',
    numeroUtente: '',
    telefone: '',
    telemovel: '',
    utenteLabel: '',
    organismoId: '',
    organismoLabel: '',
    medicoId: '',
    medicoLabel: '',
    medicoUtenteNome: '',
    fisioterapeutaId: '',
    fisioterapeutaLabel: '',
    auxiliarId: '',
    auxiliarLabel: '',
    outroTecnicoId: '',
    outroTecnicoLabel: '',
    unidadeTempoFisio: 1,
    unidadeTempoAux: 1,
    unidadeTempoOutro: 1,
    localTratamentoId: '',
    localTratamentoLabel: '',
    localOrigemId: '',
    localOrigemLabel: '',
    designacao: '',
    nomePatologia: '',
    duracaoTotal: '',
    numSessao: '',
    dataInic: '',
    dataFim: '',
    data: '',
    numBenif: '',
    apolice: '',
    credencial: '',
    sinistroId: '',
    nFaltMax: '',
    nFaltComax: '',
    nFalta: '',
    nFaltaCons: '',
    suspenso: false,
    dataSuspensao: '',
    provisorio: false,
    terapiaFala: false,
    alta: false,
    taxaModAtiva: false,
    isencao: '',
    numCartao: '',
    cartaoDevolv: false,
    numDevolucao: '',
    utilizadorLabel: '',
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
    unidadeTempoFisio: dto.unidadeTempoFisio ?? 1,
    unidadeTempoAux: dto.unidadeTempoAux ?? 1,
    unidadeTempoOutro: dto.unidadeTempoOutro ?? 1,
    localTratamentoId: dto.localTratamentoId ?? '',
    localOrigemId: dto.localOrigemId ?? '',
    designacao: dto.designacao ?? '',
    nomePatologia: dto.nomePatologia ?? '',
    duracaoTotal: dto.duracaoTotal ?? '',
    numSessao: dto.numSessao != null ? String(dto.numSessao) : '',
    dataInic: toDateInput(dto.dataInic),
    dataFim: toDateInput(dto.dataFim),
    data: toDateInput(dto.data),
    numBenif: dto.numBenif ?? '',
    apolice: dto.apolice ?? '',
    credencial: dto.credencial ?? '',
    sinistroId: dto.sinistroId ?? '',
    nFaltMax: dto.nFaltMax != null ? String(dto.nFaltMax) : '',
    nFaltComax: dto.nFaltComax != null ? String(dto.nFaltComax) : '',
    nFalta: dto.nFalta != null ? String(dto.nFalta) : '',
    nFaltaCons: dto.nFaltaCons != null ? String(dto.nFaltaCons) : '',
    suspenso: dto.suspenso === 1,
    dataSuspensao: toDateInput(dto.dataSuspensao),
    provisorio: dto.provisorio === 1,
    terapiaFala: dto.terapiaFala === 1,
    alta: dto.confDfim === 1,
    taxaModAtiva: dto.taxaMod === 1,
    isencao:
      dto.isencao === 1 || dto.isencao === 2 ? String(dto.isencao) : '',
    numCartao: dto.numCartao ?? '',
    cartaoDevolv: dto.cartaoDevolv === 1,
    numDevolucao: dto.numDevolucao ?? '',
    utilizadorLabel: formatDateTimeLabel(
      dto.lastModifiedOn ?? dto.createdOn
    ),
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
    localOrigemId: idOrNull(form.localOrigemId),
    designacao: form.designacao.trim() || null,
    numSessao: parseOptionalInt(form.numSessao),
    dataInic: dateOrNull(form.dataInic),
    confDfim: form.alta ? 1 : 0,
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
    numDevolucao: form.numDevolucao.trim() || null,
    numDestacavel: dto.numDestacavel ?? null,
    estadoU: dto.estadoU ?? null,
    estadoI: dto.estadoI ?? null,
    suspenso: form.suspenso ? 1 : 0,
    dataSuspensao: dateOrNull(form.dataSuspensao),
    provisorio: form.provisorio ? 1 : 0,
    obs: form.obs.trim() || null,
    tecObs: form.tecObs.trim() || null,
    isencao: parseOptionalInt(form.isencao),
    credencial: form.credencial.trim() || null,
    credencialExterna: dto.credencialExterna ?? null,
    destacavelCredencial: dto.destacavelCredencial ?? null,
    taxaMod: form.taxaModAtiva ? 1 : 0,
    inisess: dto.inisess ?? null,
    horaFisio: dto.horaFisio ?? null,
    horaAux: dto.horaAux ?? null,
    horaOutro: dto.horaOutro ?? null,
    duracaoTotal: form.duracaoTotal.trim() || null,
    selOutro: dto.selOutro ?? null,
    numCartao: form.numCartao.trim() || null,
    orespons: dto.orespons ?? null,
    confirmaLoc: dto.confirmaLoc ?? null,
    sinistroId: idOrNull(form.sinistroId) ?? dto.sinistroId ?? null,
    seguradoraId: dto.seguradoraId ?? null,
    documentoId: dto.documentoId ?? null,
    semanaCompleta: dto.semanaCompleta ?? null,
    vemListEsp: dto.vemListEsp ?? null,
    cartaoDevolv: form.cartaoDevolv ? 1 : 0,
    terapiaFala: form.terapiaFala ? 1 : 0,
    numBenif: form.numBenif.trim() || null,
    apolice: form.apolice.trim() || null,
    nomePatologia: form.nomePatologia.trim() || null,
    frespons: dto.frespons ?? null,
    arespons: dto.arespons ?? null,
    lotes: dto.lotes ?? 0,
    sendEmail: false,
    unidadeTempoFisio: form.fisioterapeutaId ? form.unidadeTempoFisio : null,
    unidadeTempoAux: form.auxiliarId ? form.unidadeTempoAux : null,
    unidadeTempoOutro: form.outroTecnicoId ? form.unidadeTempoOutro : null,
  }
}
