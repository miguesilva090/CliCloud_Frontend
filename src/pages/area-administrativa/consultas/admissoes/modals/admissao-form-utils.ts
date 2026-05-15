import type { PaginatedResponse } from '@/types/api/responses'
import type {
  AdmissaoDTO,
  AdmissaoServicoDTO,
  CreateAdmissaoRequest,
} from '@/types/dtos/consultas/admissao.dtos'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import { OrigemAdmissao } from '@/types/dtos/consultas/admissao.dtos'

export type TaxaModeradora = 'isento' | 'nao-isento' | 'e111' | 'h'

export type LinhaServicoForm = {
  id: string
  servicoId: string
  subsistemaServicoId: string
  subsistemaLinhaLabel: string
  codigoServico: string
  codigoArtigo: string
  descricao: string
  quantidade: string
  valorUnitario: string
  percentagem: string
  valorOrganismo: string
  valorUtente: string
  descClinica: string
  nrDente: string
  quadrante: string
  nrCheque: string
  exame: boolean
  electro: string
  electroDesc: string
  total: string
  selected: boolean
}

export const ELECTRO_OPTIONS = [
  { value: '0', label: '' },
  { value: '1', label: 'Cardiologia' },
  { value: '2', label: 'Análise' },
  { value: '3', label: 'CCF' },
  { value: '4', label: 'Radiologia' },
] as const

export const TAXA_MODERADORA_TO_ISENCAO: Record<TaxaModeradora, number> = {
  isento: 1,
  'nao-isento': 2,
  e111: 3,
  h: 4,
}

export function isencaoToTaxaModeradora(value?: number | null): TaxaModeradora {
  if (value === 2) return 'nao-isento'
  if (value === 3) return 'e111'
  if (value === 4) return 'h'
  return 'isento'
}

