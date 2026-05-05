import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { useGetUtente, useUtentesLight } from '@/pages/utentes/queries/utentes-queries'
import { usePageData } from '@/utils/page-data-utils'
import { getCurrentWindowId } from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useGetConsultasEfetuadasPaginated, usePrefetchAdjacentConsultasEfetuadas } from '@/pages/area-clinica/processo-clinico/historico/queries/consultas-efetuadas-queries'
import {
  useGetHistoriasClinicasPaginated,
  usePrefetchAdjacentHistoriasClinicas,
} from '@/pages/area-clinica/processo-clinico/tabelas/historia-clinica/queries/historia-clinica-queries'
import type { ConsultaTableDTO } from '@/types/dtos/saude/consultas.dtos'
import type { HistoriaClinicaTableDTO } from '@/types/dtos/saude/historia-clinica.dtos'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { ResponseStatus } from '@/types/api/responses'
import { buildConsultaFilters } from '../ficha-clinica/utils/utils'
import { ConsultasDiaSection } from '../ficha-clinica/components/ConsultasDiaSection'
import { DadosUtenteSection } from '../ficha-clinica/components/DadosUtenteSection'
import { AntecedentesTab } from '../ficha-clinica/tabs/AntecedentesTab'
import { SinaisVitaisTab } from '../ficha-clinica/tabs/SinaisVitaisTab'
import { HistoriaClinicaTab } from '../ficha-clinica/tabs/HistoriaClinicaTab'
import { TratamentosTab } from '../ficha-clinica/tabs/TratamentosTab'
import { PrescricaoExamesTab } from '../ficha-clinica/tabs/PrescricaoExamesTab'
import { MedicacaoTab } from '../ficha-clinica/tabs/MedicacaoTab'
import { RelatorioAtestadoTab } from '../ficha-clinica/tabs/RelatorioAtestadoTab'
import { DentariaTab } from '../ficha-clinica/tabs/DentariaTab'
import { DocumentosTab } from '../ficha-clinica/tabs/DocumentosTab'
import { MedicinaDesportivaTab } from '../ficha-clinica/tabs/MedicinaDesportivaTab'
import { NutricaoTab } from '../ficha-clinica/tabs/NutricaoTab'
import { PsicologiaTab } from '../ficha-clinica/tabs/PsicologiaTab'
import { FisioterapeutaTab } from '../ficha-clinica/tabs/FisioterapeutaTab'
import { FisiologiaBiomecanicaTab } from '../ficha-clinica/tabs/FisiologiaBiomecanicaTab'
import { TerapiaFalaTab } from '../ficha-clinica/tabs/TerapiaFalaTab'
import { AlergiasUtenteObsService } from '@/lib/services/alergias/alergias-utente-obs-service'
import { ConsultaService } from '@/lib/services/consultas/consulta-service'
import { ConsultaServicosModal } from '../ficha-clinica/modals/ConsultaServicosModal'
import { UtenteModal } from '../ficha-clinica/modals/UtenteModal'
import { SeparadorDinamicoTab } from '../ficha-clinica/tabs/SeparadorDinamicoTab'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { SeparadoresGestaoService } from '@/lib/services/processo-clinico/separadores-gestao-service'
import type { SeparadorFichaClinicaDTO } from '@/types/dtos/processo-clinico/separadores-gestao.dtos'

type FichaClinicaLocationState = { utenteId?: string; consultaId?: string } | null

