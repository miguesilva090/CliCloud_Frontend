import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Printer, Save, X } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { fieldGap, formBlockGap, inputClass, labelClass, selectTriggerClass } from '@/lib/form-styles'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus, type PaginatedResponse } from '@/types/api/responses'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import type {
  LoteDirectDTO,
  LoteDirectTableDTO,
  CreateLoteDirectRequest,
  LoteDirectLinhaUpsertRequest,
} from '@/types/dtos/credenciais/lote-direct.dtos'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import type { OrganismoLightDTO } from '@/types/dtos/saude/organismos.dtos'
import { useLoteDirectFuncionalidadeId } from '../queries/listagem-lote-direct-queries'
import { useDebounce } from 'use-debounce'
import { useMedicosLight } from '@/lib/services/saude/medicos-service/medicos-queries'
import type { MedicoLightDTO } from '@/types/dtos/saude/medicos.dtos'
import { useMedicosExternosLight } from '@/lib/services/utility/lookups/lookups-queries'
import type { MedicoExternoLightDTO } from '@/types/dtos/saude/medicos-externos.dtos'
import type { TipoServicoLightDTO } from '@/types/dtos/servicos/tipo-servico.dtos'
import { useTiposServicoLight ,useServicosLight, useSubsistemasServicoByOrganismo, useProvenienciasUtenteLightForForm, useTiposLoteLight } from '../queries/lote-direct-form-queries'
import type { ProvenienciaUtenteLightDTO } from '@/types/dtos/proveniencias-utente/proveniencia-utente.dtos'
import type { ServicoDTO, ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import type { SubsistemaServicoDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'


type ModalMode = 'view' | 'create' | 'edit'
type TabKey = 'dados-credencial' | 'registo-servicos'
type TaxaModeradora = 'isento' | 'nao-isento' | 'e111' | 'h'
type AreaServico = 'ecg' | 'endoscopia' | 'medicina-dentaria' | 'consultas'
type LinhaFormRow = {
  id: string
  /** Id de `SubsistemaServico` OU valor sintético `__srv_sem_vinculo:{servicoId}` quando não há vínculo. */
  subsistemaServicoId: string
  /** Rótulo guardado quando o id já não está na lista carregada (ex.: edição). */
  subsistemaLinhaLabel: string
  servicoId: string
  quantidade: string
  valorUnitario: string
  valorUtenteOriginal: string
  valorInstituicaoOriginal: string
  valorUtente: string
  valorInstituicao: string
}

/** Prefixo interno da combobox quando o serviço ainda não tem `SubsistemaServico` para o organismo. */
const LOTE_LINHA_SERVICO_SEM_VINCULO_PREFIX = '__srv_sem_vinculo:'

/** Tooltips alinhados com `LoteDirectLinhaUpsertRequest` / `LoteDirectLinha` (mesmos nomes no JSON). */
const LOTE_LINHA_TITLE_QTD =
  'Quantidade de unidades de serviço. No pedido à API: Quantidade (int).'
const LOTE_LINHA_TITLE_VALOR_UNITARIO =
  'Valor unitário do serviço (€ por unidade). No pedido à API: ValorUnitario (decimal).'
const LOTE_LINHA_TITLE_UTENTE_ORIG =
  'Valor por unidade a favor do utente (ex.: taxa moderadora por unidade). No pedido: ValorUtenteOriginal. Se «V. Utente» estiver vazio ao guardar, o total da linha enviado é ValorUtenteOriginal × Quantidade.'
const LOTE_LINHA_TITLE_INST_ORIG =
  'Valor por unidade a favor da instituição / organismo. No pedido: ValorInstituicaoOriginal. Se «V. Instit.» estiver vazio ao guardar, o total enviado é ValorInstituicaoOriginal × Quantidade.'

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
] as const

const AREA_SERVICO_VALUES: Record<AreaServico, number> = {
  ecg: 1,
  endoscopia: 2,
  'medicina-dentaria': 3,
  consultas: 4,
}

const TAXA_MODERADORA_TO_ISENCAO: Record<TaxaModeradora, number> = {
  isento: 1,
  'nao-isento': 2,
  e111: 3,
  h: 4,
}

function isencaoToTaxaModeradora(value?: number | null): TaxaModeradora {
  if (value === 2) return 'nao-isento'
  if (value === 3) return 'e111'
  if (value === 4) return 'h'
  return 'isento'
}

function getAgeFromBirthDate(dateValue?: string | null): string {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - date.getFullYear()
  const monthDiff = today.getMonth() - date.getMonth()
  const dayDiff = today.getDate() - date.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1
  return age >= 0 ? String(age) : ''
}

function toDateInputValue(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function parseDecimal(value: string): number | undefined {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseInteger(value: string): number | undefined {
  const parsed = parseDecimal(value)
  if (parsed == null) return undefined
  return Math.trunc(parsed)
}

function newLinhaFormRow(): LinhaFormRow {
  return {
    id: crypto.randomUUID(),
    subsistemaServicoId: '',
    subsistemaLinhaLabel: '',
    servicoId: '',
    quantidade: '1',
    valorUnitario: '',
    valorUtenteOriginal: '',
    valorInstituicaoOriginal: '',
    valorUtente: '',
    valorInstituicao: '',
  }
}

function buildLinhaValoresFromSubsistema(
  subsistema: SubsistemaServicoDTO,
  quantidade: string,
  taxaModeradora: TaxaModeradora
): Pick<
  LinhaFormRow,
  | 'servicoId'
  | 'valorUnitario'
  | 'valorUtenteOriginal'
  | 'valorInstituicaoOriginal'
  | 'valorUtente'
  | 'valorInstituicao'
> {
  const qty = parseDecimal(quantidade) ?? 1
  const isIsento = taxaModeradora === 'isento'
  const vu = subsistema.valorServico
  const vut = subsistema.valorUtente
  const vorg = subsistema.valorOrganismo

  const valorUtenteOriginal = isIsento ? 0 : vut
  const valorInstituicaoOriginal = isIsento ? vu : vorg

  return {
    servicoId: subsistema.servicoId,
    valorUnitario: formatDecimalInput(vu),
    valorUtenteOriginal: formatDecimalInput(valorUtenteOriginal),
    valorInstituicaoOriginal: formatDecimalInput(valorInstituicaoOriginal),
    valorUtente: formatDecimalInput(valorUtenteOriginal * qty),
    valorInstituicao: formatDecimalInput(valorInstituicaoOriginal * qty),
  }
}

function formatDecimalInput(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return ''
  return String(value)
}

/** Total taxa moderadora da linha (coluna «V. Utente»), alinhado com o envio ao servidor. */
function linhaUtenteTotal(row: LinhaFormRow): number {
  const quantidade = parseInteger(row.quantidade) ?? 1
  const valorUtenteOriginal = parseDecimal(row.valorUtenteOriginal) ?? 0
  return parseDecimal(row.valorUtente) ?? valorUtenteOriginal * quantidade
}

/** Total valor instituição da linha (coluna «V. Instit.»), alinhado com o envio ao servidor. */
function linhaInstituicaoTotal(row: LinhaFormRow): number {
  const quantidade = parseInteger(row.quantidade) ?? 1
  const valorInstituicaoOriginal = parseDecimal(row.valorInstituicaoOriginal) ?? 0
  return parseDecimal(row.valorInstituicao) ?? valorInstituicaoOriginal * quantidade
}

/** Totais do separador «Registo de serviços»: T1+T2+T3 taxas; V1 consulta; V2/V3 somatórios V. Instit. por grelha. */
function computeRegistoSomaTotais(
  valorConsulta: string,
  taxaConsulta: string,
  linhas: LinhaFormRow[],
  linhas789: LinhaFormRow[]
) {
  const v1 = parseDecimal(valorConsulta) ?? 0
  const t1 = parseDecimal(taxaConsulta) ?? 0
  const linhasOk = linhas.filter((r) => r.servicoId.trim() !== '')
  const linhas789Ok = linhas789.filter((r) => r.servicoId.trim() !== '')
  const t2 = linhasOk.reduce((acc, row) => acc + linhaUtenteTotal(row), 0)
  const t3 = linhas789Ok.reduce((acc, row) => acc + linhaUtenteTotal(row), 0)
  const v2 = linhasOk.reduce((acc, row) => acc + linhaInstituicaoTotal(row), 0)
  const v3 = linhas789Ok.reduce((acc, row) => acc + linhaInstituicaoTotal(row), 0)
  return {
    totalTaxas: t1 + t2 + t3,
    totalV2: v2,
    totalV3: v3,
    totalGeral: v1 + v2 + v3,
  }
}

function formatMoneyPt(value: number): string {
  if (!Number.isFinite(value)) return '0,00'
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function resolveServicoCodigo(servico?: ServicoDTO | null): string {
  const codigo = servico?.ean?.trim()
  if (!codigo) return ''
  return codigo.length > 40 ? codigo.slice(0, 40) : codigo
}

function resolveOrganismoCodigo(
  organismoId: string | undefined,
  organismos: OrganismoLightDTO[]
): string {
  if (!organismoId) return ''
  const organismo = organismos.find((item) => item.id === organismoId)
  const codigo = organismo?.abreviatura?.trim() || organismo?.nome?.trim() || organismo?.nomeComercial?.trim()
  if (!codigo) return ''
  return codigo.length > 40 ? codigo.slice(0, 40) : codigo
}

const guidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function looksLikeGuid(value?: string | null): boolean {
  return !!value?.trim() && guidRegex.test(value.trim())
}

function pickSubsistemaServico(
  subsistemas: SubsistemaServicoDTO[],
  organismoId?: string
): SubsistemaServicoDTO | undefined {
  const active = subsistemas.filter((item) => !item.inativo)
  const candidates = active.length > 0 ? active : subsistemas
  if (!organismoId) return candidates[0]
  return candidates.find((item) => item.organismoId === organismoId) ?? candidates[0]
}

function buildConsultaTotals(
  valorServicoUnit: number | undefined,
  valorUtenteUnit: number | undefined,
  quantidade: string,
  taxaModeradora: TaxaModeradora
) {
  const qty = parseDecimal(quantidade) ?? 1
  const valorUnit = valorServicoUnit ?? 0
  const utenteUnit = valorUtenteUnit ?? 0

  return {
    consultaValorServicoUnit: formatDecimalInput(valorUnit),
    consultaValorUtenteUnit: formatDecimalInput(utenteUnit),
    valorConsulta: formatDecimalInput(valorUnit * qty),
    taxaConsulta: formatDecimalInput(taxaModeradora === 'isento' ? 0 : utenteUnit * qty),
  }
}

function extractSubsistemaServicoRows(payload: unknown): SubsistemaServicoDTO[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload as SubsistemaServicoDTO[]
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const rows = (payload as PaginatedResponse<SubsistemaServicoDTO>).data
    return rows ?? []
  }
  return []
}

function SubsistemaLinhaCombobox({
  value,
  onChange,
  disabled,
  isLoading,
  items,
  placeholder,
  emptyText,
  orphanSelected,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  isLoading?: boolean
  items: ComboboxItem[]
  placeholder: string
  emptyText: string
  orphanSelected?: ComboboxItem | null
}) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    setSearch('')
  }, [value])

  const mergedItems = useMemo(() => {
    if (!value || !orphanSelected || items.some((i) => i.value === value)) return items
    return [orphanSelected, ...items]
  }, [items, value, orphanSelected])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mergedItems
    return mergedItems.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.secondary?.toLowerCase().includes(q) ?? false)
    )
  }, [mergedItems, search])

  return (
    <AsyncCombobox
      value={value}
      onChange={onChange}
      items={filteredItems}
      isLoading={isLoading}
      placeholder={placeholder}
      searchPlaceholder='Pesquisar serviço ou valores…'
      emptyText={emptyText}
      disabled={disabled}
      searchValue={search}
      onSearchValueChange={setSearch}
    />
  )
}

