import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { modules } from '@/config/modules'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { ListaEsperaTratamentoAdministrativoService } from '@/lib/services/tratamentos/lista-espera-tratamento-administrativo-service'
import { MarcacaoAutomaticaTratamentoService } from '@/lib/services/tratamentos/marcacao-automatica-tratamento-service/marcacao-automatica-tratamento-client'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import type { MarcacaoAutomaticaPreviewResponse } from '@/types/dtos/tratamentos/marcacao-automatica-tratamento.dtos'

const permId = modules.areaAdministrativa.permissions.consultas.id

async function loadTecnicos(tipo: number, keyword: string) {
  const res = await TecnicoService(permId).getTecnicosPaginated({
    pageNumber: 1,
    pageSize: 30,
    filters: [
      { id: 'tipoTecnico', value: String(tipo) },
      ...(keyword ? [{ id: 'nome', value: keyword }] : []),
    ],
  })
  return res.info?.data ?? []
}

function firstErrorMessage(messages?: Record<string, string[]> | null) {
  return Object.values(messages ?? {})
    .flat()
    .find(Boolean)
}

export function MarcacoesAutomaticasPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const listaEsperaId = params.get('listaEsperaId') ?? ''

  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10))
  const [numeroSessoes, setNumeroSessoes] = useState(10)
  const [intervaloDias, setIntervaloDias] = useState(1)
  const [provisorio, setProvisorio] = useState(false)

  const [fisioSearch, setFisioSearch] = useState('')
  const [auxSearch, setAuxSearch] = useState('')
  const [outroSearch, setOutroSearch] = useState('')

  const [fisioterapeutaId, setFisioterapeutaId] = useState('')
  const [auxiliarId, setAuxiliarId] = useState('')
  const [outroTecnicoId, setOutroTecnicoId] = useState('')
  const [unidadeTempoFisio, setUnidadeTempoFisio] = useState(1)
  const [unidadeTempoAux, setUnidadeTempoAux] = useState(1)
  const [unidadeTempoOutro, setUnidadeTempoOutro] = useState(1)

  const [preview, setPreview] = useState<MarcacaoAutomaticaPreviewResponse | null>(null)

  const leQuery = useQuery({
    queryKey: ['ma-le', listaEsperaId],
    enabled: !!listaEsperaId,
    queryFn: () =>
      ListaEsperaTratamentoAdministrativoService(permId).getById(listaEsperaId),
  })

  const fisioQ = useQuery({
    queryKey: ['ma-fisio', fisioSearch],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Fisioterapeuta, fisioSearch),
  })
  const auxQ = useQuery({
    queryKey: ['ma-aux', auxSearch],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Auxiliar, auxSearch),
  })
  const outroQ = useQuery({
    queryKey: ['ma-outro', outroSearch],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Outro, outroSearch),
  })

  const fisioItems = useMemo<ComboboxItem[]>(
    () => (fisioQ.data ?? []).map((x) => ({ value: x.id, label: x.nome ?? x.id })),
    [fisioQ.data]
  )
  const auxItems = useMemo<ComboboxItem[]>(
    () => (auxQ.data ?? []).map((x) => ({ value: x.id, label: x.nome ?? x.id })),
    [auxQ.data]
  )
  const outroItems = useMemo<ComboboxItem[]>(
    () => (outroQ.data ?? []).map((x) => ({ value: x.id, label: x.nome ?? x.id })),
    [outroQ.data]
  )

  const buildPayload = () => ({
    listaEsperaTratamentoId: listaEsperaId,
    dataInicio,
    numeroSessoes,
    intervaloDias,
    fisioterapeutaId: fisioterapeutaId || null,
    unidadeTempoFisio: fisioterapeutaId ? unidadeTempoFisio : null,
    auxiliarId: auxiliarId || null,
    unidadeTempoAux: auxiliarId ? unidadeTempoAux : null,
    outroTecnicoId: outroTecnicoId || null,
    unidadeTempoOutro: outroTecnicoId ? unidadeTempoOutro : null,
  })

  const ensureCanRun = () => {
    if (!listaEsperaId) {
      toast.error('Selecione um registo da lista de espera.')
      return false
    }
    if (!fisioterapeutaId && !auxiliarId && !outroTecnicoId) {
      toast.error('Selecione pelo menos um técnico.')
      return false
    }
    return true
  }

  const previewMutation = useMutation({
    mutationFn: () => MarcacaoAutomaticaTratamentoService(permId).preview(buildPayload()),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        setPreview(res.info.data)
        if (res.info.data.numeroSessoesGeradas < res.info.data.numeroSessoesPedido) {
          toast.error(
            `Apenas foram encontradas ${res.info.data.numeroSessoesGeradas} de ${res.info.data.numeroSessoesPedido} sessões.`
          )
        }
      } else {
        setPreview(null)
        toast.error(
          firstErrorMessage(res.info?.messages) ??
            'Não foi possível gerar pré-visualização.'
        )
      }
    },
    onError: () => {
      setPreview(null)
      toast.error('Erro ao gerar pré-visualização.')
    },
  })

  const confirmMutation = useMutation({
    mutationFn: () =>
      MarcacaoAutomaticaTratamentoService(permId).confirm({
        ...buildPayload(),
        provisorio,
      }),
    onSuccess: (res) => {
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        toast.success('Marcação automática confirmada.')
        navigate(`/area-administrativa/tratamentos/marcados/${res.info.data}`)
      } else {
        toast.error(
          firstErrorMessage(res.info?.messages) ?? 'Não foi possível confirmar marcação.'
        )
      }
    },
    onError: () => {
      toast.error('Erro ao confirmar marcação.')
    },
  })

  return (
    <>
      <PageHead title='Marcações Automáticas | Tratamentos' />
      <DashboardPageContainer>
        <AreaComumDashboardCard>
          <div className='space-y-4'>
            <h1 className='text-lg font-semibold'>Marcações Automáticas</h1>

            {!listaEsperaId ? (
              <p className='text-sm text-muted-foreground'>
                Abra esta página a partir da lista de espera (ação de marcação automática).
              </p>
            ) : null}

            <p className='text-sm text-muted-foreground'>
              Lista de espera:{' '}
              {(leQuery.data?.info?.data?.utenteNome ?? listaEsperaId) || '—'}
            </p>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='space-y-1.5'>
                <Label>Data início</Label>
                <Input
                  type='date'
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Nº sessões</Label>
                <Input
                  type='number'
                  min={1}
                  value={numeroSessoes}
                  onChange={(e) => setNumeroSessoes(Number(e.target.value || 1))}
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Intervalo (dias)</Label>
                <Input
                  type='number'
                  min={1}
                  value={intervaloDias}
                  onChange={(e) => setIntervaloDias(Number(e.target.value || 1))}
                />
              </div>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='space-y-2'>
                <Label>Fisioterapeuta</Label>
                <AsyncCombobox
                  value={fisioterapeutaId}
                  onChange={setFisioterapeutaId}
                  items={fisioItems}
                  searchValue={fisioSearch}
                  onSearchValueChange={setFisioSearch}
                  isLoading={fisioQ.isFetching}
                  placeholder='Selecionar...'
                  searchPlaceholder='Pesquisar...'
                  emptyText='Sem resultados'
                />
                <Input
                  type='number'
                  min={1}
                  value={unidadeTempoFisio}
                  onChange={(e) => setUnidadeTempoFisio(Number(e.target.value || 1))}
                />
              </div>

              <div className='space-y-2'>
                <Label>Auxiliar</Label>
                <AsyncCombobox
                  value={auxiliarId}
                  onChange={setAuxiliarId}
                  items={auxItems}
                  searchValue={auxSearch}
                  onSearchValueChange={setAuxSearch}
                  isLoading={auxQ.isFetching}
                  placeholder='Selecionar...'
                  searchPlaceholder='Pesquisar...'
                  emptyText='Sem resultados'
                />
                <Input
                  type='number'
                  min={1}
                  value={unidadeTempoAux}
                  onChange={(e) => setUnidadeTempoAux(Number(e.target.value || 1))}
                />
              </div>

              <div className='space-y-2'>
                <Label>Terapeuta Ocup./Fala</Label>
                <AsyncCombobox
                  value={outroTecnicoId}
                  onChange={setOutroTecnicoId}
                  items={outroItems}
                  searchValue={outroSearch}
                  onSearchValueChange={setOutroSearch}
                  isLoading={outroQ.isFetching}
                  placeholder='Selecionar...'
                  searchPlaceholder='Pesquisar...'
                  emptyText='Sem resultados'
                />
                <Input
                  type='number'
                  min={1}
                  value={unidadeTempoOutro}
                  onChange={(e) => setUnidadeTempoOutro(Number(e.target.value || 1))}
                />
              </div>
            </div>

            <label className='flex items-center gap-2 text-sm'>
              <Checkbox
                checked={provisorio}
                onCheckedChange={(v) => setProvisorio(v === true)}
              />
              Provisório
            </label>

            <div className='flex gap-2'>
              <Button
                type='button'
                onClick={() => {
                  if (!ensureCanRun()) return
                  previewMutation.mutate()
                }}
                disabled={previewMutation.isPending}
              >
                {previewMutation.isPending ? 'A gerar...' : 'Gerar Pré-visualização'}
              </Button>

              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  if (!ensureCanRun()) return
                  if (!preview) {
                    toast.error('Gere primeiro a pré-visualização.')
                    return
                  }
                  confirmMutation.mutate()
                }}
                disabled={!preview || confirmMutation.isPending}
              >
                {confirmMutation.isPending ? 'A confirmar...' : 'Confirmar Marcação'}
              </Button>
            </div>

            <div className='overflow-x-auto rounded border'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50 text-left'>
                  <tr>
                    <th className='p-2'>Sessão</th>
                    <th className='p-2'>Data</th>
                    <th className='p-2'>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {(preview?.sessoes ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className='p-3 text-muted-foreground'>
                        Sem sessões geradas.
                      </td>
                    </tr>
                  ) : (
                    preview!.sessoes.map((s) => (
                      <tr
                        key={`${s.numSessao}-${s.data}-${s.horaInic}`}
                        className='border-t'
                      >
                        <td className='p-2'>{s.numSessao}</td>
                        <td className='p-2'>
                          {new Date(s.data).toLocaleDateString('pt-PT')}
                        </td>
                        <td className='p-2'>{s.horaInic}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AreaComumDashboardCard>
      </DashboardPageContainer>
    </>
  )
}
