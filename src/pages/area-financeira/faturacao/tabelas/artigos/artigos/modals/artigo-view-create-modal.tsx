import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ImageIcon, Plus, Search } from 'lucide-react'
import { ImageUploader } from '@/components/shared/image-uploader'
import type {
  ArtigoDTO,
  TipoArtigoStocks,
} from '@/types/dtos/stocks/artigo.dtos'
import { TIPO_ARTIGO_OPTIONS } from '@/types/dtos/stocks/artigo.dtos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/utils/toast-utils'
import { cn } from '@/lib/utils'
import { ArtigoService } from '@/lib/services/stocks/artigo-service'
import { UnidadeMedidaService } from '@/lib/services/stocks/unidade-medida-service'
import { FamiliaArtigoService } from '@/lib/services/stocks/familia-artigo-service'
import type { FamiliaArtigoDTO } from '@/types/dtos/stocks/familia-artigo.dtos'
import { ArmazemService } from '@/lib/services/stocks/armazem-service'
import { TaxaIvaService } from '@/lib/services/taxas-iva/taxa-iva-service'
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'
import { ResponseStatus } from '@/types/api/responses'
import { modules } from '@/config/modules'
import state from '@/states/state'
import { toFullUrl } from '@/utils/image-url-helpers'
import { useTabManager } from '@/hooks/use-tab-manager'
import { usePagesStore } from '@/stores/use-pages-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import type {
  ArtigoFormPageDraft,
  ArtigoFormValues,
} from '../types/artigo-form-draft'

type ModalMode = 'view' | 'create' | 'edit'

export type ArtigoEditFormHandle = {
  save: () => Promise<void>
}

const FAMILIA_VAZIA = '__none__'
const MOTIVO_VAZIO = '__none__'
const EAN_MAX_LENGTH = 13

interface ArtigoEditFormProps {
  mode: ModalMode
  artigoId?: string
  windowId?: string
  onSaveSuccess?: () => void
  onLoadingChange?: (loading: boolean) => void
}

type FormValues = ArtigoFormValues

const emptyValues: FormValues = {
  codigo: '',
  numeroArtigo: '',
  descricao: '',
  ean: '',
  codigoBarras: '',
  unidadeMedidaId: '',
  familiaArtigoId: '',
  armazemId: '',
  taxaIvaId: '',
  motivoIsencaoId: '',
  tipoArtigo: 1,
  inativo: false,
  descontinuado: false,
  precoUnitarioSemIva1: '0',
  precoUnitarioSemIva2: '0',
  precoUnitarioSemIva3: '0',
  precoVendaComIva1: '0',
  precoVendaComIva2: '0',
  precoVendaComIva3: '0',
  precoCusto: '0',
  stockMinimo: '',
  stockMaximo: '',
  stockReposicao: '',
  permitirDescontos: true,
  permitirAlterarPreco: true,
  actHotel: false,
  actPOS: false,
  numSerieUCentral: '',
  desconto: '',
  capacidade: '',
  temGarantia: false,
  mesesGarantia: '',
  ampliacaoGarantia: '',
  visualizarNaNet: false,
  tipoMedida: 'quantidade',
}


function draftMatchesSession(
  draft: ArtigoFormPageDraft,
  mode: ModalMode,
  artigoId?: string,
): boolean {
  if (draft.mode !== mode) return false
  if (mode === 'create') return !draft.artigoId
  return draft.artigoId === artigoId
}

function parseDecimal(value: string): number {
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const n = Number.parseInt(trimmed, 10)
  return Number.isFinite(n) ? n : null
}

function tipoMedidaFromDto(value: ArtigoDTO['tipoMedida']): 'peso' | 'quantidade' {
  return value === 0 ? 'peso' : 'quantidade'
}

function tipoMedidaToApi(value: 'peso' | 'quantidade'): 0 | 1 {
  return value === 'peso' ? 0 : 1
}