async function loadSubsistemasServicoForConsulta(
  servicoId: string,
  organismoId?: string
): Promise<SubsistemaServicoDTO[]> {
  if (organismoId) {
    const response = await SubsistemaServicoService().getSubsistemaServicoPaginated({
      pageNumber: 1,
      pageSize: 100,
      sorting: [],
      servicoId,
      organismoId,
    })
    const payload = response.info?.data
    return extractSubsistemaServicoRows(payload)
  }

  const response = await SubsistemaServicoService().getSubsistemaServico(servicoId)
  return (response.info?.data ?? []) as SubsistemaServicoDTO[]
}

const EMPTY_CONSULTA_FIELDS = {
  servicoConsultaId: '',
  servicoConsultaLabel: '',
  codigoServicoConsulta: '',
  servicoConsulta: '',
  codigoSubsistemaConsulta: '',
  quantidadeConsulta: '1',
  valorConsulta: '',
  taxaConsulta: '',
  consultaValorServicoUnit: '',
  consultaValorUtenteUnit: '',
} as const

type UtenteOrganismoOption = {
  value: string
  label: string
}

function buildUtenteOrganismoOptions(utente?: UtenteDTO | null): UtenteOrganismoOption[] {
  if (!utente) return []

  const items = new Map<string, UtenteOrganismoOption>()

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

async function resolveCodigoOrganismo(organismoId: string): Promise<string> {
  if (!organismoId) return ''

  try {
    const response = await OrganismoService().getOrganismo(organismoId)
    const codigo = response.info?.data?.codigoULSNova
    return codigo != null ? String(codigo) : ''
  } catch {
    return ''
  }
}

function areaFromTipoServico(value?: number | null): AreaServico {
  if (value === 2) return 'endoscopia'
  if (value === 3) return 'medicina-dentaria'
  if (value === 4) return 'consultas'
  return 'ecg'
}

function resetFormState(now = new Date()) {
  return {
    codigo: '',
    utenteId: '',
    utenteLabel: '',
    utenteOrganismoId: '',
    idade: '',
    sexo: '',
    centroSaude: '',
    codigoOrganismo: '',
    taxaModeradora: 'isento' as TaxaModeradora,
    proveniencia: '',
    credencial: '',
    credencialExterna: false,
    tipoLote: '',
    tipoServicoRegistoId: '',
    tipoServicoRegistoLabel: '',
    dataInicio: '',
    dataFim: '',
    servicos: '',
    servicosLabel: '',
    mes: String(now.getMonth() + 1),
    ano: String(now.getFullYear()),
    areaServico: 'ecg' as AreaServico,
    codigoMedico: '',
    medicoId: '',
    medicoLabel: '',
    especialidade: '',
    numeroLote: '',
    medicoExterno: '',
    medicoExternoLabel: '',
    medicoExternoId: '',
    historicoFaturacao: '',
    utilizador: '',
    codigoServicoConsulta: '',
    servicoConsulta: '',
    codigoSubsistemaConsulta: '',
    quantidadeConsulta: '1',
    valorConsulta: '',
    taxaConsulta: '',
    consultaValorServicoUnit: '',
    consultaValorUtenteUnit: '',
    procedimentosEfetuados: false,
    servicoConsultaId: '',
    servicoConsultaLabel: '',
  }
}

export function LoteDirectFormModal({
  open,
  onOpenChange,
  mode,
  loteId,
  viewData,
  onSuccess,
  renderAsPage = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  loteId?: string | null
  viewData?: LoteDirectTableDTO | null
  onSuccess?: () => void
  renderAsPage?: boolean
}) {
  const queryClient = useQueryClient()
  const permId = useLoteDirectFuncionalidadeId()
  const isView = mode === 'view'
  const isCreate = mode === 'create'
  const [activeTab, setActiveTab] = useState<TabKey>('dados-credencial')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [utenteSearch, setUtenteSearch] = useState('')
  const [medicoSearch, setMedicoSearch] = useState('')
  const [medicoQD] = useDebounce(medicoSearch, 250)
  const [tipoServicoSearch, setTipoServicoSearch] = useState('')
  const [tipoServicoQD] = useDebounce(tipoServicoSearch, 250)
  const [form, setForm] = useState(resetFormState)
  const [utenteError, setUtenteError] = useState<string | null>(null)
  const [credencialError, setCredencialError] = useState<string | null>(null)
  const [medicoExternoSearch, setMedicoExternoSearch] = useState('')
  const [medicoExternoQD] = useDebounce(medicoExternoSearch, 250)
  const [servicoConsultaSearch, setServicoConsultaSearch] = useState('')
  const [servicoConsultaQD] = useDebounce(servicoConsultaSearch, 250)
  const [linhasRegisto, setLinhasRegisto] = useState<LinhaFormRow[]>([])
  const [linhasRegisto789, setLinhasRegisto789] = useState<LinhaFormRow[]>([])
  const [utenteOrganismoOptions, setUtenteOrganismoOptions] = useState<UtenteOrganismoOption[]>([])
  const resolvedConsultaCodigosRef = useRef('')


  const utentesLightQuery = useQuery({
    queryKey: ['utentes-light', utenteSearch],
    queryFn: () => UtentesService('utentes').getUtentesLight(utenteSearch || undefined),
    enabled: open && !isView,
    staleTime: 60_000,
  })
  const medicosExternosQuery = useMedicosExternosLight(open && !isView ? medicoExternoQD : '')
  const medicosExternos = medicosExternosQuery.data?.info?.data ?? []
  const medicosQuery = useMedicosLight(open && !isView ? medicoQD : '')
  const medicos = medicosQuery.data?.info?.data ?? []
  const tiposServicoQuery = useTiposServicoLight(open && !isView ? tipoServicoQD : '',open && !isView)
  const tiposServico = tiposServicoQuery.data?.info?.data ?? []
  const servicosConsultaQuery = useServicosLight( open && !isView ? servicoConsultaQD : '', open && !isView)
  const servicosConsulta = servicosConsultaQuery.data?.info?.data ?? []
  const subsistemasOrganismoQuery = useSubsistemasServicoByOrganismo(
    form.utenteOrganismoId,
    open && !isView && Boolean(form.utenteOrganismoId)
  )
  const subsistemasOrganismo = useMemo(
    () => extractSubsistemaServicoRows(subsistemasOrganismoQuery.data?.info?.data),
    [subsistemasOrganismoQuery.data?.info?.data]
  )
  const subsistemaLinhaComboboxItems = useMemo<ComboboxItem[]>(() => {
    const servicos = servicosConsulta as ServicoLightDTO[]
    const comVinculo = subsistemasOrganismo
      .filter((s) => !s.inativo)
      .filter((s) => {
        if (!form.tipoServicoRegistoId) return true
        const serv = servicos.find((x) => x.id === s.servicoId)
        return serv?.tipoServicoId === form.tipoServicoRegistoId
      })
      .map((s) => {
        const serv = servicos.find((x) => x.id === s.servicoId)
        const label = serv?.designacao?.trim() || `Serviço (${s.servicoId.slice(0, 8)}…)`
        const secondary = `V.serv. ${s.valorServico} € · utente ${s.valorUtente} € · org. ${s.valorOrganismo} €`
        return { value: s.id, label, secondary }
      })

    const servicoIdsComVinculoAtivo = new Set(
      subsistemasOrganismo.filter((s) => !s.inativo).map((s) => s.servicoId)
    )
    const semVinculo: ComboboxItem[] =
      form.utenteOrganismoId && form.tipoServicoRegistoId
        ? servicos
            .filter((svc) => svc.tipoServicoId === form.tipoServicoRegistoId)
            .filter((svc) => !servicoIdsComVinculoAtivo.has(svc.id))
            .map((svc) => ({
              value: `${LOTE_LINHA_SERVICO_SEM_VINCULO_PREFIX}${svc.id}`,
              label: svc.designacao,
              secondary:
                'Sem preços por organismo — preencha V. Unit. / originais / totais na linha (ou crie o vínculo em Subsistema/Serviço).',
            }))
        : []

    return [...comVinculo, ...semVinculo]
  }, [subsistemasOrganismo, servicosConsulta, form.tipoServicoRegistoId, form.utenteOrganismoId])
  const organismosQuery = useQuery({
    queryKey: ['organismos-light', 'lote-direct-form'],
    queryFn: () => OrganismoService().getOrganismoLight(),
    enabled: open,
    staleTime: 5 * 60_000,
  })
  const organismos = organismosQuery.data?.info?.data ?? []
  const provenienciasQuery = useProvenienciasUtenteLightForForm(open)
  const proveniencias = provenienciasQuery.data?.info?.data ?? []
  const tiposLoteQuery = useTiposLoteLight(open)
  const tiposLote = tiposLoteQuery.data?.info?.data ?? []
  

  const utenteItems = useMemo(
    () =>
      (utentesLightQuery.data?.info?.data ?? []).map((u) => ({
        value: u.id,
        label: [u.numeroUtente, u.nome].filter(Boolean).join(' - '),
      })),
    [utentesLightQuery.data?.info?.data]
  )
  const medicoItems = useMemo(
    () =>
      (medicos as MedicoLightDTO[]).map((m) => ({
        value: m.id,
        label: [m.letra, m.nome].filter(Boolean).join(' - '),
        secondary: m.especialidadeNome ?? undefined,
      })),
    [medicos]
  )
  const medicoExternoItems = useMemo(
    () => 
    (medicosExternos as MedicoExternoLightDTO[]).map((m) => ({
      value: m.id,
      label: m.nome,
      secondary: m.numeroContribuinte ?? undefined,
    })),
    [medicosExternos]
  )
  const tipoServicoItems = useMemo(
    () =>
      (tiposServico as TipoServicoLightDTO[]).map((item) => ({
        value: item.id,
        label: item.descricao,
      })),
    [tiposServico]
  )
  const provenienciasItems = useMemo(() => {
    const items = (proveniencias as ProvenienciaUtenteLightDTO[]).map((item) => ({
      value: item.id,
      label: item.descricao,
    }))

    if (
      form.proveniencia &&
      !items.some((item) => item.value === form.proveniencia || item.label === form.proveniencia)
    ) {
      return [{ value: form.proveniencia, label: form.proveniencia }, ...items]
    }

    return items
  }, [proveniencias, form.proveniencia])
  const organismoSelectItems = useMemo(() => {
    if (
      !form.utenteOrganismoId ||
      utenteOrganismoOptions.some((option) => option.value === form.utenteOrganismoId)
    ) {
      return utenteOrganismoOptions
    }

    const organismo = organismos.find((item) => item.id === form.utenteOrganismoId)
    const label =
      organismo?.abreviatura?.trim() ||
      organismo?.nome?.trim() ||
      organismo?.nomeComercial?.trim() ||
      form.utenteOrganismoId

    return [{ value: form.utenteOrganismoId, label }, ...utenteOrganismoOptions]
  }, [utenteOrganismoOptions, form.utenteOrganismoId, organismos])
  const tipoLoteItems = useMemo(() => {
    const items = tiposLote.map((item) => ({
      value: String(item.codigo),
      label: item.designa?.trim() || String(item.codigo),
    }))

    if (form.tipoLote && !items.some((item) => item.value === form.tipoLote)) {
      return [{ value: form.tipoLote, label: form.tipoLote }, ...items]
    }

    return items
  }, [tiposLote, form.tipoLote])
  const servicosCredencialItems = useMemo(() => {
    let items = (servicosConsulta as ServicoLightDTO[]).map((item) => ({
      value: item.id,
      label: item.designacao,
    }))

    if (form.tipoServicoRegistoId) {
      items = items.filter(
        (item) =>
          (servicosConsulta as ServicoLightDTO[]).find((servico) => servico.id === item.value)
            ?.tipoServicoId === form.tipoServicoRegistoId
      )
    }

    if (form.servicos && !items.some((item) => item.value === form.servicos)) {
      return [
        { value: form.servicos, label: form.servicosLabel || form.servicos },
        ...items,
      ]
    }

    return items
  }, [servicosConsulta, form.tipoServicoRegistoId, form.servicos, form.servicosLabel])
  const servicoConsultaItems = useMemo(() => {
    let items = (servicosConsulta as ServicoLightDTO[]).map((item) => ({
      value: item.id,
      label: item.designacao,
    }))

    if (form.tipoServicoRegistoId) {
      items = items.filter(
        (item) =>
          (servicosConsulta as ServicoLightDTO[]).find((servico) => servico.id === item.value)
            ?.tipoServicoId === form.tipoServicoRegistoId
      )
    }

    return items
  }, [servicosConsulta, form.tipoServicoRegistoId])


  const patchForm = (partial: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  const addLinhaRegisto = (tipo: 'normal' | '789') => {
    if (tipo === 'normal') {
      setLinhasRegisto((prev) => [...prev, newLinhaFormRow()])
      return
    }
    setLinhasRegisto789((prev) => [...prev, newLinhaFormRow()])
  }

  const removeLinhaRegisto = (tipo: 'normal' | '789', id: string) => {
    if (tipo === 'normal') {
      setLinhasRegisto((prev) => prev.filter((row) => row.id !== id))
      return
    }
    setLinhasRegisto789((prev) => prev.filter((row) => row.id !== id))
  }

  const updateLinhaRegisto = (
    tipo: 'normal' | '789',
    id: string,
    field: keyof Omit<LinhaFormRow, 'id'>,
    value: string
  ) => {
    const mapper = (row: LinhaFormRow) => (row.id === id ? { ...row, [field]: value } : row)
    if (tipo === 'normal') {
      setLinhasRegisto((prev) => prev.map(mapper))
      return
    }
    setLinhasRegisto789((prev) => prev.map(mapper))
  }

  const clearServicoLinhasRegisto = () => {
    const strip = (row: LinhaFormRow): LinhaFormRow => ({
      ...row,
      subsistemaServicoId: '',
      subsistemaLinhaLabel: '',
      servicoId: '',
      valorUnitario: '',
      valorUtenteOriginal: '',
      valorInstituicaoOriginal: '',
      valorUtente: '',
      valorInstituicao: '',
    })
    setLinhasRegisto((prev) => prev.map(strip))
    setLinhasRegisto789((prev) => prev.map(strip))
  }

  const updateLinhaQuantidade = (tipo: 'normal' | '789', id: string, quantidade: string) => {
    const mapper = (row: LinhaFormRow) => {
      if (row.id !== id) return row
      if (
        !row.subsistemaServicoId ||
        row.subsistemaServicoId.startsWith(LOTE_LINHA_SERVICO_SEM_VINCULO_PREFIX)
      ) {
        return { ...row, quantidade }
      }
      const sub = subsistemasOrganismo.find((s) => s.id === row.subsistemaServicoId)
      if (!sub) return { ...row, quantidade }
      return {
        ...row,
        quantidade,
        ...buildLinhaValoresFromSubsistema(sub, quantidade, form.taxaModeradora),
      }
    }
    if (tipo === 'normal') {
      setLinhasRegisto((prev) => prev.map(mapper))
      return
    }
    setLinhasRegisto789((prev) => prev.map(mapper))
  }

  const handleSelectSubsistemaLinhaRegisto = (
    tipo: 'normal' | '789',
    linhaId: string,
    subsistemaServicoId: string
  ) => {
    const apply = (rows: LinhaFormRow[]) =>
      rows.map((row) => {
        if (row.id !== linhaId) return row
        if (!subsistemaServicoId.trim()) {
          return {
            ...row,
            subsistemaServicoId: '',
            subsistemaLinhaLabel: '',
            servicoId: '',
            valorUnitario: '',
            valorUtenteOriginal: '',
            valorInstituicaoOriginal: '',
            valorUtente: '',
            valorInstituicao: '',
          }
        }
        if (subsistemaServicoId.startsWith(LOTE_LINHA_SERVICO_SEM_VINCULO_PREFIX)) {
          const servicoId = subsistemaServicoId.slice(LOTE_LINHA_SERVICO_SEM_VINCULO_PREFIX.length)
          const serv = (servicosConsulta as ServicoLightDTO[]).find((x) => x.id === servicoId)
          const item = subsistemaLinhaComboboxItems.find((i) => i.value === subsistemaServicoId)
          return {
            ...row,
            subsistemaServicoId,
            subsistemaLinhaLabel: item?.label ?? serv?.designacao ?? '',
            servicoId,
            valorUnitario: '',
            valorUtenteOriginal: '',
            valorInstituicaoOriginal: '',
            valorUtente: '',
            valorInstituicao: '',
          }
        }
        if (!form.utenteOrganismoId) {
          toast.error('Selecione o organismo do utente antes de escolher o subsistema de serviço.')
          return row
        }
        const sub = subsistemasOrganismo.find((s) => s.id === subsistemaServicoId)
        if (!sub) {
          toast.error('Subsistema de serviço não encontrado para este organismo.')
          return row
        }
        const item = subsistemaLinhaComboboxItems.find((i) => i.value === subsistemaServicoId)
        return {
          ...row,
          subsistemaServicoId,
          subsistemaLinhaLabel: item?.label ?? '',
          ...buildLinhaValoresFromSubsistema(sub, row.quantidade, form.taxaModeradora),
        }
      })

    if (tipo === 'normal') {
      setLinhasRegisto(apply)
      return
    }
    setLinhasRegisto789(apply)
  }

  useEffect(() => {
    if (!open) return
    setLinhasRegisto((prev) =>
      prev.map((row) => {
        if (
          !row.subsistemaServicoId ||
          row.subsistemaServicoId.startsWith(LOTE_LINHA_SERVICO_SEM_VINCULO_PREFIX)
        )
          return row
        const sub = subsistemasOrganismo.find((s) => s.id === row.subsistemaServicoId)
        if (!sub) return row
        return {
          ...row,
          ...buildLinhaValoresFromSubsistema(sub, row.quantidade, form.taxaModeradora),
        }
      })
    )
    setLinhasRegisto789((prev) =>
      prev.map((row) => {
        if (
          !row.subsistemaServicoId ||
          row.subsistemaServicoId.startsWith(LOTE_LINHA_SERVICO_SEM_VINCULO_PREFIX)
        )
          return row
        const sub = subsistemasOrganismo.find((s) => s.id === row.subsistemaServicoId)
        if (!sub) return row
        return {
          ...row,
          ...buildLinhaValoresFromSubsistema(sub, row.quantidade, form.taxaModeradora),
        }
      })
    )
  }, [open, form.taxaModeradora, subsistemasOrganismo])

  const applyDetail = (detail: LoteDirectDTO) => {
    const medicoLabel = [detail.codigoMedico, detail.medicoNome].filter(Boolean).join(' - ')

    patchForm({
      codigo: detail.id,
      utenteId: detail.utenteId ?? '',
      utenteLabel: [viewData?.utenteNumero, detail.utenteNome ?? viewData?.utenteNome]
        .filter(Boolean)
        .join(' - '),
      credencial: detail.credencial ?? '',
      codigoOrganismo: detail.codigoOrganismo != null ? String(detail.codigoOrganismo) : '',
      centroSaude: detail.centroSaude ?? '',
      taxaModeradora: isencaoToTaxaModeradora(detail.isencao),
      proveniencia: detail.proveniencia ?? '',
      credencialExterna: detail.credencialExterna ?? false,
      servicos: detail.servicos ?? '',
      servicosLabel: detail.servicos ?? '',
      tipoServicoRegistoId: detail.tipoServicoRegistoId ?? '',
      tipoServicoRegistoLabel: detail.tipoServicoRegistoDescricao ?? '',
      mes: detail.mes != null ? String(detail.mes) : form.mes,
      ano: detail.ano != null ? String(detail.ano) : form.ano,
      dataInicio: toDateInputValue(detail.dataInicio),
      dataFim: toDateInputValue(detail.dataFim),
      tipoLote: detail.tipoLote != null ? String(detail.tipoLote) : '',
      areaServico: areaFromTipoServico(detail.tipoServico),
      numeroLote: detail.numeroLote != null ? String(detail.numeroLote) : '',
      medicoId: detail.medicoId ?? '',
      medicoLabel,
      codigoMedico: detail.codigoMedico ?? '',
      especialidade: detail.especialidade ?? '',
      medicoExternoId: detail.medicoExternoId ?? '',
      medicoExternoLabel: detail.medicoExternoNome ?? '',
      medicoExterno: detail.medicoExternoNome ?? '',
      codigoServicoConsulta: detail.codigoServicoConsulta ?? '',
      servicoConsulta: detail.servicoConsulta ?? '',
      codigoSubsistemaConsulta: detail.codigoSubsistemaConsulta ?? '',
      quantidadeConsulta: detail.quantidadeConsulta != null ? String(detail.quantidadeConsulta) : '1',
      valorConsulta: detail.valorConsulta != null ? String(detail.valorConsulta) : '',
      taxaConsulta: detail.taxaConsulta != null ? String(detail.taxaConsulta) : '',
      procedimentosEfetuados: detail.procedimentosEfetuados ?? false,
      servicoConsultaId: detail.servicoConsultaId ?? '',
      servicoConsultaLabel: detail.servicoConsultaDesignacao ?? detail.servicoConsulta ?? '',
    })
  }

  const handleSelectUtente = async (value: string) => {
    const item = utenteItems.find((entry) => entry.value === value)
    const utente = (utentesLightQuery.data?.info?.data ?? []).find((u) => u.id === value) as
      | UtenteDTO
      | undefined

    if (!value) {
      setUtenteOrganismoOptions([])
      patchForm({
        utenteId: '',
        utenteLabel: '',
        utenteOrganismoId: '',
        codigoOrganismo: '',
        idade: '',
        sexo: '',
        ...EMPTY_CONSULTA_FIELDS,
      })
      clearServicoLinhasRegisto()
      setUtenteError(null)
      return
    }

    let utenteOrganismoId = ''
    let codigoOrganismo = ''
    let organismoOptions: UtenteOrganismoOption[] = []

    try {
      const utenteResponse = await UtentesService('utentes').getUtente(value)
      const utenteData = utenteResponse.info?.data
      organismoOptions = buildUtenteOrganismoOptions(utenteData)
      utenteOrganismoId = utenteData?.organismoId ?? ''
      if (utenteOrganismoId) {
        codigoOrganismo = await resolveCodigoOrganismo(utenteOrganismoId)
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? 'Não foi possível carregar o organismo do utente.')
    }

    setUtenteOrganismoOptions(organismoOptions)
    patchForm({
      utenteId: value,
      utenteLabel: item?.label ?? utente?.nome ?? value,
      utenteOrganismoId,
      codigoOrganismo,
      idade: getAgeFromBirthDate(utente?.dataNascimento),
      sexo: utente?.sexo?.descricao ?? utente?.sexo?.codigo ?? '',
      ...EMPTY_CONSULTA_FIELDS,
    })
    clearServicoLinhasRegisto()
    setUtenteError(null)
  }

  const handleSelectOrganismo = async (organismoId: string) => {
    if (!organismoId) {
      patchForm({
        utenteOrganismoId: '',
        codigoOrganismo: '',
        ...EMPTY_CONSULTA_FIELDS,
      })
      clearServicoLinhasRegisto()
      return
    }

    const codigoOrganismo = await resolveCodigoOrganismo(organismoId)
    patchForm({
      utenteOrganismoId: organismoId,
      codigoOrganismo,
      ...EMPTY_CONSULTA_FIELDS,
    })
    clearServicoLinhasRegisto()
  }

  const handleSelectMedico = (value: string) => {
    const medico = (medicos as MedicoLightDTO[]).find((m) => m.id === value)
    const label = medico
      ? [medico.letra, medico.nome].filter(Boolean).join(' - ')
      : value

    patchForm({
      medicoId: value,
      codigoMedico: medico?.letra ?? '',
      medicoLabel: label,
      especialidade: medico?.especialidadeNome ?? '',
    })
  }

  const handleSelectMedicoExterno = (value: string) => {
    const medicoExterno = (medicosExternos as MedicoExternoLightDTO[]).find((m) => m.id === value)

    patchForm({
      medicoExternoId: value,
      medicoExternoLabel: medicoExterno?.nome ?? value,
      medicoExterno: medicoExterno?.nome ?? '',
    })
  }

  const handleSelectTipoServico = (value: string) => {
    const tipoServico = (tiposServico as TipoServicoLightDTO[]).find((item) => item.id === value)

    patchForm({
      tipoServicoRegistoId: value,
      tipoServicoRegistoLabel: tipoServico?.descricao ?? value,
      servicos: '',
      servicosLabel: '',
    })
  }

  const handleSelectServicoCredencial = (value: string) => {
    const item = servicosCredencialItems.find((entry) => entry.value === value)
    patchForm({
      servicos: value,
      servicosLabel: item?.label ?? value,
    })
  }

  const handleSelectServicoConsulta = async (value: string) => {
    if (!value) {
      patchForm({ ...EMPTY_CONSULTA_FIELDS })
      return
    }

    if (!form.utenteOrganismoId) {
      toast.error('Selecione um utente com organismo antes de escolher o serviço.')
      return
    }

    const servicoLight = (servicosConsulta as ServicoLightDTO[]).find((item) => item.id === value)

    try {
      const [servicoResponse, subsistemas] = await Promise.all([
        ServicoService().getServico(value),
        loadSubsistemasServicoForConsulta(value, form.utenteOrganismoId),
      ])

      const servico = servicoResponse.info?.data
      const subsistema = pickSubsistemaServico(subsistemas, form.utenteOrganismoId)
      const valorServicoUnit = subsistema?.valorServico ?? servico?.preco
      const valorUtenteUnit = subsistema?.valorUtente

      patchForm({
        servicoConsultaId: value,
        servicoConsultaLabel: servico?.designacao ?? servicoLight?.designacao ?? value,
        codigoServicoConsulta: resolveServicoCodigo(servico),
        servicoConsulta: servico?.designacao ?? servicoLight?.designacao ?? '',
        codigoSubsistemaConsulta: resolveOrganismoCodigo(subsistema?.organismoId, organismos),
        quantidadeConsulta: form.quantidadeConsulta || '1',
        ...buildConsultaTotals(
          valorServicoUnit,
          valorUtenteUnit,
          form.quantidadeConsulta || '1',
          form.taxaModeradora
        ),
      })
    } catch (error) {
      toast.error((error as Error)?.message ?? 'Não foi possível carregar os valores do serviço.')
      patchForm({
        servicoConsultaId: value,
        servicoConsultaLabel: servicoLight?.designacao ?? value,
        codigoServicoConsulta: '',
        servicoConsulta: servicoLight?.designacao ?? '',
        consultaValorServicoUnit: '',
        consultaValorUtenteUnit: '',
      })
    }
  }

  useEffect(() => {
    if (!open) {
      resolvedConsultaCodigosRef.current = ''
      return
    }

    const servicoConsultaId = form.servicoConsultaId
    if (!servicoConsultaId || organismosQuery.isLoading) return

    const needsServicoCodigo =
      looksLikeGuid(form.codigoServicoConsulta) || !form.codigoServicoConsulta.trim()
    const needsSubsistemaCodigo =
      looksLikeGuid(form.codigoSubsistemaConsulta) || !form.codigoSubsistemaConsulta.trim()
    const needsUnits = !form.consultaValorServicoUnit.trim()
    if (!needsServicoCodigo && !needsSubsistemaCodigo && !needsUnits) return

    const resolutionKey = `${servicoConsultaId}:${form.utenteOrganismoId}:${organismos.length}:${form.codigoServicoConsulta}:${form.codigoSubsistemaConsulta}:${form.consultaValorServicoUnit}`
    if (resolvedConsultaCodigosRef.current === resolutionKey) return

    let cancelled = false

    void (async () => {
      try {
        const [servicoResponse, subsistemas] = await Promise.all([
          ServicoService().getServico(servicoConsultaId),
          loadSubsistemasServicoForConsulta(servicoConsultaId, form.utenteOrganismoId || undefined),
        ])
        if (cancelled) return

        const servico = servicoResponse.info?.data
        const subsistema = pickSubsistemaServico(subsistemas, form.utenteOrganismoId || undefined)
        const valorServicoUnit = subsistema?.valorServico ?? servico?.preco
        const valorUtenteUnit = subsistema?.valorUtente

        const codigoServicoConsulta = resolveServicoCodigo(servico) || form.codigoServicoConsulta
        const codigoSubsistemaConsulta =
          resolveOrganismoCodigo(subsistema?.organismoId, organismos) || form.codigoSubsistemaConsulta
        const totals = buildConsultaTotals(
          valorServicoUnit,
          valorUtenteUnit,
          form.quantidadeConsulta || '1',
          form.taxaModeradora
        )

        if (
          codigoServicoConsulta === form.codigoServicoConsulta &&
          codigoSubsistemaConsulta === form.codigoSubsistemaConsulta &&
          totals.consultaValorServicoUnit === form.consultaValorServicoUnit
        ) {
          resolvedConsultaCodigosRef.current = resolutionKey
          return
        }

        patchForm({
          codigoServicoConsulta,
          codigoSubsistemaConsulta,
          ...totals,
        })
        resolvedConsultaCodigosRef.current = resolutionKey
      } catch {
        if (!cancelled) resolvedConsultaCodigosRef.current = resolutionKey
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    open,
    form.servicoConsultaId,
    form.utenteOrganismoId,
    form.codigoServicoConsulta,
    form.codigoSubsistemaConsulta,
    form.consultaValorServicoUnit,
    form.quantidadeConsulta,
    form.taxaModeradora,
    organismos,
    organismosQuery.isLoading,
  ])

  useEffect(() => {
    if (!open) return
    resolvedConsultaCodigosRef.current = ''
    setActiveTab('dados-credencial')
    setUtenteError(null)
    setCredencialError(null)
    setUtenteSearch('')
    setMedicoSearch('')
    setMedicoExternoSearch('')
    setTipoServicoSearch('')
    setServicoConsultaSearch('')

    if (isCreate) {
      setUtenteOrganismoOptions([])
      setForm(resetFormState())
      setLinhasRegisto([])
      setLinhasRegisto789([])
      return
    }

    const targetId = loteId ?? viewData?.id
    if (!targetId) return

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const response = await LoteDirectService(permId).getById(targetId)
        if (cancelled) return
        if (response.info.status === ResponseStatus.Success && response.info.data) {
          const detail = response.info.data
          applyDetail(detail)

          if (detail.utenteId) {
            try {
              const utenteResponse = await UtentesService('utentes').getUtente(detail.utenteId)
              if (!cancelled) {
                const utenteData = utenteResponse.info?.data
                setUtenteOrganismoOptions(buildUtenteOrganismoOptions(utenteData))
                patchForm({
                  utenteOrganismoId: utenteData?.organismoId ?? '',
                })
              }
            } catch {
              // keep consulta values from detail when utente lookup fails
            }
          }
        } else {
          toast.error(response.info.messages?.['$']?.[0] ?? 'Não foi possível carregar a credencial.')
        }
      } catch (e: unknown) {
        if (!cancelled) {
          toast.error((e as Error)?.message ?? 'Erro ao carregar a credencial.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, loteId, viewData?.id])

  const totaisRegistoCalculados = useMemo(
    () =>
      computeRegistoSomaTotais(
        form.valorConsulta,
        form.taxaConsulta,
        linhasRegisto,
        linhasRegisto789
      ),
    [form.valorConsulta, form.taxaConsulta, linhasRegisto, linhasRegisto789]
  )

  const buildPayload = (): CreateLoteDirectRequest => ({
    ...(() => {
      const mapLinha = (row: LinhaFormRow): LoteDirectLinhaUpsertRequest | null => {
        const servicoId = row.servicoId.trim()
        if (!servicoId) return null
        const quantidade = parseInteger(row.quantidade) ?? 1
        const valorUnitario = parseDecimal(row.valorUnitario) ?? 0
        const valorUtenteOriginal = parseDecimal(row.valorUtenteOriginal) ?? 0
        const valorInstituicaoOriginal = parseDecimal(row.valorInstituicaoOriginal) ?? 0
        const valorUtente = linhaUtenteTotal(row)
        const valorInstituicao = linhaInstituicaoTotal(row)

        return {
          servicoId,
          quantidade,
          valorUnitario,
          valorUtenteOriginal,
          valorInstituicaoOriginal,
          valorUtente,
          valorInstituicao,
        }
      }

      const consultaServicoId = form.servicoConsultaId?.trim()
      const consultaQuantidade = parseInteger(form.quantidadeConsulta) ?? 1
      const consultaValorServicoTotal = parseDecimal(form.valorConsulta) ?? 0
      const consultaValorUtenteTotal = parseDecimal(form.taxaConsulta) ?? 0
      const consultaValorUnitario = consultaQuantidade > 0 ? consultaValorServicoTotal / consultaQuantidade : 0
      const consultaValorUtenteOriginal = consultaQuantidade > 0 ? consultaValorUtenteTotal / consultaQuantidade : 0
      const consultaValorInstituicaoOriginal = consultaValorUnitario - consultaValorUtenteOriginal

      const linhaConsulta: LoteDirectLinhaUpsertRequest[] = consultaServicoId
        ? [
            {
              servicoId: consultaServicoId,
              quantidade: consultaQuantidade,
              valorUnitario: consultaValorUnitario,
              valorUtenteOriginal: consultaValorUtenteOriginal,
              valorInstituicaoOriginal: consultaValorInstituicaoOriginal,
              valorUtente: consultaValorUtenteTotal,
              valorInstituicao: consultaValorServicoTotal - consultaValorUtenteTotal,
            },
          ]
        : []

      const linhasManuais = linhasRegisto.map(mapLinha).filter((x): x is LoteDirectLinhaUpsertRequest => x !== null)
      const linhasManuais789 = linhasRegisto789
        .map(mapLinha)
        .filter((x): x is LoteDirectLinhaUpsertRequest => x !== null)

      return {
        linhas: [...linhaConsulta, ...linhasManuais],
        linhas789: linhasManuais789,
      }
    })(),
    utenteId: form.utenteId || undefined,
    credencial: form.credencial.trim() || undefined,
    codigoOrganismo: parseDecimal(form.codigoOrganismo),
    mes: Number(form.mes) || undefined,
    ano: Number(form.ano) || undefined,
    dataInicio: form.dataInicio || undefined,
    dataFim: form.dataFim || undefined,
    tipoServico: AREA_SERVICO_VALUES[form.areaServico],
    tipoServicoRegistoId: form.tipoServicoRegistoId || undefined,
    tipoLote: parseDecimal(form.tipoLote),
    numeroLote: parseDecimal(form.numeroLote),
    centroSaude: form.centroSaude.trim() || undefined,
    isencao: TAXA_MODERADORA_TO_ISENCAO[form.taxaModeradora],
    proveniencia: form.proveniencia.trim() || undefined,
    credencialExterna: form.credencialExterna,
    servicos: form.servicos.trim() || undefined,
    medicoId: form.medicoId || undefined,
    codigoMedico: form.codigoMedico.trim() || undefined,
    especialidade: form.especialidade.trim() || undefined,
    medicoExternoId: form.medicoExternoId || undefined,
    codigoServicoConsulta: form.codigoServicoConsulta.trim() || undefined,
    servicoConsulta: form.servicoConsulta.trim() || undefined,
    codigoSubsistemaConsulta: form.codigoSubsistemaConsulta.trim() || undefined,
    quantidadeConsulta: parseInteger(form.quantidadeConsulta),
    valorConsulta: parseDecimal(form.valorConsulta),
    taxaConsulta: parseDecimal(form.taxaConsulta),
    procedimentosEfetuados: form.procedimentosEfetuados,
    valorTaxas: totaisRegistoCalculados.totalTaxas,
    valorTotal: totaisRegistoCalculados.totalGeral,
    valorTotalV2: totaisRegistoCalculados.totalV2,
    valorTotalV3: totaisRegistoCalculados.totalV3,
    historico: false,
    servicoConsultaId : form.servicoConsultaId || undefined,
  })

  const handleSave = async () => {
    if (isView) return

    let hasError = false
    if (!form.utenteId) {
      setUtenteError('Utente em falta.')
      hasError = true
    }
    if (!form.credencial.trim()) {
      setCredencialError('Nº credencial em falta.')
      hasError = true
    }
    if (hasError) {
      toast.warning('Preencha os campos obrigatórios.')
      return
    }

    setSaving(true)
    try {
      const payload = buildPayload()
      const response =
        mode === 'edit' && (loteId ?? viewData?.id)
          ? await LoteDirectService(permId).update(loteId ?? viewData!.id, payload)
          : await LoteDirectService(permId).create(payload)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(mode === 'edit' ? 'Credencial atualizada.' : 'Credencial criada.')
        await queryClient.invalidateQueries({ queryKey: ['lote-direct-paginated'] })
        onSuccess?.()
        onOpenChange(false)
        return
      }

      toast.error(response.info.messages?.['$']?.[0] ?? 'Não foi possível guardar a credencial.')
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? 'Erro ao guardar a credencial.')
    } finally {
      setSaving(false)
    }
  }

  const content = (
    <>
      <div className='sticky top-0 z-10 shrink-0 space-y-2 border-b bg-background/95 pb-2 pt-1 backdrop-blur'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onOpenChange(false)}
              title='Voltar'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <span>
              {isCreate ? 'Lançamento de Credenciais' : isView ? 'Consultar credencial' : 'Editar credencial'}
            </span>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button type='button' variant='outline' size='sm' onClick={() => toast.info('Impressão ainda não migrada.')}>
              <Printer className='mr-2 h-4 w-4' />
              Imprimir
            </Button>
            <Button type='button' variant='outline' size='sm' onClick={() => toast.info('Exames Sem Papel ainda não migrado neste ecrã.')}>
              Exames Sem Papel
            </Button>
            <Button type='button' variant='outline' size='sm' onClick={() => toast.info('Lista ainda não migrada.')}>
              Lista
            </Button>
            <Button type='button' variant='outline' size='sm' onClick={() => toast.info('Lançamento automático ainda não migrado.')}>
              Lançamento Automático
            </Button>
            <Button type='button' variant='outline' size='sm' onClick={() => toast.info('Credenciais em falta ainda não migradas.')}>
              Credenciais em Falta
            </Button>
            {!isView ? (
              <Button type='button' size='sm' onClick={handleSave} disabled={saving || loading}>
                <Save className='mr-2 h-4 w-4' />
                Guardar
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-12 ${formBlockGap} overflow-y-auto py-2`}>
        <div className='col-span-12 rounded-md border p-3 lg:col-span-9'>
          <div className={`grid grid-cols-12 ${formBlockGap}`}>
            <div className={`col-span-2 ${fieldGap}`}>
              <Label className={labelClass}>Código</Label>
              <Input className={inputClass} disabled value={form.codigo} readOnly />
            </div>
            <div className={`col-span-2 ${fieldGap}`}>
              <Label className={labelClass}>Cód. Utente</Label>
              <Input className={inputClass} disabled value={viewData?.utenteNumero ?? ''} readOnly />
            </div>
            <div className={`col-span-4 ${fieldGap}`}>
              <Label className={labelClass}>Utente</Label>
              <AsyncCombobox
                value={form.utenteId}
                onChange={handleSelectUtente}
                items={
                  form.utenteLabel && !utenteItems.some((i) => i.value === form.utenteId)
                    ? [{ value: form.utenteId, label: form.utenteLabel }, ...utenteItems]
                    : utenteItems
                }
                isLoading={utentesLightQuery.isFetching}
                placeholder={form.utenteLabel || 'Utente...'}
                searchPlaceholder='Pesquisar utente...'
                emptyText='Sem utentes'
                disabled={isView}
                searchValue={utenteSearch}
                onSearchValueChange={setUtenteSearch}
                className={utenteError ? 'border-destructive focus-visible:ring-destructive' : undefined}
              />
              {utenteError ? <p className='text-xs text-destructive'>{utenteError}</p> : null}
            </div>
            <div className={`col-span-2 ${fieldGap}`}>
              <Label className={labelClass}>Idade</Label>
              <Input className={inputClass} disabled value={form.idade} readOnly />
            </div>
            <div className={`col-span-2 ${fieldGap}`}>
              <Label className={labelClass}>Sexo</Label>
              <Input className={inputClass} disabled value={form.sexo} readOnly />
            </div>
            <div className={`col-span-8 ${fieldGap}`}>
              <Label className={labelClass}>Centro Saúde</Label>
              <Input
                className={inputClass}
                disabled={isView}
                value={form.centroSaude}
                onChange={(e) => patchForm({ centroSaude: e.target.value })}
              />
            </div>
            <div className={`col-span-4 ${fieldGap}`}>
              <Label className={labelClass}>Cód. Organismo</Label>
              <Select
                value={form.utenteOrganismoId || undefined}
                onValueChange={(value) => void handleSelectOrganismo(value)}
                disabled={isView || !form.utenteId || organismoSelectItems.length === 0}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue
                    placeholder={
                      !form.utenteId
                        ? 'Selecione primeiro o utente'
                        : organismoSelectItems.length === 0
                          ? 'Sem organismos'
                          : 'Selecionar organismo...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {organismoSelectItems.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className='col-span-12 rounded-md border p-3 lg:col-span-3'>
          <h4 className='mb-3 text-sm font-semibold'>Taxas Moderadoras</h4>
          <RadioGroup
            value={form.taxaModeradora}
            onValueChange={(value) => {
              const taxaModeradora = value as TaxaModeradora
              const valorUnit = parseDecimal(form.consultaValorServicoUnit)
              const utenteUnit = parseDecimal(form.consultaValorUtenteUnit)
              if (valorUnit == null && utenteUnit == null) {
                patchForm({ taxaModeradora })
                return
              }

              patchForm({
                taxaModeradora,
                ...buildConsultaTotals(
                  valorUnit ?? 0,
                  utenteUnit ?? 0,
                  form.quantidadeConsulta || '1',
                  taxaModeradora
                ),
              })
            }}
            className='space-y-2'
            disabled={isView}
          >
            <div className='flex items-center gap-2'><RadioGroupItem value='isento' id='taxa-isento' /><Label htmlFor='taxa-isento'>Isento</Label></div>
            <div className='flex items-center gap-2'><RadioGroupItem value='nao-isento' id='taxa-nao-isento' /><Label htmlFor='taxa-nao-isento'>Não Isento</Label></div>
            <div className='flex items-center gap-2'><RadioGroupItem value='e111' id='taxa-e111' /><Label htmlFor='taxa-e111'>E111</Label></div>
            <div className='flex items-center gap-2'><RadioGroupItem value='h' id='taxa-h' /><Label htmlFor='taxa-h'>H</Label></div>
          </RadioGroup>
          <div className={`mt-4 ${fieldGap}`}>
            <Label className={labelClass}>Proveniência</Label>
            <Select
              value={form.proveniencia || undefined}
              onValueChange={(value) => patchForm({ proveniencia: value })}
              disabled={isView || provenienciasQuery.isLoading}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder='Selecionar proveniência...' />
              </SelectTrigger>
              <SelectContent>
                {provenienciasItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        <TabsList>
          <TabsTrigger value='dados-credencial'>Dados da Credencial</TabsTrigger>
          <TabsTrigger value='registo-servicos'>Registo de Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value='dados-credencial' className='overflow-y-auto py-3'>
          <div className={`grid grid-cols-12 ${formBlockGap}`}>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Nº Credencial</Label>
              <Input
                className={inputClass}
                disabled={isView}
                value={form.credencial}
                onChange={(e) => {
                  patchForm({ credencial: e.target.value })
                  setCredencialError(null)
                }}
              />
              {credencialError ? <p className='text-xs text-destructive'>{credencialError}</p> : null}
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Ano</Label>
              <Input
                className={inputClass}
                disabled={isView}
                value={form.ano}
                onChange={(e) => patchForm({ ano: e.target.value })}
              />
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Tipo Lote</Label>
              <Select
                value={form.tipoLote || undefined}
                onValueChange={(value) => patchForm({ tipoLote: value })}
                disabled={isView || tiposLoteQuery.isLoading}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder='Selecionar tipo de lote...' />
                </SelectTrigger>
                <SelectContent>
                  {tipoLoteItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Tipo Serviço</Label>
              <div className='flex gap-2'>
                <AsyncCombobox
                  value={form.tipoServicoRegistoId}
                  onChange={handleSelectTipoServico}
                  items={
                    form.tipoServicoRegistoId &&
                    form.tipoServicoRegistoLabel &&
                    !tipoServicoItems.some((item) => item.value === form.tipoServicoRegistoId)
                      ? [
                          { value: form.tipoServicoRegistoId, label: form.tipoServicoRegistoLabel },
                          ...tipoServicoItems,
                        ]
                      : tipoServicoItems
                  }
                  isLoading={tiposServicoQuery.isFetching}
                  placeholder='Tipo serviço...'
                  searchPlaceholder='Pesquisar tipo de serviço...'
                  emptyText='Sem tipos de serviço'
                  disabled={isView}
                  searchValue={tipoServicoSearch}
                  onSearchValueChange={setTipoServicoSearch}
                />
                <Button type='button' variant='secondary' size='icon' className='h-7 w-7 shrink-0' disabled={isView}>
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Data Início</Label>
              <Input
                className={inputClass}
                disabled={isView}
                type='date'
                value={form.dataInicio}
                onChange={(e) => patchForm({ dataInicio: e.target.value })}
              />
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Data Fim</Label>
              <Input
                className={inputClass}
                disabled={isView}
                type='date'
                value={form.dataFim}
                onChange={(e) => patchForm({ dataFim: e.target.value })}
              />
            </div>
            <div className={`col-span-6 ${fieldGap}`}>
              <Label className={labelClass}>Serviços</Label>
              <Select
                value={form.servicos || undefined}
                onValueChange={handleSelectServicoCredencial}
                disabled={isView || !form.tipoServicoRegistoId || servicosCredencialItems.length === 0}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue
                    placeholder={
                      !form.tipoServicoRegistoId
                        ? 'Selecione primeiro o tipo de serviço'
                        : servicosCredencialItems.length === 0
                          ? 'Sem serviços'
                          : 'Selecionar serviço...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {servicosCredencialItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Mês</Label>
              <Select value={form.mes} onValueChange={(value) => patchForm({ mes: value })} disabled={isView}>
                <SelectTrigger className={selectTriggerClass}><SelectValue placeholder='Mês' /></SelectTrigger>
                <SelectContent>
                  {MESES.map((mes) => (
                    <SelectItem key={mes.value} value={String(mes.value)}>{mes.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='col-span-3 flex items-end gap-2 pb-1'>
              <Checkbox
                disabled={isView}
                checked={form.credencialExterna}
                onCheckedChange={(value) => patchForm({ credencialExterna: Boolean(value) })}
              />
              <Label>Credencial Externa</Label>
            </div>
            <div className='col-span-12'>
              <RadioGroup
                value={form.areaServico}
                onValueChange={(value) => patchForm({ areaServico: value as AreaServico })}
                className='flex flex-wrap gap-4'
                disabled={isView}
              >
                <div className='flex items-center gap-2'><RadioGroupItem value='ecg' id='area-ecg' /><Label htmlFor='area-ecg'>ECG</Label></div>
                <div className='flex items-center gap-2'><RadioGroupItem value='endoscopia' id='area-endoscopia' /><Label htmlFor='area-endoscopia'>Endoscopia</Label></div>
                <div className='flex items-center gap-2'><RadioGroupItem value='medicina-dentaria' id='area-md' /><Label htmlFor='area-md'>Medicina Dentária</Label></div>
                <div className='flex items-center gap-2'><RadioGroupItem value='consultas' id='area-consultas' /><Label htmlFor='area-consultas'>Consultas</Label></div>
              </RadioGroup>
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Cód. Médico</Label>
              <div className='flex gap-2'>
                <AsyncCombobox
                  value={form.medicoId}
                  onChange={handleSelectMedico}
                  items={
                    form.medicoId && form.medicoLabel && !medicoItems.some((item) => item.value === form.medicoId)
                      ? [{ value: form.medicoId, label: form.medicoLabel }, ...medicoItems]
                      : medicoItems
                  }
                  isLoading={medicosQuery.isFetching}
                  placeholder='Médico...'
                  searchPlaceholder='Pesquisar médico...'
                  emptyText='Sem médicos'
                  disabled={isView}
                  searchValue={medicoSearch}
                  onSearchValueChange={setMedicoSearch}
                />
                <Button type='button' variant='secondary' size='icon' className='h-7 w-7 shrink-0' disabled={isView}>
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Especialidade</Label>
              <Input className={inputClass} disabled value={form.especialidade} readOnly />
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Nº Lote</Label>
              <Input className={inputClass} disabled value={form.numeroLote} readOnly />
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label className={labelClass}>Médico Externo</Label>
              <div className='flex gap-2'>
                <AsyncCombobox
                  value = {form.medicoExternoId}
                  onChange = {handleSelectMedicoExterno}
                  items = {
                    form.medicoExternoId &&
                    form.medicoExternoLabel &&
                    !medicoExternoItems.some((item) => item.value === form.medicoExternoId)
                      ? [{ value: form.medicoExternoId, label: form.medicoExternoLabel }, ...medicoExternoItems]
                      : medicoExternoItems
                  }
                  isLoading={medicosExternosQuery.isFetching}
                  placeholder='Médico Externo...'
                  searchPlaceholder='Pesquisar médico externo...'
                  emptyText='Sem médicos externos'
                  disabled={isView}
                  searchValue={medicoExternoSearch}
                  onSearchValueChange={setMedicoExternoSearch}
                />
                <Button type='button' variant='secondary' size='icon' className='h-7 w-7 shrink-0' disabled={isView}>
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
            <div className={`col-span-12 ${fieldGap}`}>
              <Label className={labelClass}>Histórico de Faturação</Label>
              <Input className={inputClass} disabled value={form.historicoFaturacao} readOnly />
            </div>
          </div>
        </TabsContent>

        <TabsContent value='registo-servicos' className='space-y-4 overflow-y-auto py-3'>
          <div className='rounded-md border p-3'>
            <h4 className='mb-3 text-sm font-semibold'>Consultas</h4>
            <div className={`grid grid-cols-12 ${formBlockGap}`}>
              <div className={`col-span-2 ${fieldGap}`}>
                <Label className={labelClass}>Cód. Serviço</Label>
                <Input
                  className={inputClass}
                  disabled
                  value={form.codigoServicoConsulta}
                  readOnly
                />
              </div>
              <div className={`col-span-4 ${fieldGap}`}>
                <Label className={labelClass}>Serviço</Label>
                <div className='flex gap-2'>
                  <AsyncCombobox
                    value={form.servicoConsultaId}
                    onChange={handleSelectServicoConsulta}
                    items={
                      form.servicoConsultaId &&
                      form.servicoConsultaLabel &&
                      !servicoConsultaItems.some((item) => item.value === form.servicoConsultaId)
                        ? [
                            {value: form.servicoConsultaId, label: form.servicoConsultaLabel},
                            ...servicoConsultaItems,
                        ]
                      : servicoConsultaItems
                    }
                    isLoading={servicosConsultaQuery.isFetching || subsistemasOrganismoQuery.isFetching}
                    placeholder={
                      form.utenteOrganismoId ? 'Serviço...' : 'Selecione primeiro o utente'
                    }
                    searchPlaceholder='Pesquisar serviço...'
                    emptyText={
                      form.utenteOrganismoId ? 'Sem serviços para o organismo' : 'Sem serviços'
                    }
                    disabled={isView || !form.utenteOrganismoId}
                    searchValue={servicoConsultaSearch}
                    onSearchValueChange={setServicoConsultaSearch}
                  />
                  <Button type='button' variant='secondary' size='icon' className='h-7 w-7 shrink-0' disabled={isView}>
                    <Plus className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </div>
              <div className={`col-span-2 ${fieldGap}`}>
                <Label className={labelClass}>Cód. Subsistema</Label>
                <Input
                  className={inputClass}
                  disabled
                  value={form.codigoSubsistemaConsulta}
                  readOnly
                />
              </div>
              <div className={`col-span-1 ${fieldGap}`}>
                <Label className={labelClass}>Quantidade</Label>
                <Input
                  className={inputClass}
                  disabled={isView}
                  value={form.quantidadeConsulta}
                  onChange={(e) => {
                    const quantidadeConsulta = e.target.value
                    const valorUnit = parseDecimal(form.consultaValorServicoUnit)
                    const utenteUnit = parseDecimal(form.consultaValorUtenteUnit)
                    if (valorUnit == null && utenteUnit == null) {
                      patchForm({ quantidadeConsulta })
                      return
                    }

                    patchForm({
                      quantidadeConsulta,
                      ...buildConsultaTotals(
                        valorUnit ?? 0,
                        utenteUnit ?? 0,
                        quantidadeConsulta,
                        form.taxaModeradora
                      ),
                    })
                  }}
                />
              </div>
              <div className={`col-span-2 ${fieldGap}`}>
                <Label
                  className={labelClass}
                  title='Valor total da consulta no registo (campo legado [V1]).'
                >
                  Valor consulta total (€) [V1]
                </Label>
                <Input
                  className={inputClass}
                  disabled={isView}
                  value={form.valorConsulta}
                  onChange={(e) => patchForm({ valorConsulta: e.target.value })}
                />
              </div>
              <div className={`col-span-2 ${fieldGap}`}>
                <Label
                  className={labelClass}
                  title='Taxa moderadora associada à consulta (campo legado [T1]).'
                >
                  Taxa moderadora consulta (€) [T1]
                </Label>
                <Input
                  className={inputClass}
                  disabled={isView}
                  value={form.taxaConsulta}
                  onChange={(e) => patchForm({ taxaConsulta: e.target.value })}
                />
              </div>
              <div className='col-span-12 flex items-center gap-2'>
                <Checkbox
                  disabled={isView}
                  checked={form.procedimentosEfetuados}
                  onCheckedChange={(value) => patchForm({ procedimentosEfetuados: Boolean(value) })}
                />
                <Label>Procedimentos Efetuados</Label>
              </div>
            </div>
          </div>
            
          <div className='rounded-md border p-3'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <h4 className='text-sm font-semibold'>Exames/Tratamentos</h4>
              <Button type='button' variant='outline' size='sm' disabled={isView} onClick={() => addLinhaRegisto('normal')}>
                + Inserir
              </Button>
            </div>
            <div className='space-y-2'>
              {linhasRegisto.length === 0 ? (
                <div className='rounded border border-dashed p-4 text-center text-sm text-muted-foreground'>
                  Sem linhas de exames/tratamentos.
                </div>
              ) : null}
              {linhasRegisto.map((linha) => (
                <div key={linha.id} className='grid grid-cols-12 gap-2 rounded border p-2'>
                  <div className='col-span-3'>
                    <Label className={labelClass}>Subsistema / serviço</Label>
                    <SubsistemaLinhaCombobox
                      value={linha.subsistemaServicoId}
                      onChange={(v) => handleSelectSubsistemaLinhaRegisto('normal', linha.id, v)}
                      disabled={isView || !form.utenteOrganismoId}
                      isLoading={subsistemasOrganismoQuery.isFetching}
                      items={subsistemaLinhaComboboxItems}
                      placeholder={
                        form.utenteOrganismoId
                          ? 'Subsistema/serviço (com ou sem vínculo organismo)…'
                          : 'Selecione primeiro o organismo'
                      }
                      emptyText={
                        form.utenteOrganismoId
                          ? 'Sem vínculos Subsistema/Serviço para este organismo e tipo. Serviços do tipo aparecem no fim da lista — preencha os valores na linha ou crie o vínculo em administração.'
                          : 'Sem subsistemas'
                      }
                      orphanSelected={
                        linha.subsistemaServicoId &&
                        linha.subsistemaLinhaLabel &&
                        !subsistemaLinhaComboboxItems.some((i) => i.value === linha.subsistemaServicoId)
                          ? { value: linha.subsistemaServicoId, label: linha.subsistemaLinhaLabel }
                          : null
                      }
                    />
                  </div>
                  <div className='col-span-1'>
                    <Label className={labelClass} title={LOTE_LINHA_TITLE_QTD}>
                      Qtd
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.quantidade}
                      onChange={(e) => updateLinhaQuantidade('normal', linha.id, e.target.value)}
                    />
                  </div>
                  <div className='col-span-1'>
                    <Label className={labelClass} title={LOTE_LINHA_TITLE_VALOR_UNITARIO}>
                      V. Unit.
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorUnitario}
                      onChange={(e) => updateLinhaRegisto('normal', linha.id, 'valorUnitario', e.target.value)}
                    />
                  </div>
                  <div className='col-span-2'>
                    <Label className={labelClass} title={LOTE_LINHA_TITLE_UTENTE_ORIG}>
                      Utente Orig.
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorUtenteOriginal}
                      onChange={(e) =>
                        updateLinhaRegisto('normal', linha.id, 'valorUtenteOriginal', e.target.value)
                      }
                    />
                  </div>
                  <div className='col-span-2'>
                    <Label className={labelClass} title={LOTE_LINHA_TITLE_INST_ORIG}>
                      Instit. Orig.
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorInstituicaoOriginal}
                      onChange={(e) =>
                        updateLinhaRegisto('normal', linha.id, 'valorInstituicaoOriginal', e.target.value)
                      }
                    />
                  </div>
                  <div className='col-span-1'>
                    <Label
                      className={labelClass}
                      title='Total taxa / comparticipação do utente na linha (€). No pedido: ValorUtente (decimal). No rodapé soma todas as linhas desta grelha em [T2].'
                    >
                      V. Utente (€) [T2]
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorUtente}
                      onChange={(e) => updateLinhaRegisto('normal', linha.id, 'valorUtente', e.target.value)}
                    />
                  </div>
                  <div className='col-span-1'>
                    <Label
                      className={labelClass}
                      title='Total valor instituição na linha (€). No pedido: ValorInstituicao (decimal). No rodapé soma todas as linhas desta grelha em [V2].'
                    >
                      V. Instit. (€) [V2]
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorInstituicao}
                      onChange={(e) =>
                        updateLinhaRegisto('normal', linha.id, 'valorInstituicao', e.target.value)
                      }
                    />
                  </div>
                  <div className='col-span-1 flex items-end'>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      disabled={isView}
                      onClick={() => removeLinhaRegisto('normal', linha.id)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`grid grid-cols-12 ${formBlockGap}`}>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label
                className={labelClass}
                title='Taxa moderadora da consulta [T1] + soma da coluna «V. Utente (€) [T2]» em Exames/Tratamentos + soma da coluna «V. Utente (€) [T3]» na grelha 789.'
              >
                Total taxas (€) — [T1] + [T2] + [T3]
              </Label>
              <Input
                className={inputClass}
                disabled
                value={formatMoneyPt(totaisRegistoCalculados.totalTaxas)}
                readOnly
              />
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label
                className={labelClass}
                title='Soma dos totais da coluna «V. Instit. (€) [V2]» na grelha Exames/Tratamentos.'
              >
                Total «V. Instit.» — exames (€) [V2]
              </Label>
              <Input
                className={inputClass}
                disabled
                value={formatMoneyPt(totaisRegistoCalculados.totalV2)}
                readOnly
              />
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label
                className={labelClass}
                title='Soma dos totais da coluna «V. Instit. (€) [V3]» na grelha «Exames não prescritos…».'
              >
                Total «V. Instit.» — 789 (€) [V3]
              </Label>
              <Input
                className={inputClass}
                disabled
                value={formatMoneyPt(totaisRegistoCalculados.totalV3)}
                readOnly
              />
            </div>
            <div className={`col-span-3 ${fieldGap}`}>
              <Label
                className={labelClass}
                title='Valor consulta total [V1] + total exames [V2] + total 789 [V3].'
              >
                Total global (€) — [V1] + [V2] + [V3]
              </Label>
              <Input
                className={inputClass}
                disabled
                value={formatMoneyPt(totaisRegistoCalculados.totalGeral)}
                readOnly
              />
            </div>
          </div>

          <div className='rounded-md border p-3'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <h4 className='text-sm font-semibold'>Exames Não Prescritos e Efetuados</h4>
              <Button type='button' variant='outline' size='sm' disabled={isView} onClick={() => addLinhaRegisto('789')}>
                + Inserir
              </Button>
            </div>
            <div className='space-y-2'>
              {linhasRegisto789.length === 0 ? (
                <div className='rounded border border-dashed p-4 text-center text-sm text-muted-foreground'>
                  Sem linhas 789.
                </div>
              ) : null}
              {linhasRegisto789.map((linha) => (
                <div key={linha.id} className='grid grid-cols-12 gap-2 rounded border p-2'>
                  <div className='col-span-3'>
                    <Label className={labelClass}>Subsistema / serviço</Label>
                    <SubsistemaLinhaCombobox
                      value={linha.subsistemaServicoId}
                      onChange={(v) => handleSelectSubsistemaLinhaRegisto('789', linha.id, v)}
                      disabled={isView || !form.utenteOrganismoId}
                      isLoading={subsistemasOrganismoQuery.isFetching}
                      items={subsistemaLinhaComboboxItems}
                      placeholder={
                        form.utenteOrganismoId
                          ? 'Subsistema/serviço (com ou sem vínculo organismo)…'
                          : 'Selecione primeiro o organismo'
                      }
                      emptyText={
                        form.utenteOrganismoId
                          ? 'Sem vínculos Subsistema/Serviço para este organismo e tipo. Serviços do tipo aparecem no fim da lista — preencha os valores na linha ou crie o vínculo em administração.'
                          : 'Sem subsistemas'
                      }
                      orphanSelected={
                        linha.subsistemaServicoId &&
                        linha.subsistemaLinhaLabel &&
                        !subsistemaLinhaComboboxItems.some((i) => i.value === linha.subsistemaServicoId)
                          ? { value: linha.subsistemaServicoId, label: linha.subsistemaLinhaLabel }
                          : null
                      }
                    />
                  </div>
                  <div className='col-span-1'>
                    <Label className={labelClass} title={LOTE_LINHA_TITLE_QTD}>
                      Qtd
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.quantidade}
                      onChange={(e) => updateLinhaQuantidade('789', linha.id, e.target.value)}
                    />
                  </div>
                  <div className='col-span-1'>
                    <Label className={labelClass} title={LOTE_LINHA_TITLE_VALOR_UNITARIO}>
                      V. Unit.
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorUnitario}
                      onChange={(e) => updateLinhaRegisto('789', linha.id, 'valorUnitario', e.target.value)}
                    />
                  </div>
                  <div className='col-span-2'>
                    <Label className={labelClass} title={LOTE_LINHA_TITLE_UTENTE_ORIG}>
                      Utente Orig.
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorUtenteOriginal}
                      onChange={(e) =>
                        updateLinhaRegisto('789', linha.id, 'valorUtenteOriginal', e.target.value)
                      }
                    />
                  </div>
                  <div className='col-span-2'>
                    <Label className={labelClass} title={LOTE_LINHA_TITLE_INST_ORIG}>
                      Instit. Orig.
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorInstituicaoOriginal}
                      onChange={(e) =>
                        updateLinhaRegisto('789', linha.id, 'valorInstituicaoOriginal', e.target.value)
                      }
                    />
                  </div>
                  <div className='col-span-1'>
                    <Label
                      className={labelClass}
                      title='Total taxa / comparticipação do utente na linha (€). No pedido: ValorUtente. No rodapé soma todas as linhas desta grelha em [T3].'
                    >
                      V. Utente (€) [T3]
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorUtente}
                      onChange={(e) => updateLinhaRegisto('789', linha.id, 'valorUtente', e.target.value)}
                    />
                  </div>
                  <div className='col-span-1'>
                    <Label
                      className={labelClass}
                      title='Total valor instituição na linha (€). No pedido: ValorInstituicao. No rodapé soma todas as linhas desta grelha em [V3].'
                    >
                      V. Instit. (€) [V3]
                    </Label>
                    <Input
                      className={inputClass}
                      disabled={isView}
                      value={linha.valorInstituicao}
                      onChange={(e) =>
                        updateLinhaRegisto('789', linha.id, 'valorInstituicao', e.target.value)
                      }
                    />
                  </div>
                  <div className='col-span-1 flex items-end'>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      disabled={isView}
                      onClick={() => removeLinhaRegisto('789', linha.id)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className={`${fieldGap} pt-2`}>
        <Label className={labelClass}>Utilizador</Label>
        <Input className={inputClass} disabled value={form.utilizador} readOnly />
      </div>

      {!renderAsPage ? (
        <DialogFooter className='shrink-0 gap-2 sm:justify-end'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {!isView ? (
            <Button type='button' onClick={handleSave} disabled={saving || loading}>
              Guardar
            </Button>
          ) : null}
        </DialogFooter>
      ) : null}
    </>
  )

  if (renderAsPage) {
    return (
      <div className='space-y-4'>
        <div className='rounded-md border bg-card p-4'>{content}</div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[100vh] w-[96vw] flex-col overflow-hidden p-4 pt-3 sm:max-w-[96vw] 2xl:max-w-[1600px] [&>button]:hidden'>
        {content}
      </DialogContent>
    </Dialog>
  )
}
