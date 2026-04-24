import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, List, RotateCw, RefreshCw, X } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import type { DataTableAction } from '@/components/shared/data-table'
import type { MedicoExternoTableDTO } from '@/types/dtos/saude/medicos-externos.dtos'
import { ListagemMedicosExternosTable } from '../components/listagem-medicos-externos-table'
import { ListagemMedicosExternosFilterControls } from '../components/listagem-medicos-externos-filter-controls'
import {
  useGetMedicosExternosPaginated,
  usePrefetchAdjacentMedicosExternos,
} from '../queries/listagem-medicos-externos-queries'
import { MedicoExternoService } from '@/lib/services/saude/medico-externo-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import { useCloseCurrentWindowLikeTabBar, openEntityEditInApp, openPathInApp } from '@/utils/window-utils'
import { ResponseStatus } from '@/types/api/responses'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/medicos-externos'
const medicosExternosPermId = modules.areaComum.permissions.medicosExternos.id

export function ListagemMedicosExternosPage() {
  const navigate = useNavigate()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const queryClient = useQueryClient()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(medicosExternosPermId)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MedicoExternoTableDTO | null>(
    null
  )
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
    useGetDataPaginated: useGetMedicosExternosPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentMedicosExternos,
  })

  const medicosExternos = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () =>
              openPathInApp(
                navigate,
                addWindow,
                `${LISTAGEM_PATH}/novo`,
                'Novo Médico Externo',
              ),
            variant: 'destructive' as const,
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          },
        ]
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
        queryClient.invalidateQueries({
          queryKey: ['medicos-externos-paginated'],
        })
      },
      variant: 'outline',
    },
  ]

  const handleOpenDelete = (item: MedicoExternoTableDTO) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await MedicoExternoService().deleteMedicoExterno(
        String(id)
      )
      const status = (response.info as { status?: number })?.status
      if (status === ResponseStatus.Success) {
        toast.success('Médico externo eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({ queryKey: ['medicos-externos-paginated'] })
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })
            ?.messages?.['$']?.[0] ?? 'Falha ao eliminar Médico Externo.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao eliminar o Médico Externo.'
      )
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
      <PageHead title='Médicos Externos | Entidades | Tabelas | CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Médicos Externos</h1>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                  queryKey: ['medicos-externos-paginated'],
                })
              }}
              title='Atualizar'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={closeWindowTab}
              title='Voltar'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar médicos externos</AlertTitle>
            <AlertDescription>
              {errorMessage ||
                'Ocorreu um erro ao pedir a lista de médicos externos.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <ListagemMedicosExternosTable
          data={medicosExternos}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={totalRows}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          toolbarActions={toolbarActions}
          expandableSearch
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar...'
          FilterControls={ListagemMedicosExternosFilterControls}
          hiddenColumns={[]}
          onOpenView={(item) => {
            if (!canView) return
            const id = item.id ?? (item as { Id?: string }).Id
            const nome = item.nome ?? (item as { Nome?: string }).Nome
            if (id) {
              openPathInApp(
                navigate,
                addWindow,
                `${LISTAGEM_PATH}/${id}`,
                nome ? `Médico Externo: ${nome}` : 'Médico Externo',
              )
            }
          }}
          onOpenEdit={
            canChange
              ? (item) => {
                  const id = item.id ?? (item as { Id?: string }).Id
                  const nome = item.nome ?? (item as { Nome?: string }).Nome
                  if (id)
                    openEntityEditInApp(
                      navigate,
                      addWindow,
                      `${LISTAGEM_PATH}/${id}/editar`,
                      String(id),
                      nome ? `Médico Externo: ${nome}` : null
                    )
                }
              : undefined
          }
          onOpenDelete={canDelete ? handleOpenDelete : undefined}
          canView={canView}
          canChange={canChange}
          canDelete={canDelete}
        />
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={handleCloseDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Médico Externo</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o médico externo &quot;
                {itemToDelete?.nome ?? ''}
                &quot;? Esta ação não pode ser revertida.
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
