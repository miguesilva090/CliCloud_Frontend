import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Download, Plus, RefreshCw, RotateCw, X } from 'lucide-react'
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
import type { FeriadoDTO } from '@/types/dtos/utility/feriado.dtos'
import { ListagemFeriadosTable } from '../components/listagem-feriados-table'
import { ListagemFeriadosFilterControls } from '../components/listagem-feriados-filter-controls'
import {
    useGetFeriadosPaginated,
    usePrefetchAdjacentFeriados} from '../queries/listagem-feriados-queries'

import { FeriadoViewCreateModal } from '../modals/feriado-view-create-modal'
import { FeriadoInserirAnoModal } from '../modals/feriado-inserir-ano-modal'
import { FeriadoImportarModal } from '../modals/feriado-importar-modal'
import { FeriadoService } from '@/lib/services/utility/feriados-service'
import { ResponseStatus } from '@/types/api/responses'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

type FeriadoModalMode = 'view' | 'create' | 'edit'

export function ListagemFeriadosPage() {
    const closeWindowTab = useCloseCurrentWindowLikeTabBar()
    const queryClient = useQueryClient()

    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<FeriadoModalMode>('view')
    const [viewData, setViewData] = useState<FeriadoDTO | null>(null)
    const [inserirAnoOpen, setInserirAnoOpen] = useState(false)
    const [importarOpen, setImportarOpen] = useState(false)

    const [ deleteDialogOpen, setDeleteDialogOpen ] = useState(false)
    const [ itemToDelete, setItemToDelete ] = useState<FeriadoDTO | null>(null)
    const [ isDeleting, setIsDeleting ] = useState(false)

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
        useGetDataPaginated: useGetFeriadosPaginated,
        usePrefetchAdjacentData: usePrefetchAdjacentFeriados,
    })

    const feriados = data?.info?.data ?? []
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
            className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            },
            {
                label: 'Importar',
                icon: <Download className='h-4 w-4' />,
                onClick: () => setImportarOpen(true),
                variant: 'outline',
            },
            {
                label: 'Inserir Ano',
                icon: <Plus className='h-4 w-4' />,
                onClick: () => setInserirAnoOpen(true),
                variant: 'outline',
            },
            {
                label: 'Atualizar',
                icon: <RotateCw className='h-4 w-4' />,
                onClick: () => {
                    handleFiltersChange([])
                    handlePaginationChange(1, pageSize)
                    queryClient.invalidateQueries({ queryKey: ['feriados-paginated'] })
            },
            variant: 'outline',
        },
    ]

    const handleOpenDelete = (row: FeriadoDTO) => {
        setItemToDelete(row)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return
        setIsDeleting(true)

        try {
            const response = await FeriadoService().deleteFeriado(itemToDelete.id)
            if (response.info.status === ResponseStatus.Success) 
            {
                toast.success('Feriado eliminado com sucesso.')
                setDeleteDialogOpen(false)
                setItemToDelete(null)
                queryClient.invalidateQueries({ queryKey: ['feriados-paginated'] })
            } else {
                const msg = response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar Feriado.'
                toast.error(msg)
            }
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err?.message ?? 'Ocorreu um erro ao eliminar o Feriado.')
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
        <PageHead title='Feriados' />
            <DashboardPageContainer>
                <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
                    <h1 className='text-lg font-semibold'>Feriados</h1>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => {
                                handleFiltersChange([])
                                handlePaginationChange(1, pageSize)
                                queryClient.invalidateQueries({ queryKey: ['feriados-paginated'] })
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
                        <AlertTitle>Falha ao carregar feriados</AlertTitle>
                        <AlertDescription>
                            {errorMessage || 'Ocorreu um erro ao pedir a lista de feriados.'}
                        </AlertDescription>
                    </Alert>
                ): null }

                <ListagemFeriadosTable
                    data={feriados}
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
                    globalSearchColumnId='designacao'
                    globalSearchPlaceholder='Procurar por designação...'
                    FilterControls={ListagemFeriadosFilterControls}
                    hiddenColumns={[]}
                    onOpenView={(row) => {
                        setViewData(row)
                        setModalMode('view')
                        setModalOpen(true)
                    }}
                    onOpenEdit={(row) => {
                        setViewData(row)
                        setModalMode('edit')
                        setModalOpen(true)
                    }}
                    onOpenDelete={handleOpenDelete}
                />

                <FeriadoViewCreateModal 
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    mode={modalMode}
                    viewData={viewData}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['feriados-paginated'] })
                    }}
                />
                <FeriadoInserirAnoModal
                    open={inserirAnoOpen}
                    onOpenChange={setInserirAnoOpen}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['feriados-paginated'] })
                    }}
                />
                <FeriadoImportarModal
                    open={importarOpen}
                    onOpenChange={setImportarOpen}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['feriados-paginated'] })
                    }}
                />

                <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Feriado</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem a certeza que pretende eliminar o feriado &quot;
                                {itemToDelete?.designacao ?? ''}
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