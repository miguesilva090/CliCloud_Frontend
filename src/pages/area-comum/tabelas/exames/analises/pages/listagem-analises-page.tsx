import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import type { AnaliseTableDTO } from '@/types/dtos/exames/analises'
import { ListagemAnalisesTable } from '../components/listagem-analises-table'
import { ListagemAnalisesFilterControls } from '../components/listagem-analises-filter-controls'
import {
    useGetAnalisesPaginated,
    usePrefetchAdjacentAnalises,
} from '../queries/listagem-analises-queries'
import { AnaliseViewCreateModal } from '../modals/analise-view-create-modal'
import { AnalisesService } from '@/lib/services/exames/analises-service'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const analisesPermId = modules.areaComum.permissions.analises.id

type AnaliseModalMode = 'view' | 'create' | 'edit'

export function ListagemAnalisesPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(analisesPermId)
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
    const queryClient = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<AnaliseModalMode>('view')
    const [viewData, setViewData] = useState<AnaliseTableDTO | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<AnaliseTableDTO | null>(null)
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
        useGetDataPaginated: useGetAnalisesPaginated,
        usePrefetchAdjacentData: usePrefetchAdjacentAnalises,
    })

    const analises = data?.info?.data ?? []
    const pageCount = data?.info?.totalPages ?? 0
    const totalRows = data?.info?.totalCount ?? 0
    const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

    const toolbarActions: DataTableAction[] = [
        ...(canAdd
            ? [
                  {
                      label: 'Adicionar',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: () => {
                          setViewData(null)
                          setModalMode('create')
                          setModalOpen(true)
                      },
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
                queryClient.invalidateQueries({ queryKey: ['analises-paginated'] })
            },
            variant: 'outline',
        },
    ]

    const handleOpenDelete = (rowData: AnaliseTableDTO) => {
        setItemToDelete(rowData)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return
        const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
        if (!id) return
        setIsDeleting(true)
        try {
            const response = await AnalisesService().deleteAnalise(String(id))
            if (response.info.status === ResponseStatus.Success) {
                toast.success('Análise eliminada com sucesso.')
                setDeleteDialogOpen(false)
                setItemToDelete(null)
                queryClient.invalidateQueries({ queryKey: ['analises-paginated'] })
            } else {
                const msg = response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar Análise.'
                toast.error(msg)
            }
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err?.message ?? 'Ocorreu um erro ao eliminar a Análise.')
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
            <PageHead title='Análises | Tabelas | Área Comum | CliCloud' />
            <DashboardPageContainer>
                <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
                    <h1 className='text-lg font-semibold'>Análises</h1>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => {
                                handleFiltersChange([])
                                handlePaginationChange(1, pageSize)
                                queryClient.invalidateQueries({
                                    queryKey: ['analises-paginated'],
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
                            title='Fechar'
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                </div>

                {isError ? (
                    <Alert variant='destructive' className='mb-4'>
                        <AlertTitle>Falha ao carregar análises</AlertTitle>
                        <AlertDescription>
                            {errorMessage || 'Ocorreu um erro ao pedir a lista de análises.'}
                        </AlertDescription>
                    </Alert>
                ) : null}

                <ListagemAnalisesTable
                    data={analises}
                    pageCount={pageCount}
                    totalRows={totalRows}
                    isLoading={isLoading}
                    page={page}
                    pageSize={pageSize}
                    filters={filters}
                    sorting={sorting}
                    onPaginationChange={handlePaginationChange}
                    onFiltersChange={handleFiltersChange}
                    onSortingChange={handleSortingChange}
                    toolbarActions={toolbarActions}
                    globalSearchColumnId='nome'
                    globalSearchPlaceholder='Procurar por nome...'
                    FilterControls={ListagemAnalisesFilterControls}
                    hiddenColumns={[]}
                    onOpenView={(rowData) => {
                        if (!canView) return
                        setViewData(rowData)
                        setModalMode('view')
                        setModalOpen(true)
                    }}
                    onOpenEdit={
                        canChange
                            ? (rowData) => {
                                  setViewData(rowData)
                                  setModalMode('edit')
                                  setModalOpen(true)
                              }
                            : undefined
                    }
                    onOpenDelete={canDelete ? handleOpenDelete : undefined}
                    canView={canView}
                    canChange={canChange}
                    canDelete={canDelete}
                />

                <AnaliseViewCreateModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    mode={modalMode}
                    viewData={viewData}
                    onSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['analises-paginated'],
                        })
                    }}
                />

                <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Análise</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem a certeza que pretende eliminar a análise &quot;
                                {itemToDelete?.nome ?? ''}
                                &quot;? Esta ação não pode ser revertida.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
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