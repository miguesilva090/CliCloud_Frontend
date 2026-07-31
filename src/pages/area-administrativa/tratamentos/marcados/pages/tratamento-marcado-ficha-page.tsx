import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { Save } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { EntityFormPageHeader } from '@/components/shared/entity-form-page-header'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { useTabManager } from '@/hooks/use-tab-manager'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { TratamentoService } from '@/lib/services/tratamentos/tratamento-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { SessaoTratamentoTableDTO } from '@/types/dtos/tratamentos/sessao-tratamento.dtos'
import {
  useGetTratamentoFicha,
  useGetTratamentoFichaSessoes,
  useInvalidateTratamentoFicha,
} from '../queries/tratamento-marcado-ficha-queries'
import {
  buildUpdateTratamentoPayload,
  dtoToTratamentoFichaForm,
  emptyTratamentoFichaForm,
  type TratamentoFichaFormValues,
} from '../utils/tratamento-ficha-form'

const listPermId = modules.areaAdministrativa.permissions.consultas.id

function fmtDate(v?: string | null) {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-PT')
}

function bitCell(v?: number | null) {
  return v === 1 ? 'Sim' : 'Não'
}

function withSelected(
  items: ComboboxItem[],
  id: string,
  label: string
): ComboboxItem[] {
  if (!id) return items
  if (items.some((i) => i.value === id)) return items
  return [{ value: id, label: label || id }, ...items]
}

async function loadTecnicosByTipo(tipo: number, keyword: string) {
  const res = await TecnicoService(listPermId).getTecnicosPaginated({
    pageNumber: 1,
    pageSize: 30,
    filters: [
      { id: 'tipoTecnico', value: String(tipo) },
      ...(keyword ? [{ id: 'nome', value: keyword }] : []),
    ],
  })
  return res.info?.data ?? []
}

const EmptyFilterControls = () => null

