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
    AlertDialogTitle} from '@/components/ui/alert-dialog'
import { toast } from '@/utils/toast-utils'
import type { DataTableAction } from '@/components/shared/data-table'
import type { MotivosDesmarcacaoTableDTO } from '@/types/dtos/motivos-desmarcacao/motivos-desmarcacao.dtos'
import { ListagemMotivosDesmarcacaoTable } from '../components/listagem-motivos-desmarcacao-table'
import { ListagemMotivosDesmarcacaoFilterControls } from '../components/listagem-motivos-desmarcacao-filter-controls'
import {
    useGetMotivosDesmarcacaoPaginated,
    usePrefetchAdjacentMotivosDesmarcacao} from '../queries/listagem-motivos-desmarcacao-queries'
import { MotivosDesmarcacaoViewCreateModal } from '../modals/motivos-desmarcacao-view-create-modal'
import { MotivosDesmarcacaoService } from '@/lib/services/motivos-desmarcacao'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const motivosDesmarcacaoPermId =
  modules.areaComum.permissions.motivosDesmarcacao.id

type MotivosDesmarcacaoModalMode = 'view' | 'create' | 'edit'

export function ListagemMotivosDesmarcacaoPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(motivosDesmarcacaoPermId)
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
    const queryClient = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<MotivosDesmarcacaoModalMode>('view')
    const [viewData, setViewData] = useState<MotivosDesmarcacaoTableDTO | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<MotivosDesmarcacaoTableDTO | null>(null)
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
        handleSortingChange} = usePageData({
        useGetDataPaginated: useGetMotivosDesmarcacaoPaginated,
        usePrefetchAdjacentData: usePrefetchAdjacentMotivosDesmarcacao})

        const motivosDesmarcacao = data?.info?.data ?? []
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
            variant: 'outline'},
        {
            label: 'Atualizar',
            icon: <RotateCw className='h-4 w-4' />,
            onClick: () => {
                handleFiltersChange([])
                handlePaginationChange(1, pageSize)
                queryClient.invalidateQueries({
                    queryKey: ['motivos-desmarcacao-paginated']
                })
            },
            variant: 'outline'},
    ]

    const handleOpenView = (rowData: MotivosDesmarcacaoTableDTO) => {
        setItemToDelete(rowData)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return
        const id = itemToDelete.id ?? (itemToDelete as { Id?: string}).Id
        if (!id) return
        setIsDeleting(true)
        try {
            const response = await MotivosDesmarcacaoService().deleteMotivosDesmarcacao(String(id))
            const status = (response.info as { status?: number })?.status
            if (status === ResponseStatus.Success) {
                toast.success('Motivo de desmarcação eliminado com sucesso.')
                setDeleteDialogOpen(false)
                setItemToDelete(null)
                queryClient.invalidateQueries({queryKey: ['motivos-desmarcacao-paginated']})
            } else {
                const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao eliminar Motivo de Desmarcação.'
                toast.error(msg)
            }
        } catch (error: unknown) {
            const err = error as {message?: string}
            toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o Motivo de Desmarcação.')
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
        <PageHead title='CliCloud' />
        <DashboardPageContainer>
            <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
                <h1 className='text-lg font-semibold'>Motivos de Desmarcação</h1>
                <div className='flex items-center gap-2'>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => {
                            handleFiltersChange([])
                            handlePaginationChange(1, pageSize)
                            queryClient.invalidateQueries({
                                queryKey: ['motivos-desmarcacao-paginated']
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
                    <AlertTitle>Falha ao carregar motivos de desmarcação</AlertTitle>
                    <AlertDescription>
                        {errorMessage || 'Ocorreu um erro ao pedir a lista de motivos de desmarcação.'}
                    </AlertDescription>
                </Alert>
            ) : null}
            <ListagemMotivosDesmarcacaoTable
                data={motivosDesmarcacao}
                isLoading={isLoading}
                pageCount={pageCount}
                totalRows={totalRows}
                page={page}
                pageSize={pageSize}
                filters={filters}
                sorting={sorting.length > 0 ? sorting : [{ id: 'descricao', desc: false }]}
                onPaginationChange={handlePaginationChange}
                onFiltersChange={handleFiltersChange}
                onSortingChange={handleSortingChange}
                toolbarActions={toolbarActions}
                expandableSearch
                globalSearchColumnId='descricao'
                globalSearchPlaceholder='Procurar por descrição...'
                FilterControls={ListagemMotivosDesmarcacaoFilterControls}
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
                onOpenDelete={canDelete ? handleOpenView : undefined}
                canView={canView}
                canChange={canChange}
                canDelete={canDelete}
            />
            <MotivosDesmarcacaoViewCreateModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                mode={modalMode}
                viewData={viewData}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['motivos-desmarcacao-paginated'] })
                }}
            />
            <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Motivo de Desmarcação</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem a certeza que pretende eliminar o motivo de desmarcação &quot;
                            {itemToDelete?.descricao ?? ''}
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