export function FichaClinicaPage() {
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const updateWindowState = useWindowsStore((s) => s.updateWindowState)
  const stateFromNav = (location.state as FichaClinicaLocationState) ?? null

  const utenteIdFromState = stateFromNav?.utenteId
  const consultaIdFromState = stateFromNav?.consultaId
  const utenteIdFromQuery = searchParams.get('utenteId') ?? ''
  const consultaIdFromQuery = searchParams.get('consultaId') ?? undefined
  const id = (utenteIdFromState ?? utenteIdFromQuery)?.trim() ?? ''
  const consultaId = consultaIdFromState ?? consultaIdFromQuery

  const hasInitialUtente = !!id
  const [utenteId, setUtenteId] = useState<string>(id)
  const [utenteSearch, setUtenteSearch] = useState<string>('')
  const [utenteModalOpen, setUtenteModalOpen] = useState<boolean>(!hasInitialUtente)
  const [consultaServicosModalOpen, setConsultaServicosModalOpen] = useState(false)
  const [consultaSelecionada, setConsultaSelecionada] = useState<ConsultaTableDTO | null>(null)

  useEffect(() => {
    if (id) {
      setUtenteId(id)
      if (consultaId) {
        queryClient.invalidateQueries({ queryKey: ['consultas-efetuadas-paginated'] })
      }
    } else {
      setUtenteId('')
      setUtenteModalOpen(true)
    }
  }, [id, consultaId, queryClient])

  const abrirDadosUtenteDefault =
    typeof localStorage !== 'undefined' ? localStorage.getItem('ficha-clinica-abrir-dados-utente') !== 'false' : false
  const [openDadosUtente, setOpenDadosUtente] = useState<boolean>(abrirDadosUtenteDefault)
  const [abrirDadosUtenteAoCarregar, setAbrirDadosUtenteAoCarregar] = useState<boolean>(abrirDadosUtenteDefault)

  const abrirConsultasDefault =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('ficha-clinica-abrir-consultas') !== 'false'
      : true
  const [openHistoricoConsultas, setOpenHistoricoConsultas] = useState<boolean>(abrirConsultasDefault)
  const [abrirConsultasAoCarregar, setAbrirConsultasAoCarregar] = useState<boolean>(abrirConsultasDefault)

  const { data: medicoAtualData } = useQuery({
    queryKey: ['medico-atual', 'ficha-clinica'],
    queryFn: async () => {
      const client = MedicosService('processo-clinico')
      const res = await client.getCurrentMedico()
      return res
    },
    staleTime: 5 * 60 * 1000,
  })

  const medicoAtual = (medicoAtualData?.info?.data ?? null) as { id?: string | null; especialidadeId?: string | null } | null
  const medicoAtualId = medicoAtual?.id ?? null
  const especialidadeAtualId = medicoAtual?.especialidadeId ?? null

  const { data: separadoresFichaData } = useQuery({
    queryKey: ['separadores-ficha-clinica-visiveis', medicoAtualId, especialidadeAtualId],
    queryFn: async () => {
      const client = SeparadoresGestaoService()
      const res = await client.getSeparadoresFichaClinicaVisiveis(medicoAtualId, especialidadeAtualId)
      const api = res as unknown as { info?: { data?: SeparadorFichaClinicaDTO[] } }
      return (api.info?.data ?? []) as SeparadorFichaClinicaDTO[]
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const visibleBaseList = useMemo(
    () =>
      (separadoresFichaData ?? [])
        .filter((s) => s.origem === 'Base' && !!s.codigo)
        .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)),
    [separadoresFichaData],
  )

  const visiblePersonalizadoList = useMemo(
    () =>
      (separadoresFichaData ?? [])
        .filter((s) => s.origem === 'Personalizado' && !!s.formularioId)
        .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)),
    [separadoresFichaData],
  )

  const [utenteSearchD] = useDebounce(utenteSearch, 250)
  const utentesLight = useUtentesLight(utenteSearchD)
  const utenteDetalhe = useGetUtente(utenteId)

  const utenteItems =
    (utentesLight.data?.info?.data ?? []).map(
      (u: { id: string; nome: string; numeroUtente?: string | null }) => ({
        value: u.id,
        label: u.nome,
        secondary: u.numeroUtente ? `Nº Utente: ${u.numeroUtente}` : undefined,
      })
    ) ?? []

  const utente = utenteDetalhe.data?.info?.data as UtenteDTO | undefined

  const { data: alergiasObsData } = useQuery({
    queryKey: ['alergias-utente-obs', utenteId],
    queryFn: () =>
      utenteId
        ? AlergiasUtenteObsService('ficha-clinica').getByUtenteId(utenteId)
        : Promise.resolve({ info: { data: null } } as any),
    enabled: !!utenteId,
    staleTime: 5 * 60 * 1000,
  })

  const informacaoImportante =
    (alergiasObsData?.info?.data as { informacaoImportante?: string | null } | null)
      ?.informacaoImportante ?? null

  const handleAbrirDadosUtenteAoCarregarChange = (checked: boolean) => {
    setAbrirDadosUtenteAoCarregar(checked)
    setOpenDadosUtente(checked)
    try {
      localStorage.setItem('ficha-clinica-abrir-dados-utente', String(checked))
    } catch {
      // ignore
    }
  }

  const {
    data: consultasData,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    handleFiltersChange,
    handlePaginationChange,
  } = usePageData({
    useGetDataPaginated: useGetConsultasEfetuadasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentConsultasEfetuadas,
  })

  useEffect(() => {
    handleFiltersChange(buildConsultaFilters(utenteId, null))
  }, [utenteId])

  const hoje = new Date()
  const filtersHoje = buildConsultaFilters(utenteId, hoje)
  const {
    data: consultasHojeData,
    isLoading: isLoadingHoje,
    isError: isErrorHoje,
    error: errorHoje,
  } = useGetConsultasEfetuadasPaginated(1, 100, filtersHoje, [])
  const consultasHoje = (consultasHojeData?.info?.data ?? []) as ConsultaTableDTO[]
  const errorHojeMessage =
    errorHoje instanceof Error ? errorHoje.message : errorHoje ? String(errorHoje) : ''

  const consultas = (consultasData?.info?.data ?? []) as ConsultaTableDTO[]
  const pageCount = consultasData?.info?.totalPages ?? 0
  const totalRows = consultasData?.info?.totalCount ?? 0
  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

  const refreshConsultas = () => {
    queryClient.invalidateQueries({ queryKey: ['consultas-efetuadas-paginated'] })
  }

  const finalizarConsultaMutation = useMutation({
    mutationFn: async (consulta: ConsultaTableDTO) => {
      return ConsultaService().finalizarConsulta(consulta.id)
    },
    onSuccess: (res) => {
      const status = res.info?.status
      if (status === ResponseStatus.Success) {
        toast({
          title: 'Consulta terminada',
          description: 'A consulta foi marcada como concluída.',
        })
        refreshConsultas()
      } else {
        const msg =
          res.info?.messages?.$ && res.info.messages.$.length > 0
            ? res.info.messages.$[0]
            : 'Não foi possível terminar a consulta.'
        toast({
          title: 'Erro ao terminar consulta',
          description: msg,
          variant: 'destructive',
        })
      }
    },
    onError: (err) => {
      toast({
        title: 'Erro ao terminar consulta',
        description: err instanceof Error ? err.message : 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })

  const handleAbrirConsultasAoCarregarChange = (checked: boolean) => {
    setAbrirConsultasAoCarregar(checked)
    setOpenHistoricoConsultas(checked)
    try {
      localStorage.setItem('ficha-clinica-abrir-consultas', String(checked))
    } catch {
      // ignore
    }
  }

  const handleConfirmUtente = () => {
    if (!utenteId) return
    setUtenteModalOpen(false)
    const instanceId = searchParams.get('instanceId') ?? ''
    const params = new URLSearchParams()
    params.set('utenteId', utenteId)
    if (instanceId) params.set('instanceId', instanceId)
    if (consultaId) params.set('consultaId', consultaId)
    navigate(`${location.pathname}?${params.toString()}`, { replace: true })
    const windowId = getCurrentWindowId()
    if (windowId) {
      const searchParamsObj: Record<string, string> = { utenteId }
      if (instanceId) searchParamsObj.instanceId = instanceId
      if (consultaId) searchParamsObj.consultaId = consultaId
      updateWindowState(windowId, { searchParams: searchParamsObj })
    }
  }

  const {
    data: historiaData,
    isLoading: isLoadingHistoria,
    isError: isErrorHistoria,
    error: errorHistoria,
    page: pageHistoria,
    pageSize: pageSizeHistoria,
    handleFiltersChange: handleHistoriaFiltersChange,
    handlePaginationChange: handleHistoriaPaginationChange,
  } = usePageData({
    useGetDataPaginated: useGetHistoriasClinicasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentHistoriasClinicas,
  })

  useEffect(() => {
    if (!utenteId) {
      handleHistoriaFiltersChange([])
      return
    }
    handleHistoriaFiltersChange([{ id: 'utenteId', value: utenteId }])
  }, [utenteId])

  const historiasRaw = (historiaData?.info?.data ?? []) as HistoriaClinicaTableDTO[]
  const historias = utenteId ? historiasRaw : []
  const pageCountHistoria = utenteId ? (historiaData?.info?.totalPages ?? 0) : 0
  const totalRowsHistoria = utenteId ? (historiaData?.info?.totalCount ?? 0) : 0
  const errorHistoriaMessage =
    errorHistoria instanceof Error
      ? errorHistoria.message
      : errorHistoria
        ? String(errorHistoria)
        : ''

  const [activeMainTab, setActiveMainTab] = useState<string>('antecedentes')

  const baseTabRenderers: Record<string, { render: () => ReactElement }> = {
    antecedentes: {
      render: () => <AntecedentesTab utenteId={utenteId} />,
    },
    sinaisvitais: {
      render: () => <SinaisVitaisTab utenteId={utenteId} utenteNome={utente?.nome} />,
    },
    historiaclinica: {
      render: () => (
        <HistoriaClinicaTab
          utenteId={utenteId}
          historias={historias}
          isLoading={isLoadingHistoria}
          isError={isErrorHistoria}
          errorMessage={errorHistoriaMessage}
          page={pageHistoria}
          pageCount={pageCountHistoria}
          pageSize={pageSizeHistoria}
          totalRows={totalRowsHistoria}
          onPaginationChange={handleHistoriaPaginationChange}
          isActive={activeMainTab === 'historiaclinica'}
        />
      ),
    },
    tratamentos: {
      render: () => (
        <TratamentosTab utenteId={utenteId} isActive={activeMainTab === 'tratamentos'} />
      ),
    },
    exames: {
      render: () => <PrescricaoExamesTab utenteId={utenteId} />,
    },
    dentaria: {
      render: () => <DentariaTab utenteId={utenteId} />,
    },
    relatorioatestado: {
      render: () => <RelatorioAtestadoTab utenteId={utenteId} />,
    },
    medicacao: {
      render: () => <MedicacaoTab />,
    },
    documentos: {
      render: () => <DocumentosTab utenteId={utenteId} />,
    },
    medicinadesp: {
      render: () => <MedicinaDesportivaTab utenteId={utenteId} />,
    },
    nutricao: {
      render: () => <NutricaoTab utenteId={utenteId} />,
    },
    psicologia: {
      render: () => <PsicologiaTab utenteId={utenteId} />,
    },
    fisioterapia: {
      render: () => <FisioterapeutaTab utenteId={utenteId} />,
    },
    fisiologiabiomecanica: {
      render: () => <FisiologiaBiomecanicaTab utenteId={utenteId} />,
    },
    terapiadafala: {
      render: () => <TerapiaFalaTab utenteId={utenteId} />,
    },
  }

  const allVisibleTabValues = useMemo(() => {
    const vals: string[] = []
    for (const sep of visibleBaseList) {
      if (baseTabRenderers[sep.codigo]) vals.push(sep.codigo)
    }
    for (const sep of visiblePersonalizadoList) {
      vals.push(`sep-${sep.separadorId}`)
    }
    return vals
  }, [visibleBaseList, visiblePersonalizadoList])

  useEffect(() => {
    if (allVisibleTabValues.length === 0) return
    if (!allVisibleTabValues.includes(activeMainTab)) {
      setActiveMainTab(allVisibleTabValues[0])
    }
  }, [allVisibleTabValues, activeMainTab])

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col gap-4'>
          <DadosUtenteSection
            utente={utente}
            open={openDadosUtente}
            onOpenChange={setOpenDadosUtente}
            abrirAoCarregar={abrirDadosUtenteAoCarregar}
            onAbrirAoCarregarChange={handleAbrirDadosUtenteAoCarregarChange}
            onEscolherUtente={() => setUtenteModalOpen(true)}
            informacaoImportante={informacaoImportante}
          />

          <div className='rounded-lg border bg-card px-4 py-4'>
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
              <div className='grid grid-cols-[180px_minmax(0,1fr)] gap-3'>
                <TabsList className='flex flex-col w-[150px] gap-px bg-transparent border-none p-0 shadow-none'>
                  {visibleBaseList.map((sep) => {
                    if (!baseTabRenderers[sep.codigo]) return null
                    return (
                      <TabsTrigger
                        key={sep.codigo}
                        value={sep.codigo}
                        className='tabs-pill justify-start w-full px-1.5 py-0'
                      >
                        {sep.nome}
                      </TabsTrigger>
                    )
                  })}
                  {visiblePersonalizadoList.map((tpl) => (
                    <TabsTrigger
                      key={`sep-${tpl.separadorId}`}
                      value={`sep-${tpl.separadorId}`}
                      className='tabs-pill justify-start w-full px-1.5 py-0'
                    >
                      {tpl.nome}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className='flex flex-col gap-4 max-h-[650px] overflow-auto'>
                  <ConsultasDiaSection
                    utenteId={utenteId}
                    consultasDia={consultasHoje}
                    isLoadingDia={isLoadingHoje}
                    isErrorDia={isErrorHoje}
                    errorMessageDia={errorHojeMessage}
                    consultasHistorico={consultas}
                    isLoadingHistorico={isLoading}
                    isErrorHistorico={isError}
                    errorMessageHistorico={errorMessage}
                    page={page}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalRows={totalRows}
                    onPaginationChange={handlePaginationChange}
                    onRefresh={refreshConsultas}
                    onVerConsulta={(consulta) => {
                      setConsultaSelecionada(consulta)
                      setConsultaServicosModalOpen(true)
                    }}
                    onFinalizarConsulta={(consulta) => finalizarConsultaMutation.mutate(consulta)}
                    abrirHistorico={openHistoricoConsultas}
                    onAbrirHistoricoChange={setOpenHistoricoConsultas}
                    abrirAoCarregar={abrirConsultasAoCarregar}
                    onAbrirAoCarregarChange={handleAbrirConsultasAoCarregarChange}
                  />

                  {visibleBaseList.map((sep) => {
                    const entry = baseTabRenderers[sep.codigo]
                    if (!entry) return null
                    return (
                      <TabsContent key={sep.codigo} value={sep.codigo} className='mt-0'>
                        {entry.render()}
                      </TabsContent>
                    )
                  })}
                  {visiblePersonalizadoList.map((tpl) => (
                    <TabsContent key={`sep-${tpl.separadorId}`} value={`sep-${tpl.separadorId}`} className='mt-0'>
                      <SeparadorDinamicoTab separadorId={tpl.formularioId!} utenteId={utenteId} />
                    </TabsContent>
                  ))}
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </DashboardPageContainer>

      <UtenteModal
        open={utenteModalOpen}
        onOpenChange={setUtenteModalOpen}
        utenteId={utenteId}
        onUtenteIdChange={setUtenteId}
        utenteSearch={utenteSearch}
        onUtenteSearchChange={setUtenteSearch}
        utenteItems={utenteItems}
        isLoading={utentesLight.isLoading}
        onConfirm={handleConfirmUtente}
      />

      <ConsultaServicosModal
        open={consultaServicosModalOpen}
        onOpenChange={setConsultaServicosModalOpen}
        consulta={consultaSelecionada}
      />
    </>
  )
}