const sessoesColumns: DataTableColumnDef<SessaoTratamentoTableDTO>[] = [
  {
    accessorKey: 'numSessao',
    header: 'N.º',
    enableSorting: false,
    cell: ({ row }) => row.original.numSessao ?? '—',
  },
  {
    accessorKey: 'data',
    header: 'Data',
    enableSorting: false,
    cell: ({ row }) => fmtDate(row.original.data),
  },
  {
    accessorKey: 'horaInic',
    header: 'Início',
    enableSorting: false,
    cell: ({ row }) => row.original.horaInic?.trim() || '—',
  },
  {
    accessorKey: 'duracao',
    header: 'Duração',
    enableSorting: false,
    cell: ({ row }) => row.original.duracao?.trim() || '—',
  },
  {
    accessorKey: 'confirmado',
    header: 'Confirmado',
    enableSorting: false,
    cell: ({ row }) => bitCell(row.original.confirmado),
  },
  {
    accessorKey: 'efetuado',
    header: 'Efectuado',
    enableSorting: false,
    cell: ({ row }) => bitCell(row.original.efetuado),
  },
  {
    accessorKey: 'faltou',
    header: 'Faltou',
    enableSorting: false,
    cell: ({ row }) => bitCell(row.original.faltou),
  },
  {
    accessorKey: 'desmarcado',
    header: 'Desmarcado',
    enableSorting: false,
    cell: ({ row }) => bitCell(row.original.desmarcado),
  },
  {
    accessorKey: 'pago',
    header: 'Pago',
    enableSorting: false,
    cell: ({ row }) => bitCell(row.original.pago),
  },
]

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function TratamentoMarcadoFichaPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const { canView, canChange } = useAreaComumEntityListPermissions(listPermId)
  const { activeTab, setActiveTab } = useTabManager({ defaultTab: 'dados' })
  const invalidate = useInvalidateTratamentoFicha()

  const [form, setForm] = useState<TratamentoFichaFormValues>(
    emptyTratamentoFichaForm()
  )
  const [isSaving, setIsSaving] = useState(false)

  const [orgSearch, setOrgSearch] = useState('')
  const [medSearch, setMedSearch] = useState('')
  const [fisioSearch, setFisioSearch] = useState('')
  const [auxSearch, setAuxSearch] = useState('')
  const [outroSearch, setOutroSearch] = useState('')
  const [localSearch, setLocalSearch] = useState('')

  const [debouncedOrg] = useDebounce(orgSearch, 300)
  const [debouncedMed] = useDebounce(medSearch, 300)
  const [debouncedFisio] = useDebounce(fisioSearch, 300)
  const [debouncedAux] = useDebounce(auxSearch, 300)
  const [debouncedOutro] = useDebounce(outroSearch, 300)
  const [debouncedLocal] = useDebounce(localSearch, 300)

  const tratamentoQuery = useGetTratamentoFicha(id, canView)
  const sessoesQuery = useGetTratamentoFichaSessoes(id, canView)

  const dto =
    tratamentoQuery.data?.info?.status === ResponseStatus.Success
      ? tratamentoQuery.data.info.data
      : null

  const orgQuery = useQuery({
    queryKey: ['trat-ficha', 'org', debouncedOrg],
    queryFn: () => OrganismoService(listPermId).getOrganismoLight(debouncedOrg),
    enabled: canView && canChange,
  })

  const medicosQuery = useQuery({
    queryKey: ['trat-ficha', 'medicos', debouncedMed],
    queryFn: () => MedicosService(listPermId).getMedicosLight(debouncedMed),
    enabled: canView && canChange,
  })

  const locaisQuery = useQuery({
    queryKey: ['trat-ficha', 'locais', debouncedLocal],
    queryFn: () =>
      LocalTratamentoService(listPermId).getLocaisTratamentoLight(
        debouncedLocal || undefined
      ),
    enabled: canView && canChange,
  })

  const fisiosQuery = useQuery({
    queryKey: ['trat-ficha', 'fisios', debouncedFisio],
    queryFn: () =>
      loadTecnicosByTipo(TIPO_TECNICO.Fisioterapeuta, debouncedFisio),
    enabled: canView && canChange,
  })

  const auxQuery = useQuery({
    queryKey: ['trat-ficha', 'aux', debouncedAux],
    queryFn: () => loadTecnicosByTipo(TIPO_TECNICO.Auxiliar, debouncedAux),
    enabled: canView && canChange,
  })

  const outroQuery = useQuery({
    queryKey: ['trat-ficha', 'outro', debouncedOutro],
    queryFn: () => loadTecnicosByTipo(TIPO_TECNICO.Outro, debouncedOutro),
    enabled: canView && canChange,
  })

  const sessoes = useMemo(() => {
    const raw =
      sessoesQuery.data?.info?.status === ResponseStatus.Success
        ? (sessoesQuery.data.info.data ?? [])
        : []
    return [...raw].sort((a, b) => (a.numSessao ?? 0) - (b.numSessao ?? 0))
  }, [sessoesQuery.data])

  useEffect(() => {
    if (dto) setForm(dtoToTratamentoFichaForm(dto))
  }, [dto])

  // Hidratar labels dos FKs já gravados
  useEffect(() => {
    if (!dto) return
    let cancelled = false

    const run = async () => {
      const patchLabels: Partial<TratamentoFichaFormValues> = {}

      if (dto.utenteId) {
        try {
          const res = await UtentesService(listPermId).getUtente(dto.utenteId)
          const u = res.info?.data
          if (u) {
            patchLabels.utenteLabel = [u.numeroUtente, u.nome]
              .filter(Boolean)
              .join(' — ')
          }
        } catch {
          /* ignore */
        }
      }

      if (dto.organismoId) {
        try {
          const res = await OrganismoService(listPermId).getOrganismo(
            dto.organismoId
          )
          if (res.info?.data?.nome) {
            patchLabels.organismoLabel = res.info.data.nome
          }
        } catch {
          /* ignore */
        }
      }

      if (dto.medicoId) {
        try {
          const res = await MedicosService(listPermId).getMedico(dto.medicoId)
          if (res.info?.data?.nome) {
            patchLabels.medicoLabel = res.info.data.nome
          }
        } catch {
          /* ignore */
        }
      }

      if (dto.localTratamentoId) {
        try {
          const res =
            await LocalTratamentoService(listPermId).getLocaisTratamentoLight()
          const hit = (res.info?.data ?? []).find(
            (l) => l.id === dto.localTratamentoId
          )
          if (hit?.designacao) {
            patchLabels.localTratamentoLabel = hit.designacao
          }
        } catch {
          /* ignore */
        }
      }

      const loadTecnicoLabel = async (tecnicoId: string) => {
        const res = await TecnicoService(listPermId).getTecnico(tecnicoId)
        return res.info?.data?.nome ?? ''
      }

      try {
        if (dto.fisioterapeutaId) {
          patchLabels.fisioterapeutaLabel = await loadTecnicoLabel(
            dto.fisioterapeutaId
          )
        }
        if (dto.auxiliarId) {
          patchLabels.auxiliarLabel = await loadTecnicoLabel(dto.auxiliarId)
        }
        if (dto.outroTecnicoId) {
          patchLabels.outroTecnicoLabel = await loadTecnicoLabel(
            dto.outroTecnicoId
          )
        }
      } catch {
        /* ignore */
      }

      if (!cancelled && Object.keys(patchLabels).length > 0) {
        setForm((prev) => ({ ...prev, ...patchLabels }))
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [dto])

  const orgItems = useMemo(() => {
    const list = orgQuery.data?.info?.data ?? []
    const mapped = list.map((o) => ({ value: o.id, label: o.nome }))
    return withSelected(mapped, form.organismoId, form.organismoLabel)
  }, [orgQuery.data, form.organismoId, form.organismoLabel])

  const medicoItems = useMemo(() => {
    const list = (medicosQuery.data?.info?.data ?? []) as Array<{
      id: string
      nome: string
    }>
    const mapped = list.map((m) => ({ value: m.id, label: m.nome }))
    return withSelected(mapped, form.medicoId, form.medicoLabel)
  }, [medicosQuery.data, form.medicoId, form.medicoLabel])

  const localItems = useMemo(() => {
    const list = locaisQuery.data?.info?.data ?? []
    const mapped = list.map((l) => ({
      value: l.id,
      label: l.designacao ?? '',
    }))
    return withSelected(mapped, form.localTratamentoId, form.localTratamentoLabel)
  }, [locaisQuery.data, form.localTratamentoId, form.localTratamentoLabel])

  const fisioItems = useMemo(() => {
    const list = fisiosQuery.data ?? []
    const mapped = list.map((t: { id: string; nome?: string | null }) => ({
      value: t.id,
      label: t.nome ?? t.id,
    }))
    return withSelected(
      mapped,
      form.fisioterapeutaId,
      form.fisioterapeutaLabel
    )
  }, [fisiosQuery.data, form.fisioterapeutaId, form.fisioterapeutaLabel])

  const auxItems = useMemo(() => {
    const list = auxQuery.data ?? []
    const mapped = list.map((t: { id: string; nome?: string | null }) => ({
      value: t.id,
      label: t.nome ?? t.id,
    }))
    return withSelected(mapped, form.auxiliarId, form.auxiliarLabel)
  }, [auxQuery.data, form.auxiliarId, form.auxiliarLabel])

  const outroItems = useMemo(() => {
    const list = outroQuery.data ?? []
    const mapped = list.map((t: { id: string; nome?: string | null }) => ({
      value: t.id,
      label: t.nome ?? t.id,
    }))
    return withSelected(mapped, form.outroTecnicoId, form.outroTecnicoLabel)
  }, [outroQuery.data, form.outroTecnicoId, form.outroTecnicoLabel])

  const apiMsg = Object.values(tratamentoQuery.data?.info?.messages ?? {})
    .flat()
    .find(Boolean)
  const errorMessage =
    tratamentoQuery.error instanceof Error
      ? tratamentoQuery.error.message
      : tratamentoQuery.error
        ? String(tratamentoQuery.error)
        : ''

  const handleBack = () => {
    closeLikeTabBar()
    navigate('/area-administrativa/tratamentos/tratamentos-marcados')
  }

  const handleRefresh = () => {
    if (id) invalidate(id)
  }

  const patch = <K extends keyof TratamentoFichaFormValues>(
    key: K,
    value: TratamentoFichaFormValues[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!id || !dto || !canChange) return
    if (!form.organismoId.trim()) {
      toast.error('Certifique-se que o organismo está preenchido')
      setActiveTab('dados')
      return
    }
    setIsSaving(true)
    try {
      const payload = buildUpdateTratamentoPayload(dto, form)
      const res = await TratamentoService(listPermId).update(id, payload)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Tratamento guardado.')
        invalidate(id)
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível guardar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao guardar.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!canView) {
    return (
      <DashboardPageContainer>
        <Alert variant='destructive'>
          <AlertTitle>Sem permissão</AlertTitle>
          <AlertDescription>
            Não tem permissão para ver este tratamento.
          </AlertDescription>
        </Alert>
      </DashboardPageContainer>
    )
  }

  const title =
    form.designacao.trim() ||
    dto?.nomePatologia?.trim() ||
    'Ficha de Tratamento'

  const loadFailed =
    tratamentoQuery.isError || (!tratamentoQuery.isLoading && !dto)

  return (
    <>
      <PageHead title='Ficha de Tratamento | CliCloud' />
      <DashboardPageContainer>
        <AreaComumDashboardCard
          omitHeader
          contentClassName='px-4 pb-5 pt-3 sm:px-5'
        >
          <EntityFormPageHeader
            title={title}
            onBack={handleBack}
            onRefresh={handleRefresh}
            rightActions={
              canChange ? (
                <Button
                  type='button'
                  size='sm'
                  className='gap-2'
                  disabled={isSaving || !dto}
                  onClick={() => void handleSave()}
                >
                  <Save className='h-4 w-4' />
                  {isSaving ? 'A guardar…' : 'Guardar'}
                </Button>
              ) : null
            }
          />

          {loadFailed ? (
            <Alert variant='destructive'>
              <AlertTitle>Falha ao carregar ficha</AlertTitle>
              <AlertDescription>
                {apiMsg || errorMessage || 'Tratamento não encontrado.'}
              </AlertDescription>
            </Alert>
          ) : null}

          {tratamentoQuery.isLoading && !dto ? (
            <p className='text-sm text-muted-foreground'>A carregar…</p>
          ) : null}

          {dto ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value='dados'>Dados</TabsTrigger>
                <TabsTrigger value='sessoes'>Sessões</TabsTrigger>
              </TabsList>

              <TabsContent value='dados' className='mt-4 space-y-6'>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <Field label='Utente'>
                    <Input value={form.utenteLabel || '—'} disabled />
                  </Field>
                  <Field label='Organismo *'>
                    <AsyncCombobox
                      value={form.organismoId}
                      disabled={!canChange}
                      onChange={(v) => {
                        const label =
                          orgItems.find((i) => i.value === v)?.label ?? ''
                        setForm((prev) => ({
                          ...prev,
                          organismoId: v,
                          organismoLabel: label,
                        }))
                      }}
                      searchValue={orgSearch}
                      onSearchValueChange={setOrgSearch}
                      items={orgItems}
                      isLoading={orgQuery.isFetching}
                      placeholder='Seleccionar organismo…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </Field>
                  <Field label='Local de tratamento'>
                    <AsyncCombobox
                      value={form.localTratamentoId}
                      disabled={!canChange}
                      onChange={(v) => {
                        const label =
                          localItems.find((i) => i.value === v)?.label ?? ''
                        setForm((prev) => ({
                          ...prev,
                          localTratamentoId: v,
                          localTratamentoLabel: label,
                        }))
                      }}
                      searchValue={localSearch}
                      onSearchValueChange={setLocalSearch}
                      items={localItems}
                      isLoading={locaisQuery.isFetching}
                      placeholder='Seleccionar local…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </Field>
                  <Field label='Médico'>
                    <AsyncCombobox
                      value={form.medicoId}
                      disabled={!canChange}
                      onChange={(v) => {
                        const label =
                          medicoItems.find((i) => i.value === v)?.label ?? ''
                        setForm((prev) => ({
                          ...prev,
                          medicoId: v,
                          medicoLabel: label,
                        }))
                      }}
                      searchValue={medSearch}
                      onSearchValueChange={setMedSearch}
                      items={medicoItems}
                      isLoading={medicosQuery.isFetching}
                      placeholder='Seleccionar médico…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </Field>
                  <Field label='Fisioterapeuta'>
                    <AsyncCombobox
                      value={form.fisioterapeutaId}
                      disabled={!canChange}
                      onChange={(v) => {
                        const label =
                          fisioItems.find((i) => i.value === v)?.label ?? ''
                        setForm((prev) => ({
                          ...prev,
                          fisioterapeutaId: v,
                          fisioterapeutaLabel: label,
                        }))
                      }}
                      searchValue={fisioSearch}
                      onSearchValueChange={setFisioSearch}
                      items={fisioItems}
                      isLoading={fisiosQuery.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </Field>
                  <Field label='Auxiliar'>
                    <AsyncCombobox
                      value={form.auxiliarId}
                      disabled={!canChange}
                      onChange={(v) => {
                        const label =
                          auxItems.find((i) => i.value === v)?.label ?? ''
                        setForm((prev) => ({
                          ...prev,
                          auxiliarId: v,
                          auxiliarLabel: label,
                        }))
                      }}
                      searchValue={auxSearch}
                      onSearchValueChange={setAuxSearch}
                      items={auxItems}
                      isLoading={auxQuery.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </Field>
                  <Field label='Terapeuta Ocup./Fala'>
                    <AsyncCombobox
                      value={form.outroTecnicoId}
                      disabled={!canChange}
                      onChange={(v) => {
                        const label =
                          outroItems.find((i) => i.value === v)?.label ?? ''
                        setForm((prev) => ({
                          ...prev,
                          outroTecnicoId: v,
                          outroTecnicoLabel: label,
                        }))
                      }}
                      searchValue={outroSearch}
                      onSearchValueChange={setOutroSearch}
                      items={outroItems}
                      isLoading={outroQuery.isFetching}
                      placeholder='Seleccionar…'
                      searchPlaceholder='Pesquisar…'
                      emptyText='Sem resultados'
                    />
                  </Field>
                  <Field label='Designação'>
                    <Input
                      value={form.designacao}
                      disabled={!canChange}
                      onChange={(e) => patch('designacao', e.target.value)}
                    />
                  </Field>
                  <Field label='Patologia'>
                    <Input
                      value={form.nomePatologia}
                      disabled={!canChange}
                      onChange={(e) => patch('nomePatologia', e.target.value)}
                    />
                  </Field>
                  <Field label='N.º sessões'>
                    <Input
                      type='number'
                      value={form.numSessao}
                      disabled={!canChange}
                      onChange={(e) => patch('numSessao', e.target.value)}
                    />
                  </Field>
                  <Field label='Data início'>
                    <Input
                      type='date'
                      value={form.dataInic}
                      disabled={!canChange}
                      onChange={(e) => patch('dataInic', e.target.value)}
                    />
                  </Field>
                  <Field label='Data fim'>
                    <Input
                      type='date'
                      value={form.dataFim}
                      disabled={!canChange}
                      onChange={(e) => patch('dataFim', e.target.value)}
                    />
                  </Field>
                  <Field label='Data'>
                    <Input
                      type='date'
                      value={form.data}
                      disabled={!canChange}
                      onChange={(e) => patch('data', e.target.value)}
                    />
                  </Field>
                  <Field label='N.º benefício'>
                    <Input
                      value={form.numBenif}
                      disabled={!canChange}
                      onChange={(e) => patch('numBenif', e.target.value)}
                    />
                  </Field>
                  <Field label='Apólice'>
                    <Input
                      value={form.apolice}
                      disabled={!canChange}
                      onChange={(e) => patch('apolice', e.target.value)}
                    />
                  </Field>
                  <Field label='Credencial'>
                    <Input
                      value={form.credencial}
                      disabled={!canChange}
                      onChange={(e) => patch('credencial', e.target.value)}
                    />
                  </Field>
                  <Field label='Faltas máx.'>
                    <Input
                      type='number'
                      value={form.nFaltMax}
                      disabled={!canChange}
                      onChange={(e) => patch('nFaltMax', e.target.value)}
                    />
                  </Field>
                  <Field label='Faltas consec. máx.'>
                    <Input
                      type='number'
                      value={form.nFaltComax}
                      disabled={!canChange}
                      onChange={(e) => patch('nFaltComax', e.target.value)}
                    />
                  </Field>
                  <Field label='Faltas (actual)'>
                    <Input value={form.nFalta} disabled />
                  </Field>
                  <Field label='Faltas consec. (actual)'>
                    <Input value={form.nFaltaCons} disabled />
                  </Field>
                  <Field label='Data suspensão'>
                    <Input
                      type='date'
                      value={form.dataSuspensao}
                      disabled={!canChange}
                      onChange={(e) => patch('dataSuspensao', e.target.value)}
                    />
                  </Field>
                </div>

                <div className='flex flex-wrap gap-6'>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={form.suspenso}
                      disabled={!canChange}
                      onCheckedChange={(v) => patch('suspenso', v === true)}
                    />
                    Suspenso
                  </label>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={form.provisorio}
                      disabled={!canChange}
                      onCheckedChange={(v) => patch('provisorio', v === true)}
                    />
                    Provisório
                  </label>
                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={form.terapiaFala}
                      disabled={!canChange}
                      onCheckedChange={(v) => patch('terapiaFala', v === true)}
                    />
                    Terapia da fala
                  </label>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <Field label='Observações'>
                    <Textarea
                      value={form.obs}
                      disabled={!canChange}
                      rows={4}
                      onChange={(e) => patch('obs', e.target.value)}
                    />
                  </Field>
                  <Field label='Obs. técnicas'>
                    <Textarea
                      value={form.tecObs}
                      disabled={!canChange}
                      rows={4}
                      onChange={(e) => patch('tecObs', e.target.value)}
                    />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value='sessoes' className='mt-4'>
                <DataTable
                  columns={sessoesColumns}
                  data={sessoes}
                  isLoading={sessoesQuery.isLoading}
                  pageCount={1}
                  totalRows={sessoes.length}
                  initialPage={1}
                  initialPageSize={50}
                  FilterControls={EmptyFilterControls}
                  hideToolbarFilters
                  onPaginationChange={() => undefined}
                  onFiltersChange={() => undefined}
                  onSortingChange={() => undefined}
                />
              </TabsContent>
            </Tabs>
          ) : null}
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
