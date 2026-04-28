import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, List, RotateCw, RefreshCw } from 'lucide-react'
import { usePageData } from '@/utils/page-data-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
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
import type { GoniometriasTableDTO } from '@/types/dtos/goniometrias/goniometrias.dtos'
import { ListagemGoniometriasTable } from '../components/listagem-goniometrias-table'
import { ListagemGoniometriasFilterControls } from '../components/listagem-goniometrias-filter-controls'
import {
    useGetGoniometriasPaginated,
    usePrefetchAdjacentGoniometrias} from '../queries/listagem-goniometrias-queries'
import { GoniometriaViewCreateModal } from '../modals/goniometria-view-create-modal'
import { GoniometriasService } from '@/lib/services/goniometrias/goniometrias-service'
import { ResponseStatus } from '@/types/api/responses'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const goniometriasPermId = modules.areaComum.permissions.goniometrias.id

type GoniometriaModalMode = 'view' | 'create' | 'edit'

export function ListagemGoniometriasPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(goniometriasPermId)
    const queryClient = useQueryClient()
    const[modalOpen, setModalOpen] = useState(false)
    const[modalMode, setModalMode] = useState<GoniometriaModalMode>('view')
    const[viewData, setViewData] = useState<GoniometriasTableDTO | null>(null)
    const[deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const[itemToDelete, setItemToDelete] = useState<GoniometriasTableDTO | null>(null)
    const[isDeleting, setIsDeleting] = useState(false)

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
        useGetDataPaginated: useGetGoniometriasPaginated,
        usePrefetchAdjacentData: usePrefetchAdjacentGoniometrias})

    const goniometrias = data?.info?.data ?? []
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
                queryClient.invalidateQueries({ queryKey: ['goniometrias-paginated'] })
            },
            variant: 'outline'},
    ]

    const handleOpenDelete = (rowData: GoniometriasTableDTO) => {
        setItemToDelete(rowData)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return
        const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
        if (!id) return
        setIsDeleting(true)
        try {
            const response = await GoniometriasService().deleteGoniometria(String(id))
            if (response.info.status === ResponseStatus.Success) {
                toast.success('Goniometria eliminada com sucesso.')
                setDeleteDialogOpen(false)
                setItemToDelete(null)
                queryClient.invalidateQueries({ queryKey: ['goniometrias-paginated'] })
            } else {
                const msg = response.info.messages?.['$']?.[0] ?? 'Falha ao eliminar Goniometria.'
                toast.error(msg)
            }
        }
        catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err?.message ?? 'Ocorreu um erro ao eliminar a Goniometria.')
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
            <AreaComumListagemPageShell
            title='Goniometria'
            onRefresh={() => {
                handleFiltersChange([])
                            handlePaginationChange(1, pageSize)
                            queryClient.invalidateQueries({ queryKey: ['goniometrias-paginated'] })
            }}
        >
            {isError ? (
                <Alert variant='destructive' className='mb-4'>
                    <AlertTitle>Falha ao carregar goniometrias</AlertTitle>
                    <AlertDescription>
                        {errorMessage || 'Ocorreu um erro ao pedir a lista de goniometrias.'}
                    </AlertDescription>
                </Alert>
            ) : null}
            <ListagemGoniometriasTable
                data={goniometrias}
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
                globalSearchColumnId='descricao'
                globalSearchPlaceholder='Procurar por designação...'
                FilterControls={ListagemGoniometriasFilterControls}
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
            <GoniometriaViewCreateModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                mode={modalMode}
                viewData={viewData}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['goniometrias-paginated'] })
                }}
            />
            <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Goniometria</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem a certeza que pretende eliminar a goniometria &quot;{itemToDelete?.descricao ?? ''}&quot;? Esta ação não pode ser revertida.
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
        </AreaComumListagemPageShell>
        </DashboardPageContainer>
        </>
        )
    }