function mapArtigoDtoToValues(d: ArtigoDTO): FormValues {
  return {
    codigo: d.codigo != null ? String(d.codigo) : '',
    numeroArtigo: d.numeroArtigo ?? '',
    descricao: d.descricao ?? '',
    ean: d.ean ?? '',
    codigoBarras: d.codigoBarras ?? '',
    unidadeMedidaId: d.unidadeMedidaId ?? '',
    familiaArtigoId: d.familiaArtigoId ?? '',
    armazemId: d.armazemId ?? '',
    taxaIvaId: d.taxaIvaId ?? '',
    motivoIsencaoId: d.motivoIsencaoId ?? '',
    tipoArtigo: d.tipoArtigo ?? 1,
    inativo: d.inativo ?? false,
    descontinuado: d.descontinuado ?? false,
    precoUnitarioSemIva1: String(d.precoUnitarioSemIva1 ?? 0),
    precoUnitarioSemIva2: String(d.precoUnitarioSemIva2 ?? 0),
    precoUnitarioSemIva3: String(d.precoUnitarioSemIva3 ?? 0),
    precoVendaComIva1: String(d.precoVendaComIva1 ?? 0),
    precoVendaComIva2: String(d.precoVendaComIva2 ?? 0),
    precoVendaComIva3: String(d.precoVendaComIva3 ?? 0),
    precoCusto: String(d.precoCusto ?? 0),
    stockMinimo: d.stockMinimo != null ? String(d.stockMinimo) : '',
    stockMaximo: d.stockMaximo != null ? String(d.stockMaximo) : '',
    stockReposicao:
      d.stockReposicao != null ? String(d.stockReposicao) : '',
    permitirDescontos: d.permitirDescontos ?? true,
    permitirAlterarPreco: d.permitirAlterarPreco ?? true,
    actHotel: d.actHotel ?? false,
    actPOS: d.actPOS ?? false,
    numSerieUCentral: d.numSerieUCentral ?? '',
    desconto: d.desconto != null ? String(d.desconto) : '',
    capacidade: d.capacidade != null ? String(d.capacidade) : '',
    temGarantia: d.temGarantia ?? false,
    mesesGarantia:
      d.mesesGarantia != null ? String(d.mesesGarantia) : '',
    ampliacaoGarantia:
      d.ampliacaoGarantia != null ? String(d.ampliacaoGarantia) : '',
    visualizarNaNet: d.visualizarNaNet ?? false,
    tipoMedida: tipoMedidaFromDto(d.tipoMedida),
  }
}

function formatReadonlyPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })
}

function formatAgregadoPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value === 0) return '—'
  return formatReadonlyPrice(value)
}

function SectionPanel({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-md border bg-muted/20 p-3 space-y-3 h-full',
        className,
      )}
    >
      <p className='text-xs font-semibold text-primary'>{title}</p>
      {children}
    </div>
  )
}

