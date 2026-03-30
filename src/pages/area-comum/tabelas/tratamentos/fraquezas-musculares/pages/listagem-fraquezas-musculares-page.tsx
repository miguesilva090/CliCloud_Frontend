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
import type { FraquezasMuscularesTableDTO } from '@/types/dtos/fraquezas-musculares/fraquezas-musculares.dtos'
import { ListagemFraquezasMuscularesTable } from '../components/listagem-fraquezas-musculares-table'
import { ListagemFraquezasMuscularesFilterControls } from '../components/listagem-fraquezas-musculares-filter-controls'
import {
    useGetFraquezasMuscularesPaginated,
    usePrefetchAdjacentFraquezasMusculares} from '../queries/listagem-fraquezas-musculares-queries'
import { FraquezasMuscularesViewCreateModal } from '../modals/fraquezas-musculares-view-create-modal'
import { FraquezasMuscularesService } from '@/lib/services/fraquezas-musculares'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

type FraquezasMuscularesModalMode = 'view' | 'create' | 'edit'

export function ListagemFraquezasMuscularesPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
    const queryClient = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<FraquezasMuscularesModalMode>('view')
    const [viewData, setViewData] = useState<FraquezasMuscularesTableDTO | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<FraquezasMuscularesTableDTO | null>(null)
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
        useGetDataPaginated: useGetFraquezasMuscularesPaginated,
        usePrefetchAdjacentData: usePrefetchAdjacentFraquezasMusculares})

    const fraquezasMusculares = data?.info?.data ?? []
    const pageCount = data?.info?.totalPages ?? 0
    const totalRows = data?.info?.totalCount ?? 0
    const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

    const toolbarActions: DataTableAction[] = [
        {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () => {
                setViewData(null)
                setModalMode('create')
                setModalOpen(true)
            },
            variant: 'destructive',
            className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'},
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
                    queryKey: ['fraquezas-musculares-paginated']})
            },
            variant: 'outline'},
    ]

    const hadleOpenDelete = (rowData: FraquezasMuscularesTableDTO) => {
        setItemToDelete(rowData)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return
        const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
        if (!id) return
        setIsDeleting(true)
        try {
            const response = await FraquezasMuscularesService().deleteFraquezasMusculares(String(id))
            const status = (response.info as { status?: number })?.status
            if (status === ResponseStatus.Success) {
                toast.success('Fraqueza muscular eliminada com sucesso.')
                setDeleteDialogOpen(false)
                setItemToDelete(null)
                queryClient.invalidateQueries({ queryKey: ['fraquezas-musculares-paginated'] })
            } else {
                const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao eliminar Fraqueza Muscular.'
                toast.error(msg)
            }
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err?.message ?? 'Ocorreu um erro ao eliminar a Fraqueza Muscular.')
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
                <h1 className='text-lg font-semibold'>Fraquezas Musculares</h1>
                <div className='flex items-center gap-2'>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => {
                            handleFiltersChange([])
                            handlePaginationChange(1, pageSize)
                            queryClient.invalidateQueries({
                                queryKey: ['fraquezas-musculares-paginated']})
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
                    <AlertTitle>Falha ao carregar fraquezas musculares</AlertTitle>
                    <AlertDescription>
                        {errorMessage || 'Ocorreu um erro ao pedir a lista de fraquezas musculares.'}
                    </AlertDescription>
                </Alert>
            ) : null}


            <ListagemFraquezasMuscularesTable
                data={fraquezasMusculares}
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
                FilterControls={ListagemFraquezasMuscularesFilterControls}
                hiddenColumns={[]}
                onOpenView={(rowData) => {
                    setViewData(rowData)
                    setModalMode('view')
                    setModalOpen(true)
                }}
                onOpenEdit={(rowData) => {
                    setViewData(rowData)
                    setModalMode('edit')
                    setModalOpen(true)
                }}
                onOpenDelete={hadleOpenDelete}
            />
            <FraquezasMuscularesViewCreateModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                mode={modalMode}
                viewData={viewData}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['fraquezas-musculares-paginated'] })
                }}
            />
            <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Fraqueza Muscular</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem a certeza que pretende eliminar a fraqueza muscular &quot;
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




