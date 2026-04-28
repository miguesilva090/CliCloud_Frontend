import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {} from 'react-router-dom'
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
import type { MargemMedicoTableDTO } from '@/types/dtos/saude/margem-medico.dtos'
import { ListagemMargemMedicosTable } from '../components/listagem-margem-medicos-table'
import { useGetMargemMedicosPaginated, usePrefetchAdjacentMargemMedicos } from '../queries/listagem-margem-medicos-queries'
import { MargemMedicoViewCreateModal } from '../modals/margem-medico-view-create-modal'
import { MargemMedicoService } from '@/lib/services/saude/margem-medico-service'
import { ResponseStatus } from '@/types/api/responses'

import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const margemMedicosPermId = modules.areaComum.permissions.margemMedicos.id

function ListagemMargemMedicosPage() {
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(margemMedicosPermId)
    const queryClient = useQueryClient()
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('create')
    const [selectedRow, setSelectedRow] = useState<MargemMedicoTableDTO | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<MargemMedicoTableDTO | null>(null)
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
        useGetDataPaginated: (p, ps, f, s) => useGetMargemMedicosPaginated(p, ps, f, s),
        usePrefetchAdjacentData: (p, ps, f) => usePrefetchAdjacentMargemMedicos(p, ps, f, null)})

    const margens = data?.info?.data ?? []
    const pageCount = data?.info?.totalPages ?? 0
    const totalRows = data?.info?.totalCount ?? 0
    const errorMessage = error instanceof Error ? error.message : error ? String(error) : ''

    const abrirModalNovo = () => {
        setSelectedRow(null)
        setModalMode('create')
        setModalOpen(true)
    }

    const toolbarActions: DataTableAction[] = [
        ...(canAdd
            ? [
                  {
                      label: 'Adicionar',
                      icon: <Plus className='h-4 w-4' />,
                      onClick: abrirModalNovo,
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
                queryClient.invalidateQueries({ queryKey: ['margem-medicos-paginated'] })
            },
            variant: 'outline'},
    ]

    const handleOpenView = (row: MargemMedicoTableDTO) => {
        setSelectedRow(row)
        setModalMode('view')
        setModalOpen(true)
    }

    const handleOpenEdit = (row: MargemMedicoTableDTO) => {
        setSelectedRow(row)
        setModalMode('edit')
        setModalOpen(true)
    }

    const handleOpenDelete = (row: MargemMedicoTableDTO) => {
        setItemToDelete(row)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return
        const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
        if (!id) return

        setIsDeleting(true)
        try {
            const response = await MargemMedicoService().deleteMargemMedico(String(id))
            if (response.info.status === ResponseStatus.Success) {
                toast.success('Margem médica eliminada com sucesso.')
                setDeleteDialogOpen(false)
                setItemToDelete(null)
                queryClient.invalidateQueries({ queryKey: ['margem-medicos-paginated'] })
            } else {
                const msg = 
                response.info.messages?.['$']?.[0] ?? 
                    'Falha ao eliminar Margem de Médico.'
                toast.error(msg)
            }
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(
                err?.message ?? 'Ocorreu um erro ao eliminar a Margem Médica.')
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
        <PageHead title='Margem de Médicos | Consultas | CliCloud' />
        <DashboardPageContainer>
          <AreaComumListagemPageShell
            title='Margem de Médicos'
            onRefresh={() => {
                handleFiltersChange([])
                  handlePaginationChange(1, pageSize)
                  queryClient.invalidateQueries({
                    queryKey: ['margem-medico-paginated']})
            }}
        >
  
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar Margem de Médicos</AlertTitle>
              <AlertDescription>
                {errorMessage ||
                  'Ocorreu um erro ao pedir a lista de Margens de Médicos.'}
              </AlertDescription>
            </Alert>
          ) : null}
  
          <ListagemMargemMedicosTable
            data={margens}
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
            globalSearchColumnId='medicoNome'
            globalSearchPlaceholder='Procurar médico...'
            onOpenView={(row) => {
              if (!canView) return
              handleOpenView(row)
            }}
            onOpenEdit={canChange ? handleOpenEdit : undefined}
            onOpenDelete={canDelete ? handleOpenDelete : undefined}
            canView={canView}
            canChange={canChange}
            canDelete={canDelete}
          />
  
          <MargemMedicoViewCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
            viewData={selectedRow}
            onSuccess={() =>
              queryClient.invalidateQueries({
                queryKey: ['margem-medico-paginated']})
            }
          />
          <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar Margem de Médico</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem a certeza que pretende eliminar esta Margem de Médico (
                  {itemToDelete?.medicoNome ?? ''} – {itemToDelete?.servicoDesignacao ?? ''}
                  )? Esta ação não pode ser revertida.
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

export default ListagemMargemMedicosPage

