import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Plus, CalendarClock, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { usePageData } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { ListaEsperaTratamentoAdministrativoService } from '@/lib/services/tratamentos/lista-espera-tratamento-administrativo-service'
import type { ListaEsperaTratamentoTableDTO } from '@/types/dtos/tratamentos/lista-espera-tratamento-administrativo.dtos'
import { ListagemListaEsperaTratamentoTable } from '../components/listagem-lista-espera-tratamento-table'
import { ListaEsperaTratamentoViewEditModal } from '../modals/lista-espera-tratamento-view-edit-modal'
import { ListaEsperaTratamentoObservacoesModal } from '../modals/lista-espera-tratamento-observacoes-modal'
import {
  invalidateListaEsperaTratamentoQueries,
  useGetListaEsperaTratamentoPaginated,
  usePrefetchAdjacentListaEsperaTratamento,
} from '../queries/listagem-lista-espera-tratamento-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openListaEsperaTratamentoCreationInApp, useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

const listPermId = modules.areaAdministrativa.permissions.listaEsperaTratamentos.id

export function ListagemListaEsperaTratamentoPage() {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const { canView, canChange, canDelete, canAdd } =
    useAreaComumEntityListPermissions(listPermId)
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
  const [selectedRow, setSelectedRow] = useState<ListaEsperaTratamentoTableDTO | null>(null)
  const [obsOpen, setObsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState<ListaEsperaTratamentoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    useGetDataPaginated: useGetListaEsperaTratamentoPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentListaEsperaTratamento,
  })

  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => invalidateListaEsperaTratamentoQueries(queryClient)

  const handleOpenDelete = (row: ListaEsperaTratamentoTableDTO) => {
    if (!canDelete) return
    setRowToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = (open: boolean) => {
    if (isDeleting && !open) return
    setDeleteDialogOpen(open)
    if (!open) setRowToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return
    setIsDeleting(true)
    try {
      const res = await ListaEsperaTratamentoAdministrativoService(listPermId).delete(rowToDelete.id)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Registo eliminado.')
        setDeleteDialogOpen(false)
        setRowToDelete(null)
        refresh()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível eliminar.')
      }
    } catch {
      toast.error('Erro ao eliminar.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHead title='Lista de Espera — Tratamentos | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Lista de Espera — Tratamentos'
          onBack={() => {
            closeLikeTabBar()
            navigate('/area-administrativa/tratamentos')
          }}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar lista de espera</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao carregar os dados.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemListaEsperaTratamentoTable
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
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
            toolbarActions={[
              ...(canAdd
                ? [
                    {
                      label: 'Adicionar',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: () => {
                        openListaEsperaTratamentoCreationInApp(navigate, addWindow)
                      },
                      variant: 'destructive' as const,
                    },
                  ]
                : []),
              {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: refresh,
                variant: 'outline' as const,
              },
            ]}
            onOpenView={(row) => {
              setModalMode('view')
              setSelectedRow(row)
              setModalOpen(true)
            }}
            onOpenEdit={
              canChange
                ? (row) => {
                    setModalMode('edit')
                    setSelectedRow(row)
                    setModalOpen(true)
                  }
                : undefined
            }
            onOpenDelete={canDelete ? handleOpenDelete : undefined}
            renderExtraActions={(row) =>
              canChange ? (
                <div className='flex gap-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Observações'
                    onClick={() => {
                      setSelectedRow(row)
                      setObsOpen(true)
                    }}
                  >
                    <MessageSquare className='h-4 w-4' />
                  </Button>
                  <Button 
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Marcar tratamento'
                    onClick={() => {
                      navigate(
                        `/area-administrativa/tratamentos/marcacoes-manuais?listaEsperaId=${row.id}`
                      )
                    }}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Marcação automática'
                    onClick={() => {
                      navigate(
                        `/area-administrativa/tratamentos/marcacoes-automaticas?listaEsperaId=${row.id}`
                      )
                    }}
                  >
                    <CalendarClock className='h-4 w-4' />
                  </Button>
                </div>
              ) : null
            }
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <ListaEsperaTratamentoViewEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        row={selectedRow}
        listPermId={listPermId}
        onSaved={refresh}
      />

      <ListaEsperaTratamentoObservacoesModal
        open={obsOpen}
        onOpenChange={setObsOpen}
        listaEsperaId={selectedRow?.id ?? null}
        utenteLabel={selectedRow?.utenteNome ?? undefined}
        listPermId={listPermId}
        onSaved={refresh}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja realmente apagar o registo?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'A eliminar...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