function SelectFieldRow({
  label,
  children,
  showAdd,
}: {
  label: string
  children: ReactNode
  showAdd?: boolean
}) {
  return (
    <div className='space-y-1.5'>
      <Label>{label}</Label>
      <div className='flex gap-1'>
        <div className='flex-1 min-w-0'>{children}</div>
        {showAdd && (
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='shrink-0 h-9 w-9'
            disabled
            title='Criação rápida em fase posterior'
          >
            <Plus className='h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
}

function PricePanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className='rounded-md border bg-muted/30 p-3 space-y-3'>
      <p className='text-[11px] font-semibold uppercase tracking-wide text-muted-foreground'>
        {title}
      </p>
      {children}
    </div>
  )
}

export const ArtigoEditForm = forwardRef<ArtigoEditFormHandle, ArtigoEditFormProps>(
  function ArtigoEditForm(
    { mode, artigoId, windowId, onSaveSuccess, onLoadingChange },
    ref,
  ) {
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [loading, setLoading] = useState(false)
  const [urlFoto, setUrlFoto] = useState<string | null>(null)
  const [stockReal, setStockReal] = useState<number | null>(null)
  const [precosAgregados, setPrecosAgregados] = useState({
    ultimoPrecoFinal: null as number | null,
    precoMedioFinal: null as number | null,
    ultimoPrecoVenda: null as number | null,
    precoMedioVenda: null as number | null,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id
  const setWindowHasFormData = useWindowsStore((s) => s.setWindowHasFormData)
  const setPageStateByWindowId = usePagesStore((s) => s.setPageStateByWindowId)
  const getPageStateByWindowId = usePagesStore((s) => s.getPageStateByWindowId)
  const draftRestoredRef = useRef(false)
  const { activeTab, setActiveTab } = useTabManager({
    defaultTab: 'identificacao',
  })

  const imageUrl = urlFoto
    ? (toFullUrl(urlFoto, state.URL) ?? urlFoto)
    : ''

  const { data: unidadesRes } = useQuery({
    queryKey: ['unidades-medida-light-artigo'],
    queryFn: () => UnidadeMedidaService().getUnidadesMedidaLight(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: familiasRes } = useQuery({
    queryKey: ['familias-artigo-light-artigo'],
    queryFn: () => FamiliaArtigoService().getFamiliasArtigoLight(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: armazensRes } = useQuery({
    queryKey: ['armazens-light-artigo'],
    queryFn: () => ArmazemService().getArmazensLight(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: taxasRes } = useQuery({
    queryKey: ['taxas-iva-light-artigo'],
    queryFn: () => TaxaIvaService().getTaxasIvaLight(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: motivosRes } = useQuery({
    queryKey: ['motivos-isencao-light-artigo'],
    queryFn: () => MotivoIsencaoService().getMotivosIsencaoLight(''),
    staleTime: 5 * 60 * 1000,
  })

  const unidades = unidadesRes?.info?.data ?? []
  const familias = familiasRes?.info?.data ?? []
  const armazens = armazensRes?.info?.data ?? []
  const taxasIva = useMemo(
    () =>
      (taxasRes?.info?.data ?? [])
        .slice()
        .sort((a, b) => a.taxa - b.taxa || a.descricao.localeCompare(b.descricao)),
    [taxasRes],
  )
  const motivos = motivosRes?.info?.data ?? []

  const taxaSelecionada = taxasIva.find((t) => t.id === values.taxaIvaId)
  const exigeMotivoIsencao = taxaSelecionada?.taxa === 0

  const { data: familiaCodigosRes } = useQuery({
    queryKey: ['familia-artigo-codigos-modal', values.familiaArtigoId],
    queryFn: async () => {
      const client = FamiliaArtigoService()
      let current = (
        await client.getFamiliaArtigoById(values.familiaArtigoId)
      ).info.data
      if (!current) return { fam: '', classe: '', sub: '' }

      let node: FamiliaArtigoDTO = current
      const byNivel: Record<number, number> = {
        [node.nivel]: node.codigo,
      }

      while (node.parentId) {
        const parent = (await client.getFamiliaArtigoById(node.parentId)).info.data
        if (!parent) break
        byNivel[parent.nivel] = parent.codigo
        node = parent
      }

      return {
        fam: byNivel[1] != null ? String(byNivel[1]) : '',
        classe: byNivel[2] != null ? String(byNivel[2]) : '',
        sub: byNivel[3] != null ? String(byNivel[3]) : '',
      }
    },
    enabled: !!values.familiaArtigoId,
    staleTime: 60_000,
  })

  const familiaCodigos = familiaCodigosRes ?? { fam: '', classe: '', sub: '' }

  const applyDraft = (draft: ArtigoFormPageDraft) => {
    setValues(draft.values)
    setUrlFoto(draft.urlFoto)
    setStockReal(draft.stockReal)
    setPrecosAgregados(draft.precosAgregados)
  }

  useEffect(() => {
    draftRestoredRef.current = false
  }, [mode, artigoId, windowId])

  useEffect(() => {
    if (draftRestoredRef.current) return

    if (windowId) {
      const draft = getPageStateByWindowId(windowId)?.artigoFormDraft
      if (draft && draftMatchesSession(draft, mode, artigoId)) {
        applyDraft(draft)
        draftRestoredRef.current = true
        return
      }
    }

    if (mode === 'create') {
      setValues(emptyValues)
      setUrlFoto(null)
      setStockReal(null)
      setPrecosAgregados({
        ultimoPrecoFinal: null,
        precoMedioFinal: null,
        ultimoPrecoVenda: null,
        precoMedioVenda: null,
      })
      draftRestoredRef.current = true
      return
    }

    if (!artigoId) return

    let cancelled = false
    setLoading(true)
    onLoadingChange?.(true)

    void (async () => {
      try {
        const response = await ArtigoService().getArtigoById(artigoId)
        if (cancelled) return

        if (
          response.info.status !== ResponseStatus.Success ||
          !response.info.data
        ) {
          toast.error(
            response.info.messages?.['$']?.[0] ??
              'Não foi possível carregar o artigo.',
          )
          return
        }

        const d = response.info.data
        setValues(mapArtigoDtoToValues(d))
        setUrlFoto(d.urlFoto ?? null)
        setStockReal(d.stockReal ?? null)
        setPrecosAgregados({
          ultimoPrecoFinal: d.ultimoPrecoFinal ?? null,
          precoMedioFinal: d.precoMedioFinal ?? null,
          ultimoPrecoVenda: d.ultimoPrecoVenda ?? null,
          precoMedioVenda: d.precoMedioVenda ?? null,
        })
        draftRestoredRef.current = true
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar artigo.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          onLoadingChange?.(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    mode,
    artigoId,
    windowId,
    getPageStateByWindowId,
    onLoadingChange,
  ])

  useEffect(() => {
    if (!windowId || isView) return

    setPageStateByWindowId(windowId, {
      artigoFormDraft: {
        artigoId: artigoId ?? null,
        mode,
        values,
        urlFoto,
        stockReal,
        precosAgregados,
      },
    })

    const hasChanges =
      mode === 'create'
        ? JSON.stringify(values) !== JSON.stringify(emptyValues) ||
          !!urlFoto
        : true
    setWindowHasFormData(windowId, hasChanges)
  }, [
    windowId,
    isView,
    mode,
    artigoId,
    values,
    urlFoto,
    stockReal,
    precosAgregados,
    setPageStateByWindowId,
    setWindowHasFormData,
  ])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.descricao?.trim()) {
      toast.error('Descrição é obrigatória.')
      return
    }
    if (!values.unidadeMedidaId) {
      toast.error('Unidade é obrigatória.')
      return
    }
    if (!values.armazemId) {
      toast.error('Armazém é obrigatório.')
      return
    }
    if (!values.taxaIvaId) {
      toast.error('Taxa de IVA é obrigatória.')
      return
    }
    if (exigeMotivoIsencao && !values.motivoIsencaoId) {
      toast.error('Motivo de isenção é obrigatório para taxa isenta.')
      return
    }
    if (values.ean?.trim() && values.ean.trim().length > EAN_MAX_LENGTH) {
      toast.error(`EAN não pode exceder ${EAN_MAX_LENGTH} caracteres.`)
      return
    }

    const body = {
      numeroArtigo: values.numeroArtigo?.trim() || null,
      descricao: values.descricao.trim(),
      ean: values.ean?.trim() || null,
      codigoBarras: values.codigoBarras?.trim() || null,
      urlFoto: urlFoto?.trim() || null,
      unidadeMedidaId: values.unidadeMedidaId,
      familiaArtigoId: values.familiaArtigoId?.trim() || null,
      taxaIvaId: values.taxaIvaId,
      motivoIsencaoId: values.motivoIsencaoId?.trim() || null,
      armazemId: values.armazemId,
      tipoArtigo: values.tipoArtigo,
      inativo: values.inativo,
      descontinuado: values.descontinuado,
      precoUnitarioSemIva1: parseDecimal(values.precoUnitarioSemIva1),
      precoUnitarioSemIva2: parseDecimal(values.precoUnitarioSemIva2),
      precoUnitarioSemIva3: parseDecimal(values.precoUnitarioSemIva3),
      precoVendaComIva1: parseDecimal(values.precoVendaComIva1),
      precoVendaComIva2: parseDecimal(values.precoVendaComIva2),
      precoVendaComIva3: parseDecimal(values.precoVendaComIva3),
      precoCusto: parseDecimal(values.precoCusto),
      stockMinimo: values.stockMinimo ? parseDecimal(values.stockMinimo) : null,
      stockMaximo: values.stockMaximo ? parseDecimal(values.stockMaximo) : null,
      stockReposicao: values.stockReposicao
        ? parseDecimal(values.stockReposicao)
        : null,
      permitirDescontos: values.permitirDescontos,
      permitirAlterarPreco: values.permitirAlterarPreco,
      actHotel: values.actHotel,
      actPOS: values.actPOS,
      numSerieUCentral: values.numSerieUCentral?.trim() || null,
      desconto: values.desconto.trim()
        ? parseDecimal(values.desconto)
        : null,
      capacidade: values.capacidade.trim()
        ? parseDecimal(values.capacidade)
        : null,
      temGarantia: values.temGarantia,
      mesesGarantia: parseOptionalInt(values.mesesGarantia),
      ampliacaoGarantia: parseOptionalInt(values.ampliacaoGarantia),
      visualizarNaNet: values.visualizarNaNet,
      tipoMedida: tipoMedidaToApi(values.tipoMedida),
    }

    try {
      const client = ArtigoService()

      if (isEdit && artigoId) {
        const response = await client.updateArtigo(artigoId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Artigo atualizado com sucesso.')
          if (windowId) {
            setPageStateByWindowId(windowId, { artigoFormDraft: undefined })
            setWindowHasFormData(windowId, false)
          }
          onSaveSuccess?.()
        } else {
          toast.error(
            response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar artigo.',
          )
        }
      } else {
        const response = await client.createArtigo(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Artigo criado com sucesso.')
          if (windowId) {
            setPageStateByWindowId(windowId, { artigoFormDraft: undefined })
            setWindowHasFormData(windowId, false)
          }
          onSaveSuccess?.()
        } else {
          toast.error(
            response.info.messages?.['$']?.[0] ?? 'Falha ao criar artigo.',
          )
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o artigo.')
    }
  }

  useImperativeHandle(ref, () => ({ save: handleGuardar }), [handleGuardar])

  return (
    <>
      {loading ? (
        <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
      ) : (
        <div className='space-y-4'>
            {/* Cabeçalho — alinhado com ArtigoEdt.aspx */}
            <div className='flex gap-4'>
              <div className='flex-1 space-y-3 min-w-0'>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='artigo-codigo'>Código</Label>
                    <Input
                      id='artigo-codigo'
                      value={
                        values.numeroArtigo ||
                        values.codigo ||
                        (mode === 'create' ? '' : '')
                      }
                      onChange={(e) =>
                        setValues((p) => ({
                          ...p,
                          numeroArtigo: e.target.value,
                        }))
                      }
                      readOnly={isView}
                      maxLength={20}
                      placeholder='Auto se vazio'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='artigo-ean'>EAN</Label>
                    <Input
                      id='artigo-ean'
                      value={values.ean}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, ean: e.target.value }))
                      }
                      readOnly={isView}
                      maxLength={EAN_MAX_LENGTH}
                      placeholder='EAN...'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label>Armazém</Label>
                    <Select
                      value={values.armazemId || undefined}
                      onValueChange={(v) =>
                        setValues((p) => ({ ...p, armazemId: v }))
                      }
                      disabled={isView}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Armazém...' />
                      </SelectTrigger>
                      <SelectContent>
                        {armazens.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.codigo} - {a.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label>Tipo de artigo</Label>
                  <RadioGroup
                    value={String(values.tipoArtigo)}
                    onValueChange={(v) =>
                      !isView &&
                      setValues((p) => ({
                        ...p,
                        tipoArtigo: Number(v) as TipoArtigoStocks,
                      }))
                    }
                    className='flex flex-wrap gap-4'
                    disabled={isView}
                  >
                    {TIPO_ARTIGO_OPTIONS.map((o) => (
                      <div key={o.value} className='flex items-center gap-2'>
                        <RadioGroupItem
                          value={String(o.value)}
                          id={`artigo-pso-${o.value}`}
                          disabled={isView}
                        />
                        <Label
                          htmlFor={`artigo-pso-${o.value}`}
                          className='font-normal cursor-pointer'
                        >
                          {o.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='artigo-descricao'>Descrição</Label>
                  <Input
                    id='artigo-descricao'
                    value={values.descricao}
                    onChange={(e) =>
                      setValues((p) => ({ ...p, descricao: e.target.value }))
                    }
                    readOnly={isView}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className='shrink-0 flex flex-col items-end gap-2'>
                {!isView ? (
                  <Button
                    type='button'
                    variant='secondary'
                    size='sm'
                    disabled={!artigoId}
                    title={
                      artigoId
                        ? 'Ver movimentos do artigo'
                        : 'Disponível após guardar o artigo'
                    }
                    onClick={() => {
                      if (artigoId) setActiveTab('movimentos')
                    }}
                  >
                    <Search className='mr-2 h-4 w-4' />
                    Ver movimentos
                  </Button>
                ) : null}
                <Label className='self-start'>Foto</Label>
                <ImageUploader
                  key={`artigo-foto-${artigoId || 'new'}-${urlFoto || 'sem'}`}
                  idFuncionalidade={tabelasPermId}
                  uploadUrl='/client/utility/ImageUpload/upload-image'
                  fieldName='File'
                  additionalFields={{ Subfolder: 'Artigos' }}
                  currentImageUrl={imageUrl || undefined}
                  disabled={isView}
                  showMetadata={false}
                  variant='compact'
                  placeholder=''
                  actionButtonLabel='Foto'
                  actionButtonShowLabel={false}
                  showFileTypesHint={false}
                  showRemoveButtonAlways
                  rootClassName='border-solid border-[#2aa89a] bg-background/0 backdrop-blur-0 w-36 h-36 max-w-[9rem]'
                  actionButtonClassName='bg-[#2aa89a] text-white hover:bg-[#239b8f]'
                  placeholderIcon={
                    <ImageIcon className='h-12 w-12 text-muted-foreground/50' />
                  }
                  onPartialUrlChange={(partialUrl) =>
                    setUrlFoto(partialUrl?.trim() || null)
                  }
                  onUploadSuccess={(partialUrl) =>
                    setUrlFoto(partialUrl?.trim() || null)
                  }
                  onUploadError={(err) => {
                    const message =
                      err instanceof Error ? err.message : String(err)
                    toast.error(message || 'Ocorreu um erro ao enviar a imagem.')
                  }}
                />
              </div>
            </div>

            {/* PU sem IVA — grupo superior no legado (ArtigoEdt.aspx) */}
            <PricePanel title='Preço unitário sem IVA'>
              <div className='grid grid-cols-3 sm:grid-cols-5 gap-3'>
                {(['1', '2', '3'] as const).map((n) => (
                  <div key={`pu-top-${n}`} className='space-y-1.5'>
                    <Label className='text-xs'>PU ({n}) (€)</Label>
                    <Input
                      value={
                        values[
                          `precoUnitarioSemIva${n}` as keyof FormValues
                        ] as string
                      }
                      onChange={(e) =>
                        setValues((p) => ({
                          ...p,
                          [`precoUnitarioSemIva${n}`]: e.target.value,
                        }))
                      }
                      readOnly={isView}
                      inputMode='decimal'
                    />
                  </div>
                ))}
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Último preço</Label>
                  <Input
                    readOnly
                    className='bg-muted'
                    value={formatAgregadoPrice(precosAgregados.ultimoPrecoVenda)}
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label className='text-xs'>Preço médio</Label>
                  <Input
                    readOnly
                    className='bg-muted'
                    value={formatAgregadoPrice(precosAgregados.precoMedioVenda)}
                  />
                </div>
              </div>
            </PricePanel>

            {/* Painéis de preços — 3 colunas como no legado */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <PricePanel title='Preços compra'>
                <div className='space-y-2'>
                  <Label className='text-xs'>Último preço</Label>
                  <Input
                    readOnly
                    className='bg-muted'
                    value={formatAgregadoPrice(precosAgregados.ultimoPrecoFinal)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-xs'>Preço médio</Label>
                  <Input
                    readOnly
                    className='bg-muted'
                    value={formatAgregadoPrice(precosAgregados.precoMedioFinal)}
                  />
                </div>
              </PricePanel>

              <PricePanel title='Preço de venda ao público com IVA'>
                <div className='grid grid-cols-3 gap-2'>
                  {(['1', '2', '3'] as const).map((n) => (
                    <div key={`pvp${n}`} className='space-y-1.5'>
                      <Label className='text-xs'>PVP ({n}) (€)</Label>
                      <Input
                        value={
                          values[
                            `precoVendaComIva${n}` as keyof FormValues
                          ] as string
                        }
                        onChange={(e) =>
                          setValues((p) => ({
                            ...p,
                            [`precoVendaComIva${n}`]: e.target.value,
                          }))
                        }
                        readOnly={isView}
                        inputMode='decimal'
                        placeholder={`PVP (${n})...`}
                      />
                    </div>
                  ))}
                </div>
              </PricePanel>

              <PricePanel title='Preços venda'>
                <div className='space-y-2'>
                  <Label className='text-xs'>Último preço</Label>
                  <Input
                    readOnly
                    className='bg-muted'
                    value={formatAgregadoPrice(precosAgregados.ultimoPrecoVenda)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-xs'>Preço médio</Label>
                  <Input
                    readOnly
                    className='bg-muted'
                    value={formatAgregadoPrice(precosAgregados.precoMedioVenda)}
                  />
                </div>
              </PricePanel>
            </div>

            {/* Tabs — réplica ArtigoEdt.aspx */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='w-full justify-start flex-wrap h-auto gap-1'>
                <TabsTrigger value='identificacao'>Identificação</TabsTrigger>
                <TabsTrigger value='dados1'>Dados1</TabsTrigger>
                <TabsTrigger value='outros-dados'>Outros dados</TabsTrigger>
                <TabsTrigger value='armazens'>Armazéns</TabsTrigger>
                <TabsTrigger value='fornecedores'>Fornecedores</TabsTrigger>
                <TabsTrigger value='movimentos'>Movimentos</TabsTrigger>
              </TabsList>

              <TabsContent value='identificacao' className='space-y-4 pt-3'>
                <div className='space-y-1.5 max-w-md'>
                  <Label htmlFor='artigo-num-serie'>Nº Série U. Central</Label>
                  <Input
                    id='artigo-num-serie'
                    value={values.numSerieUCentral}
                    onChange={(e) =>
                      setValues((p) => ({
                        ...p,
                        numSerieUCentral: e.target.value,
                      }))
                    }
                    readOnly={isView}
                    maxLength={100}
                    placeholder='Nº Série U. Central...'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <SelectFieldRow label='IVA' showAdd>
                    <Select
                      value={values.taxaIvaId || undefined}
                      onValueChange={(v) =>
                        setValues((p) => ({ ...p, taxaIvaId: v }))
                      }
                      disabled={isView}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='IVA...' />
                      </SelectTrigger>
                      <SelectContent>
                        {taxasIva.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.descricao} ({t.taxa}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SelectFieldRow>

                  <SelectFieldRow label='Motivo isenção' showAdd>
                    <Select
                      value={values.motivoIsencaoId || MOTIVO_VAZIO}
                      onValueChange={(v) =>
                        setValues((p) => ({
                          ...p,
                          motivoIsencaoId: v === MOTIVO_VAZIO ? '' : v,
                        }))
                      }
                      disabled={isView}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            exigeMotivoIsencao ? 'Obrigatório' : 'Motivo...'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={MOTIVO_VAZIO}>—</SelectItem>
                        {motivos.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.codigo} - {m.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SelectFieldRow>

                  <SelectFieldRow label='Unidade' showAdd>
                    <Select
                      value={values.unidadeMedidaId || undefined}
                      onValueChange={(v) =>
                        setValues((p) => ({ ...p, unidadeMedidaId: v }))
                      }
                      disabled={isView}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Unidade...' />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.codigo} - {u.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SelectFieldRow>

                  <div className='space-y-1.5'>
                    <Label htmlFor='artigo-desconto'>Desconto (%)</Label>
                    <Input
                      id='artigo-desconto'
                      value={values.desconto}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, desconto: e.target.value }))
                      }
                      readOnly={isView}
                      inputMode='decimal'
                      placeholder='Desconto...'
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <Label htmlFor='artigo-capacidade'>Capacidade</Label>
                    <Input
                      id='artigo-capacidade'
                      value={values.capacidade}
                      onChange={(e) =>
                        setValues((p) => ({
                          ...p,
                          capacidade: e.target.value,
                        }))
                      }
                      readOnly={isView}
                      inputMode='decimal'
                      placeholder='Capacidade...'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-12 gap-4 items-end'>
                  <div className='sm:col-span-2 space-y-1.5'>
                    <Label>Família</Label>
                    <Input
                      readOnly
                      className='bg-muted'
                      value={familiaCodigos.fam || '—'}
                    />
                  </div>
                  <div className='sm:col-span-2 space-y-1.5'>
                    <Label>Classe</Label>
                    <Input
                      readOnly
                      className='bg-muted'
                      value={familiaCodigos.classe || '—'}
                    />
                  </div>
                  <div className='sm:col-span-2 space-y-1.5'>
                    <Label>Sub. classe</Label>
                    <Input
                      readOnly
                      className='bg-muted'
                      value={familiaCodigos.sub || '—'}
                    />
                  </div>
                  <div className='sm:col-span-6'>
                    <SelectFieldRow label='Descrição (família)' showAdd>
                      <Select
                        value={values.familiaArtigoId || FAMILIA_VAZIA}
                        onValueChange={(v) =>
                          setValues((p) => ({
                            ...p,
                            familiaArtigoId: v === FAMILIA_VAZIA ? '' : v,
                          }))
                        }
                        disabled={isView}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Família...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FAMILIA_VAZIA}>—</SelectItem>
                          {familias.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.path || f.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </SelectFieldRow>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='dados1' className='space-y-4 pt-3 max-w-xl'>
                {(
                  [
                    'Princípio Activo',
                    'Grupo Formas Admin.',
                    'Grupo Dosagem',
                    'Grupo Vias Admin.',
                  ] as const
                ).map((label) => (
                  <SelectFieldRow key={label} label={label} showAdd>
                    <Input
                      readOnly
                      disabled
                      placeholder={`${label}...`}
                      className='bg-muted'
                    />
                  </SelectFieldRow>
                ))}
                <p className='text-xs text-muted-foreground'>
                  Dados farmacêuticos — disponíveis quando o módulo de
                  prescrição estiver integrado.
                </p>
              </TabsContent>

              <TabsContent value='outros-dados' className='pt-3'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <SectionPanel title='Garantia'>
                    <div className='flex items-center justify-between gap-2'>
                      <Label htmlFor='artigo-tem-garantia'>Tem</Label>
                      <Switch
                        id='artigo-tem-garantia'
                        checked={values.temGarantia}
                        onCheckedChange={(checked) =>
                          !isView &&
                          setValues((p) => ({
                            ...p,
                            temGarantia: checked === true,
                          }))
                        }
                        disabled={isView}
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='artigo-meses-garantia'>Meses</Label>
                      <Input
                        id='artigo-meses-garantia'
                        value={values.mesesGarantia}
                        onChange={(e) =>
                          setValues((p) => ({
                            ...p,
                            mesesGarantia: e.target.value,
                          }))
                        }
                        readOnly={isView}
                        placeholder='Meses...'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='artigo-ampliacao'>Ampliação</Label>
                      <Input
                        id='artigo-ampliacao'
                        value={values.ampliacaoGarantia}
                        onChange={(e) =>
                          setValues((p) => ({
                            ...p,
                            ampliacaoGarantia: e.target.value,
                          }))
                        }
                        readOnly={isView}
                        placeholder='Ampliação...'
                      />
                    </div>
                  </SectionPanel>

                  <SectionPanel title='Stocks'>
                    <div className='space-y-1.5'>
                      <Label>Mínimo</Label>
                      <Input
                        value={values.stockMinimo}
                        onChange={(e) =>
                          setValues((p) => ({
                            ...p,
                            stockMinimo: e.target.value,
                          }))
                        }
                        readOnly={isView}
                        inputMode='decimal'
                        placeholder='Mínimo...'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label>Máximo</Label>
                      <Input
                        value={values.stockMaximo}
                        onChange={(e) =>
                          setValues((p) => ({
                            ...p,
                            stockMaximo: e.target.value,
                          }))
                        }
                        readOnly={isView}
                        inputMode='decimal'
                        placeholder='Máximo...'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label>Reposição</Label>
                      <Input
                        value={values.stockReposicao}
                        onChange={(e) =>
                          setValues((p) => ({
                            ...p,
                            stockReposicao: e.target.value,
                          }))
                        }
                        readOnly={isView}
                        inputMode='decimal'
                        placeholder='Reposição...'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label>Real</Label>
                      <Input
                        readOnly
                        className='bg-muted'
                        value={
                          stockReal != null
                            ? formatReadonlyPrice(stockReal)
                            : '—'
                        }
                      />
                    </div>
                  </SectionPanel>

                  <SectionPanel title='Outros'>
                    <div className='flex items-center justify-between gap-2'>
                      <Label htmlFor='artigo-visualizar-net'>
                        Visualizar na Net
                      </Label>
                      <Switch
                        id='artigo-visualizar-net'
                        checked={values.visualizarNaNet}
                        onCheckedChange={(checked) =>
                          !isView &&
                          setValues((p) => ({
                            ...p,
                            visualizarNaNet: checked === true,
                          }))
                        }
                        disabled={isView}
                      />
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                      <Label htmlFor='artigo-act-hotel'>
                        Utilização no Hotel
                      </Label>
                      <Switch
                        id='artigo-act-hotel'
                        checked={values.actHotel}
                        onCheckedChange={(checked) =>
                          !isView &&
                          setValues((p) => ({
                            ...p,
                            actHotel: checked === true,
                          }))
                        }
                        disabled={isView}
                      />
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                      <Label htmlFor='artigo-act-pos'>Utilização no POS</Label>
                      <Switch
                        id='artigo-act-pos'
                        checked={values.actPOS}
                        onCheckedChange={(checked) =>
                          !isView &&
                          setValues((p) => ({
                            ...p,
                            actPOS: checked === true,
                          }))
                        }
                        disabled={isView}
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label>Tipo de medida</Label>
                      <RadioGroup
                        value={values.tipoMedida}
                        onValueChange={(v) =>
                          !isView &&
                          setValues((p) => ({
                            ...p,
                            tipoMedida: v as 'peso' | 'quantidade',
                          }))
                        }
                        className='flex gap-4'
                        disabled={isView}
                      >
                        <div className='flex items-center gap-2'>
                          <RadioGroupItem
                            value='peso'
                            id='artigo-tipo-medida-peso'
                          />
                          <Label
                            htmlFor='artigo-tipo-medida-peso'
                            className='font-normal'
                          >
                            Peso
                          </Label>
                        </div>
                        <div className='flex items-center gap-2'>
                          <RadioGroupItem
                            value='quantidade'
                            id='artigo-tipo-medida-qtd'
                          />
                          <Label
                            htmlFor='artigo-tipo-medida-qtd'
                            className='font-normal'
                          >
                            Quantidade
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                      <Label htmlFor='artigo-permitir-descontos'>
                        Permitir descontos
                      </Label>
                      <Switch
                        id='artigo-permitir-descontos'
                        checked={values.permitirDescontos}
                        onCheckedChange={(checked) =>
                          !isView &&
                          setValues((p) => ({
                            ...p,
                            permitirDescontos: checked === true,
                          }))
                        }
                        disabled={isView}
                      />
                    </div>
                    <div className='flex items-center justify-between gap-2'>
                      <Label htmlFor='artigo-permitir-alterar-preco'>
                        Permitir alterar preço
                      </Label>
                      <Switch
                        id='artigo-permitir-alterar-preco'
                        checked={values.permitirAlterarPreco}
                        onCheckedChange={(checked) =>
                          !isView &&
                          setValues((p) => ({
                            ...p,
                            permitirAlterarPreco: checked === true,
                          }))
                        }
                        disabled={isView}
                      />
                    </div>
                    <div className='flex flex-wrap gap-4 pt-1 border-t'>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          id='artigo-inativo'
                          checked={values.inativo}
                          onCheckedChange={(checked) =>
                            !isView &&
                            setValues((p) => ({
                              ...p,
                              inativo: checked === true,
                            }))
                          }
                          disabled={isView}
                        />
                        <Label htmlFor='artigo-inativo' className='font-normal'>
                          Inativo
                        </Label>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          id='artigo-descontinuado'
                          checked={values.descontinuado}
                          onCheckedChange={(checked) =>
                            !isView &&
                            setValues((p) => ({
                              ...p,
                              descontinuado: checked === true,
                            }))
                          }
                          disabled={isView}
                        />
                        <Label
                          htmlFor='artigo-descontinuado'
                          className='font-normal'
                        >
                          Descontinuado
                        </Label>
                      </div>
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='artigo-barras'>Código barras</Label>
                      <Input
                        id='artigo-barras'
                        value={values.codigoBarras}
                        onChange={(e) =>
                          setValues((p) => ({
                            ...p,
                            codigoBarras: e.target.value,
                          }))
                        }
                        readOnly={isView}
                        maxLength={50}
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label>Preço custo (€)</Label>
                      <Input
                        value={values.precoCusto}
                        onChange={(e) =>
                          setValues((p) => ({
                            ...p,
                            precoCusto: e.target.value,
                          }))
                        }
                        readOnly={isView}
                        inputMode='decimal'
                      />
                    </div>
                  </SectionPanel>
                </div>
              </TabsContent>

              <TabsContent value='armazens' className='pt-3'>
                <div className='rounded-md border max-h-64 overflow-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-24'>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className='w-32 text-right'>
                          Quantidade
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {armazens.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className='text-center text-muted-foreground py-6'
                          >
                            Sem armazéns configurados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        armazens.map((a) => (
                          <TableRow
                            key={a.id}
                            className={
                              a.id === values.armazemId ? 'bg-primary/5' : ''
                            }
                          >
                            <TableCell>{a.codigo}</TableCell>
                            <TableCell>{a.nome}</TableCell>
                            <TableCell className='text-right text-muted-foreground'>
                              —
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <p className='text-xs text-muted-foreground mt-2'>
                  Quantidades por armazém serão carregadas quando a API de stock
                  por armazém estiver disponível.
                </p>
              </TabsContent>

              <TabsContent value='fornecedores' className='pt-3 space-y-3'>
                <div className='flex justify-end gap-2'>
                  <Button type='button' variant='outline' size='sm' disabled>
                    <Plus className='mr-1 h-4 w-4' />
                    Inserir
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled
                    className='text-destructive'
                  >
                    Remover
                  </Button>
                </div>
                <div className='rounded-md border max-h-64 overflow-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-20'>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Cód. art. fornec.</TableHead>
                        <TableHead>Descrição art. fornec.</TableHead>
                        <TableHead className='w-24'>Preço</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className='text-center text-muted-foreground py-8'
                        >
                          Sem fornecedores associados. Funcionalidade em fase
                          posterior.
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value='movimentos' className='pt-3'>
                <div className='rounded-md border max-h-72 overflow-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N.º movimento</TableHead>
                        <TableHead>Data entrada</TableHead>
                        <TableHead>Data saída</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Lote</TableHead>
                        <TableHead>Validade</TableHead>
                        <TableHead>Qtd. disponível</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Destino</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className='text-center text-muted-foreground py-8'
                        >
                          {artigoId
                            ? 'Sem movimentos registados para este artigo.'
                            : 'Guarde o artigo para consultar movimentos.'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
    </>
  )
})
