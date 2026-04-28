import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { List, RotateCw, FilePlus } from 'lucide-react'
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
import { toast } from '@/utils/toast-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { ResponseStatus } from '@/types/api/responses'
import { PageHead } from '@/components/shared/page-head'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { DataTableAction } from '@/components/shared/data-table'
import { usePageData } from '@/utils/page-data-utils'
import {
  useGetAtestadosPaginated,
  usePrefetchAdjacentAtestados,
} from '../queries/atestados-queries'
import { AtestadosTable } from '../components/atestados-table/atestados-table'
import { AtestadoViewModal } from '../modals/atestado-view-modal'
import { AtestadosService } from '@/lib/services/saude/atestados-service'
import type { AtestadoTableDTO } from '@/types/dtos/saude/atestados.dtos'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export function ListagemAtestadosPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewRowData, setViewRowData] = useState<AtestadoTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<AtestadoTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const atestadosPermissionId =
    modules.areaClinica.permissions.listagemAtestadosCartaConducao.id
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(atestadosPermissionId)

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
    useGetDataPaginated: useGetAtestadosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentAtestados,
  })

  const atestados = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [{
          label: 'Novo Atestado',
          icon: <FilePlus className='h-4 w-4' />,
          onClick: () =>
            openPathInApp(
              navigate,
              addWindow,
              '/area-clinica/processo-clinico/atestados/novo-atestado',
              'Novo Atestado'
            ),
          variant: 'destructive' as const,
          className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        }]
      : []),
    {
      label: 'Listagens',
      icon: <List className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({ queryKey: ['atestados-paginated'] })
      },
      variant: 'outline',
    },
  ]

  const handleOpenView = (rowData: AtestadoTableDTO) => {
    setViewRowData(rowData)
    setViewModalOpen(true)
  }

  const handleOpenEdit = (rowData: AtestadoTableDTO) => {
    toast.info('A edição de atestados não está disponível. Utilize Ver para consultar os detalhes.')
    setViewRowData(rowData)
    setViewModalOpen(true)
  }

  const handleOpenDelete = (rowData: AtestadoTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await AtestadosService('saude').deleteAtestado(itemToDelete.id)
      if (response.info?.status === ResponseStatus.Success) {
        toast.success('Atestado eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['atestados-paginated'] })
      } else {
        const msg = response.info?.messages?.['$']?.[0] ?? 'Falha ao eliminar atestado.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o atestado.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <>
      <PageHead title='Listagem Atestados Carta Condução | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Atestados Carta Condução'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar atestados</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Ocorreu um erro ao pedir a lista de atestados.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <AtestadosTable
            data={atestados}
            isLoading={isLoading}
            pageCount={pageCount}
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting.length > 0 ? sorting : [{ id: 'dataAtestado', desc: true }]}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            onOpenView={handleOpenView}
            onOpenEdit={canChange ? handleOpenEdit : undefined}
            onOpenDelete={canDelete ? handleOpenDelete : undefined}
            rowActionPermissions={{
              canView,
              canChange,
              canDelete,
            }}
            toolbarActions={toolbarActions}
            globalSearchColumnId='nomeUtente'
            globalSearchPlaceholder='Procurar por nome utente...'
          />
        </AreaComumListagemPageShell>

        {canView ? (
          <AtestadoViewModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            rowData={viewRowData}
          />
        ) : null}

        <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar atestado</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o atestado
                {itemToDelete?.numeroSNS
                  ? ` (Nº SNS: ${itemToDelete.numeroSNS})`
                  : ''}
                ? Esta ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirmDelete()
                }}
                disabled={isDeleting}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {isDeleting ? 'A eliminar...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardPageContainer>
    </>
  )
}