export function parseDecimal(value: string): number | undefined {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function formatDecimalInput(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return ''
  return String(value)
}

export function formatMoneyPt(value: number): string {
  if (!Number.isFinite(value)) return '0,00'
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function electroDescFromValue(value?: string | number | null): string {
  const key = String(value ?? '0')
  return ELECTRO_OPTIONS.find((o) => o.value === key)?.label ?? ''
}

export function newLinhaServicoForm(): LinhaServicoForm {
  return {
    id: crypto.randomUUID(),
    servicoId: '',
    subsistemaServicoId: '',
    subsistemaLinhaLabel: '',
    codigoServico: '',
    codigoArtigo: '',
    descricao: '',
    quantidade: '1',
    valorUnitario: '',
    percentagem: '',
    valorOrganismo: '',
    valorUtente: '',
    descClinica: '0',
    nrDente: '',
    quadrante: '',
    nrCheque: '',
    exame: false,
    electro: '0',
    electroDesc: '',
    total: '',
    selected: false,
  }
}

export function extractSubsistemaServicoRows(payload: unknown): SubsistemaServicoDTO[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as SubsistemaServicoDTO[]
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const rows = (payload as PaginatedResponse<SubsistemaServicoDTO>).data
    return rows ?? []
  }
  return []
}

export function buildUtenteOrganismoOptions(utente?: UtenteDTO | null) {
  if (!utente) return [] as { value: string; label: string }[]

  const items = new Map<string, { value: string; label: string }>()
  const add = (
    organismoId?: string | null,
    organismo?: { nome?: string | null; abreviatura?: string | null } | null,
    fallback?: string | null
  ) => {
    if (!organismoId || items.has(organismoId)) return
    const label =
      organismo?.abreviatura?.trim() ||
      organismo?.nome?.trim() ||
      fallback?.trim() ||
      organismoId
    items.set(organismoId, { value: organismoId, label })
  }

  add(utente.organismoId, utente.organismo)
  for (const linha of utente.subsistemaLinhas ?? []) {
    add(linha.organismoId, linha.organismo, linha.designacao)
  }

  return Array.from(items.values())
}

export function resolveBeneficiarioApolice(
  utente: UtenteDTO | null,
  organismoId?: string
): { beneficiario: string; apolice: string } {
  if (!utente) return { beneficiario: '', apolice: '' }
  const linhas = utente.subsistemaLinhas ?? []
  const linha =
    (organismoId
      ? linhas.find((l) => l.organismoId === organismoId)
      : linhas[0]) ?? linhas[0]
  return {
    beneficiario:
      linha?.numeroBeneficiario?.trim() ?? utente.numeroBeneficiarioEfr?.trim() ?? '',
    apolice: linha?.numeroApolice?.trim() ?? '',
  }
}

export function computeLinhaTotal(
  linha: Pick<
    LinhaServicoForm,
    'quantidade' | 'valorUnitario' | 'percentagem' | 'valorOrganismo' | 'descClinica' | 'valorUtente'
  >,
  taxaModeradora: TaxaModeradora,
  taxaModeradoraAtiva: boolean
): { total: number; valorUtente: number; percentagem: number; valorOrganismo: number } {
  const qty = parseDecimal(linha.quantidade) ?? 1
  const valorUnit = parseDecimal(linha.valorUnitario) ?? 0
  const descClinica = parseDecimal(linha.descClinica) ?? 0

  if (taxaModeradoraAtiva && taxaModeradora === 'isento') {
    return { total: 0, valorUtente: 0, percentagem: 100, valorOrganismo: 0 }
  }

  const percentagem = parseDecimal(linha.percentagem)
  const valorOrganismo = parseDecimal(linha.valorOrganismo)
  const valorUtenteInput = parseDecimal(linha.valorUtente)

  let perc = percentagem
  let vOrg = valorOrganismo
  let vUt = valorUtenteInput

  if (perc == null && vOrg != null && valorUnit > 0) {
    perc = (vOrg / valorUnit) * 100
  }
  if (vUt == null && perc != null) {
    vUt = valorUnit - (valorUnit * perc) / 100
  }
  if (vOrg == null && perc != null) {
    vOrg = (valorUnit * perc) / 100
  }

  perc = perc ?? 0
  vOrg = vOrg ?? 0
  vUt = vUt ?? Math.max(0, valorUnit - vOrg)

  const subtotal = valorUnit * qty
  const desconto = (subtotal * descClinica) / 100
  const total = Math.max(0, subtotal - desconto)

  return {
    total,
    valorUtente: (vUt ?? 0) * qty,
    percentagem: perc,
    valorOrganismo: (vOrg ?? 0) * qty,
  }
}

export function linhaFromSubsistema(
  subsistema: SubsistemaServicoDTO,
  servicoCodigo: string,
  servicoDesignacao: string,
  taxaModeradora: TaxaModeradora,
  taxaModeradoraAtiva: boolean
): LinhaServicoForm {
  const row = newLinhaServicoForm()
  row.subsistemaServicoId = subsistema.id
  row.servicoId = subsistema.servicoId
  row.subsistemaLinhaLabel = `${servicoDesignacao} — ${formatMoneyPt(subsistema.valorServico)}`
  row.codigoServico = servicoCodigo
  row.descricao = servicoDesignacao
  row.valorUnitario = formatDecimalInput(subsistema.valorServico)

  const isIsento = taxaModeradoraAtiva && taxaModeradora === 'isento'
  const perc =
    subsistema.valorServico > 0
      ? (subsistema.valorOrganismo / subsistema.valorServico) * 100
      : 0
  row.percentagem = formatDecimalInput(isIsento ? 100 : perc)
  row.valorOrganismo = formatDecimalInput(isIsento ? 0 : subsistema.valorOrganismo)
  row.valorUtente = formatDecimalInput(isIsento ? 0 : subsistema.valorUtente)

  const totals = computeLinhaTotal(row, taxaModeradora, taxaModeradoraAtiva)
  row.total = formatDecimalInput(totals.total)
  row.valorUtente = formatDecimalInput(totals.valorUtente)
  row.percentagem = formatDecimalInput(totals.percentagem)
  row.valorOrganismo = formatDecimalInput(totals.valorOrganismo)
  return row
}

export function linhaToDto(linha: LinhaServicoForm, index: number): AdmissaoServicoDTO {
  const qty = parseDecimal(linha.quantidade) ?? 1
  const valorUnit = parseDecimal(linha.valorUnitario)
  const perc = parseDecimal(linha.percentagem)
  const vOrg = parseDecimal(linha.valorOrganismo)
  const vUt = parseDecimal(linha.valorUtente)
  const descCli = parseDecimal(linha.descClinica)

  return {
    linha: index + 1,
    servicoId: linha.servicoId || null,
    valorServico: valorUnit,
    codigoArtigo: linha.codigoArtigo || null,
    nomeArtigo: linha.descricao || null,
    quantidade: qty,
    margemMed: perc,
    margemIns: vOrg != null && qty > 0 ? vOrg / qty : undefined,
    recInst: vOrg,
    descCli,
    valorUt: vUt,
    dente: linha.nrDente || null,
    nCheque: linha.nrCheque || null,
    electrocardiograma: linha.electro ? Number(linha.electro) : null,
  }
}

export function linhaFromDto(dto: AdmissaoServicoDTO): LinhaServicoForm {
  const row = newLinhaServicoForm()
  row.servicoId = dto.servicoId ?? ''
  row.codigoArtigo = dto.codigoArtigo ?? ''
  row.descricao = dto.nomeArtigo ?? ''
  row.quantidade = formatDecimalInput(dto.quantidade ?? 1)
  row.valorUnitario = formatDecimalInput(dto.valorServico)
  row.percentagem = formatDecimalInput(dto.margemMed)
  row.valorOrganismo = formatDecimalInput(dto.recInst)
  row.valorUtente = formatDecimalInput(dto.valorUt)
  row.descClinica = formatDecimalInput(dto.descCli ?? 0)
  row.nrDente = dto.dente ?? ''
  row.nrCheque = dto.nCheque ?? ''
  row.electro = dto.electrocardiograma != null ? String(dto.electrocardiograma) : '0'
  row.electroDesc = electroDescFromValue(row.electro)
  const qty = parseDecimal(row.quantidade) ?? 1
  const unit = parseDecimal(row.valorUnitario) ?? 0
  row.total = formatDecimalInput(unit * qty)
  row.subsistemaLinhaLabel = row.descricao
  return row
}

export type AdmissaoFormState = {
  codigoAdmissao: string
  utenteId: string
  utenteLabel: string
  organismoAtivo: boolean
  organismoId: string
  organismoLabel: string
  tipoServicoRegistoId: string
  tipoServicoRegistoLabel: string
  usarPontosDescontos: boolean
  pontos: string
  descontosEuro: string
  numDocumento: string
  dataRecibo: string
  numeroUtente: string
  beneficiario: string
  apolice: string
  desconto: string
  taxaModeradoraAtiva: boolean
  taxaModeradora: TaxaModeradora
  presente: boolean
  efetuada: boolean
  faltou: boolean
  justificada: boolean
  naoJustificada: boolean
  motivoJustificacao: string
  data: string
  horaInicio: string
  horaFim: string
  horaChegada: string
  sinistrado: string
  numChegada: string
  tipoConsultaId: string
  medicoId: string
  medicoLabel: string
  especialidadeId: string
  especialidadeNome: string
  salaId: string
  salaLabel: string
  medicoExternoId: string
  medicoExternoLabel: string
  credencial: string
  credencialExterna: boolean
  tipoAdmissaoId: string
  tratamentoCodigo: string
  motivoConsultaId: string
  motivoConsultaLabel: string
  doencaPrincipalId: string
  doencaPrincipalLabel: string
  doencaSecundariaId: string
  doencaSecundariaLabel: string
  obs: string
  confirmado: boolean
  efetuado: boolean
  linhasServico: LinhaServicoForm[]
  numLinhasInserir: string
}

export function createEmptyAdmissaoForm(now = new Date()): AdmissaoFormState {
  return {
    codigoAdmissao: '',
    utenteId: '',
    utenteLabel: '',
    organismoAtivo: true,
    organismoId: '',
    organismoLabel: '',
    tipoServicoRegistoId: '',
    tipoServicoRegistoLabel: '',
    usarPontosDescontos: false,
    pontos: '',
    descontosEuro: '',
    numDocumento: '',
    dataRecibo: '',
    numeroUtente: '',
    beneficiario: '',
    apolice: '',
    desconto: '',
    taxaModeradoraAtiva: true,
    taxaModeradora: 'nao-isento',
    presente: false,
    efetuada: false,
    faltou: false,
    justificada: false,
    naoJustificada: false,
    motivoJustificacao: '',
    data: now.toISOString().slice(0, 10),
    horaInicio: '',
    horaFim: '',
    horaChegada: '',
    sinistrado: '',
    numChegada: '',
    tipoConsultaId: '',
    medicoId: '',
    medicoLabel: '',
    especialidadeId: '',
    especialidadeNome: '',
    salaId: '',
    salaLabel: '',
    medicoExternoId: '',
    medicoExternoLabel: '',
    credencial: '',
    credencialExterna: false,
    tipoAdmissaoId: '',
    tratamentoCodigo: '',
    motivoConsultaId: '',
    motivoConsultaLabel: '',
    doencaPrincipalId: '',
    doencaPrincipalLabel: '',
    doencaSecundariaId: '',
    doencaSecundariaLabel: '',
    obs: '',
    confirmado: false,
    efetuado: false,
    linhasServico: [],
    numLinhasInserir: '1',
  }
}

export function mapDtoToForm(dto: AdmissaoDTO): AdmissaoFormState {
  const base = createEmptyAdmissaoForm()
  return {
    ...base,
    codigoAdmissao: dto.ordem != null ? String(dto.ordem) : '',
    utenteId: dto.utenteId,
    utenteLabel: dto.utenteNome ?? '',
    organismoAtivo: Boolean(dto.organismoId),
    organismoId: dto.organismoId ?? '',
    numeroUtente: dto.utenteNumero ?? '',
    data: dto.data?.slice(0, 10) ?? base.data,
    horaInicio: dto.horaInicio?.slice(0, 5) ?? '',
    horaFim: dto.horaFim?.slice(0, 5) ?? '',
    horaChegada: dto.horaChegada?.slice(0, 5) ?? '',
    sinistrado: dto.sinistrado != null ? String(dto.sinistrado) : '',
    numChegada: dto.ordem != null ? String(dto.ordem) : '',
    tipoConsultaId: dto.tipoConsultaId ?? '',
    medicoId: dto.medicoId ?? '',
    especialidadeId: dto.especialidadeId ?? '',
    salaId: dto.salaId ?? '',
    medicoExternoId: dto.medicoExternoId ?? '',
    credencial: dto.credencial ?? '',
    credencialExterna: dto.credencialExterna === 1,
    tipoAdmissaoId: dto.tipoAdmissaoId ?? '',
    motivoConsultaId: dto.motivoConsultaId ?? '',
    doencaPrincipalId: dto.doencaPrincipalId ?? '',
    doencaPrincipalLabel:
      dto.doencaPrincipalCodigo && dto.doencaPrincipalTitulo
        ? `${dto.doencaPrincipalCodigo} — ${dto.doencaPrincipalTitulo}`
        : '',
    doencaSecundariaId: dto.doencaSecundariaId ?? '',
    doencaSecundariaLabel:
      dto.doencaSecundariaCodigo && dto.doencaSecundariaTitulo
        ? `${dto.doencaSecundariaCodigo} — ${dto.doencaSecundariaTitulo}`
        : '',
    obs: dto.obs ?? '',
    confirmado: Boolean(dto.confirmado),
    efetuado: Boolean(dto.efetuado),
    presente: Boolean(dto.confirmado),
    efetuada: Boolean(dto.efetuado),
    faltou: dto.statusConsulta === 7,
    justificada: dto.justificacao === 1,
    naoJustificada: dto.justificacao === 0,
    motivoJustificacao: dto.motivoJustificacao ?? '',
    linhasServico: (dto.servicos ?? []).map(linhaFromDto),
  }
}

export function toTimeSpan(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`
  return trimmed
}

export function mapFormToPayload(form: AdmissaoFormState): CreateAdmissaoRequest {
  const ordem = parseInt(form.numChegada, 10)
  const sinistrado = parseInt(form.sinistrado, 10)

  return {
    utenteId: form.utenteId,
    organismoId: form.organismoAtivo && form.organismoId ? form.organismoId : undefined,
    medicoId: form.medicoId || undefined,
    especialidadeId: form.especialidadeId || undefined,
    salaId: form.salaId || undefined,
    medicoExternoId: form.medicoExternoId || undefined,
    motivoConsultaId: form.motivoConsultaId || undefined,
    tipoAdmissaoId: form.tipoAdmissaoId || undefined,
    tipoConsultaId: form.tipoConsultaId || undefined,
    data: form.data ? `${form.data}T00:00:00` : undefined,
    horaInicio: toTimeSpan(form.horaInicio) as unknown as CreateAdmissaoRequest['horaInicio'],
    horaFim: toTimeSpan(form.horaFim) as unknown as CreateAdmissaoRequest['horaFim'],
    horaChegada: toTimeSpan(form.horaChegada) as unknown as CreateAdmissaoRequest['horaChegada'],
    credencial: form.credencial || undefined,
    credencialExterna: form.credencialExterna ? 1 : 0,
    confirmado: form.presente || form.confirmado,
    efetuado: form.efetuada || form.efetuado,
    statusConsulta: form.faltou ? 7 : undefined,
    sinistrado: Number.isFinite(sinistrado) ? sinistrado : undefined,
    ordem: Number.isFinite(ordem) ? ordem : undefined,
    justificacao: form.justificada ? 1 : form.naoJustificada ? 0 : undefined,
    motivoJustificacao: form.motivoJustificacao || undefined,
    doencaPrincipalId: form.doencaPrincipalId || undefined,
    doencaSecundariaId: form.doencaSecundariaId || undefined,
    obs: form.obs || undefined,
    origem: OrigemAdmissao.Manual,
    servicos: form.linhasServico
      .filter((l) => l.servicoId || l.descricao)
      .map((l, i) => linhaToDto(l, i)),
  }
}

export function sumLinhasTotal(linhas: LinhaServicoForm[]): number {
  return linhas.reduce((acc, linha) => acc + (parseDecimal(linha.total) ?? 0), 0)
}
