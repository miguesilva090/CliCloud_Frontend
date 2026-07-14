import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Archive, History, Layers, List, Plus, RotateCw, Tag, Wrench } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  applyFiltersIfChanged,
  buildFiltersWithValue,
  usePageData,
  type PageFilter,
} from '@/utils/page-data-utils'
import { useEntityListPermissionsFromMany } from '@/hooks/use-area-comum-entity-list-permissions'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import type { LoteDirectTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos'
import { ListagemLoteDirectTable } from '../components/listagem-lote-direct-table'
import { ListagemLoteDirectFilterControls } from '../components/listagem-lote-direct-filter-controls'
import { LoteDirectViewModal } from '../modals/lote-direct-view-modal'
import { LoteDirectFormModal } from '../modals/lote-direct-form-modal'
import { CorrigirLotesModal } from '../modals/corrigir-lotes-modal'
import { ListagensLoteDirectModal } from '../modals/listagens-lote-direct-modal'
import { PassarParaAtivoModal } from '../modals/passar-para-ativo-modal'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openLoteDirectCreationInApp } from '@/utils/window-utils'
import { relatorioEtiquetaCredencialP1 } from '../utils/credenciais-legado-relatorios'
import { usePassarLoteDirectParaHistorico } from '../queries/lote-direct-historico-mutations'
import {
  useGetLoteDirectPaginated,
  usePrefetchAdjacentLoteDirect,
  loteDirectPermissionIds,
  useLoteDirectFuncionalidadeId,
} from '../queries/listagem-lote-direct-queries'

