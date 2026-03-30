import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePageData } from '@/utils/page-data-utils'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast-utils'
import type { TipoExameTableDTO } from '@/types/dtos/exames/tipo-exame'
import { ListagemTiposExameTable } from '@/pages/area-comum/tabelas/exames/tipos-exame/components/listagem-tipos-exame-table'
import { ListagemTiposExameFilterControls } from '@/pages/area-comum/tabelas/exames/tipos-exame/components/listagem-tipos-exame-filter-controls'
import {
  useGetTiposExamePaginated,
  usePrefetchAdjacentTiposExame,
} from '@/pages/area-comum/tabelas/exames/tipos-exame/queries/listagem-tipos-exame-queries'
import { TipoExameViewCreateModal } from '@/pages/area-comum/tabelas/exames/tipos-exame/modals/tipo-exame-view-create-modal'
import { TipoExameService } from '@/lib/services/exames/tipo-exame-service'
import { ResponseStatus } from '@/types/api/responses'

interface TipoExamePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (row: { id: string; designacao: string }) => void
}

export function TipoExamePickerModal({
  open,
  onOpenChange,
  onSelect,
}: TipoExamePickerModalProps) {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<TipoExameTableDTO | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [viewData, setViewData] = useState<TipoExameTableDTO | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<TipoExameTableDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    data,
    isLoading,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: useGetTiposExamePaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentTiposExame,
  })

  const tiposExame = (data?.info?.data ?? []) as TipoExameTableDTO[]
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0

  const handleOpenDelete = (rowData: TipoExameTableDTO) => {
    setItemToDelete(rowData)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete.id ?? (itemToDelete as { Id?: string }).Id
    if (!id) return
    setIsDeleting(true)
    try {
      const response = await TipoExameService().deleteTipoExame(String(id))
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Tipo de exame eliminado com sucesso.')
        setDeleteDialogOpen(false)
        setItemToDelete(null)
        queryClient.invalidateQueries({
          queryKey: ['tipos-exame-paginated'],
        })
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          'Falha ao eliminar Tipo de exame.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao eliminar o Tipo de exame.'
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

  const handleClose = () => {
    setSelected(null)
    setSelectedRowIds([])
    onOpenChange(false)
  }

  const handleConfirm = () => {
    if (!selected) return
    const id = selected.id ?? (selected as { Id?: string }).Id
    const designacao =
      selected.designacao ??
      (selected as { Designacao?: string | null }).Designacao ??
      ''
    if (!id) return
    onSelect({ id: String(id), designacao })
    setSelected(null)
    setSelectedRowIds([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Selecionar tipo de exame</DialogTitle>
        </DialogHeader>

        <div className='border rounded-md overflow-hidden'>
          <ListagemTiposExameTable
            data={tiposExame}
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
            toolbarActions={[]}
            globalSearchColumnId='designacao'
            globalSearchPlaceholder='Procurar por designação...'
            FilterControls={ListagemTiposExameFilterControls}
            hiddenColumns={[]}
            selectedRows={selectedRowIds}
            onRowSelectionChange={(ids: string[]) => {
              setSelectedRowIds(ids)
              const firstId = ids[0]
              const found = tiposExame.find((t) => String(t.id) === firstId)
              setSelected(found ?? null)
            }}
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
            onOpenDelete={handleOpenDelete}
          />
        </div>

        <DialogFooter className='mt-4'>
          <Button type='button' variant='outline' onClick={handleClose}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleConfirm} disabled={!selected}>
            Selecionar
          </Button>
        </DialogFooter>
      </DialogContent>

      <TipoExameViewCreateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        viewData={viewData}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['tipos-exame-paginated'],
          })
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Tipo de Exame</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende eliminar o tipo de exame &quot;
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
    </Dialog>
  )
}