export function ListagemLoteDirectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const urlIndiceLoteFilters = useMemo((): PageFilter[] | undefined => {
    const indiceLote = searchParams.get('indicelote')
    if (!indiceLote) return undefined
    return [{ id: 'indicelote', value: indiceLote }]
  }, [searchParams])
  const permId = useLoteDirectFuncionalidadeId()
  const { canView, canAdd, canChange, canDelete } = useEntityListPermissionsFromMany([
    ...loteDirectPermissionIds,
  ])
  const queryClient = useQueryClient()
  const passarHistoricoMutation = usePassarLoteDirectParaHistorico()
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create')
  const [corrigirLotesOpen, setCorrigirLotesOpen] = useState(false)
  const [listagensOpen, setListagensOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<LoteDirectTableDTO | null>(null)
  const [historicoAtivo, setHistoricoAtivo] = useState(false)
  const [historicoConfirmRow, setHistoricoConfirmRow] = useState<LoteDirectTableDTO | null>(null)
  const [ativoModalOpen, setAtivoModalOpen] = useState(false)
  const [ativoModalRow, setAtivoModalRow] = useState<LoteDirectTableDTO | null>(null)

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetLoteDirectPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentLoteDirect,
    defaultFilters: urlIndiceLoteFilters,
  })

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['lote-direct-paginated'] })

  const toggleHistorico = () => {
    setHistoricoAtivo((prev) => {
      const next = !prev
      applyFiltersIfChanged(
        filters,
        buildFiltersWithValue(filters, 'historico', next ? 'true' : 'false'),
        handleFiltersChange
      )
      return next
    })
  }

  const confirmPassarHistorico = async () => {
    if (!historicoConfirmRow?.id) return
    try {
      const response = await passarHistoricoMutation.mutateAsync({
        loteDirectId: historicoConfirmRow.id,
      })
      if (response.info.status === ResponseStatus.Success) {
        const n = response.info.data?.credenciaisActualizadas ?? 0
        toast.success(`${n} credencial(is) passaram para histórico.`)
        setHistoricoConfirmRow(null)
        refresh()
      } else {
        toast.error(response.info.messages?.['$']?.[0] ?? 'Não foi possível passar para histórico.')
      }
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Erro ao passar para histórico.')
    }
  }

  return (
    <>
      <PageHead title='Lançamento de Credenciais | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Lançamento de Credenciais'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar credenciais</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar a lista de credenciais.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemLoteDirectTable
            data={data?.info?.data ?? []}
            isLoading={isLoading}
            pageCount={data?.info?.totalPages ?? 0}
            totalRows={data?.info?.totalCount ?? 0}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            FilterControls={ListagemLoteDirectFilterControls}
            toolbarActions={[
              ...(!historicoAtivo && canView
                ? [
                    {
                      label: 'Lotes Agregados',
                      icon: <Layers className='h-4 w-4' />,
                      onClick: () =>
                        navigate('/area-administrativa/credenciais/agregados'),
                      variant: 'outline' as const,
                    },
                    {
                      label: 'Corrigir Lotes',
                      icon: <Wrench className='h-4 w-4' />,
                      onClick: () => setCorrigirLotesOpen(true),
                      variant: 'outline' as const,
                      className:
                        'border-amber-400 bg-amber-300 text-amber-950 hover:bg-amber-200',
                    },
                  ]
                : []),
              ...(!historicoAtivo && canAdd
                ? [
                    {
                      label: 'Adicionar',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: () => {
                        openLoteDirectCreationInApp(navigate, addWindow)
                      },
                      variant: 'destructive' as const,
                    },
                  ]
                : []),
              {
                label: 'Listagens',
                icon: <List className='h-4 w-4' />,
                onClick: () => setListagensOpen(true),
                variant: 'outline' as const,
              },
              {
                label: historicoAtivo ? 'Histórico x' : 'Histórico',
                icon: <Archive className='h-4 w-4' />,
                onClick: toggleHistorico,
                variant: historicoAtivo ? ('emerald' as const) : ('outline' as const),
              },
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
                variant: 'outline' as const,
              },
            ]}
            onOpenView={(row: LoteDirectTableDTO) => {
              setSelectedId(row.id)
              setViewModalOpen(true)
            }}
            onOpenEdit={
              canChange && !historicoAtivo
                ? (row: LoteDirectTableDTO) => {
                    setFormModalMode('edit')
                    setSelectedRow(row)
                    setSelectedId(row.id)
                    setFormModalOpen(true)
                  }
                : undefined
            }
            onOpenDelete={
              canDelete && !historicoAtivo
                ? async (row) => {
                    if (!row?.id) return
                    const response = await LoteDirectService(permId).delete(row.id)
                    if (response.info.status === ResponseStatus.Success) {
                      toast.success('Registo eliminado.')
                      refresh()
                    }
                  }
                : undefined
            }
            renderExtraActions={
              canChange
                ? (row) =>
                    historicoAtivo ? (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        title='Passar para ativo (novo mês/ano)'
                        onClick={() => {
                          setAtivoModalRow(row)
                          setAtivoModalOpen(true)
                        }}
                      >
                        <RotateCw className='h-4 w-4' />
                      </Button>
                    ) : (
                      <>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Etiqueta P1'
                          onClick={() => relatorioEtiquetaCredencialP1(row.id)}
                        >
                          <Tag className='h-4 w-4' />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Passar para histórico (organismo/mês/ano)'
                          onClick={() => setHistoricoConfirmRow(row)}
                        >
                          <History className='h-4 w-4' />
                        </Button>
                      </>
                    )
                : undefined
            }
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />

          <LoteDirectViewModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            loteId={selectedId}
          />
          <LoteDirectFormModal
            open={formModalOpen}
            onOpenChange={setFormModalOpen}
            mode={formModalMode}
            loteId={selectedId}
            viewData={selectedRow}
            onSuccess={refresh}
          />
          <CorrigirLotesModal
            open={corrigirLotesOpen}
            onOpenChange={setCorrigirLotesOpen}
            onSuccess={refresh}
          />
          <ListagensLoteDirectModal open={listagensOpen} onOpenChange={setListagensOpen} />
          <PassarParaAtivoModal
            open={ativoModalOpen}
            onOpenChange={setAtivoModalOpen}
            row={ativoModalRow}
            onSuccess={refresh}
          />

          <AlertDialog
            open={historicoConfirmRow != null}
            onOpenChange={(open) => !open && setHistoricoConfirmRow(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Passar para histórico</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acção marca todas as credenciais do organismo{' '}
                  {historicoConfirmRow?.organismoSigla ?? historicoConfirmRow?.codigoOrganismo} no
                  período {historicoConfirmRow?.mesAno} como histórico. Continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => void confirmPassarHistorico()}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
