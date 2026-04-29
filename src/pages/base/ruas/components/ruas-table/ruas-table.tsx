import { useState } from 'react'
import { columns } from '@/pages/base/ruas/components/ruas-table/ruas-columns'
import { RuasFilterControls } from '@/pages/base/ruas/components/ruas-table/ruas-filter-controls'
import { RuaTableDTO } from '@/types/dtos/base/ruas.dtos'
import { Plus, Printer, Trash2, FileText, FileStack } from 'lucide-react'
import { useTableState, useDeleteHandler } from '@/utils/table-utils'
import { toast } from '@/utils/toast-utils'
import { useReportPrint } from '@/hooks/use-report-print'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertModal } from '@/components/shared/alert-modal'
import { AppLoader } from '@/components/shared/app-loader'
import { DataTable } from '@/components/shared/data-table'
import { useDeleteMultipleRuas } from '../../queries/ruas-mutations'
import { useFetchAllRuasForPrint } from '../../queries/ruas-queries'

type TRuasTableProps = {
  ruas: RuaTableDTO[]
  page: number
  pageSize: number
  total: number
  pageCount: number
  onFiltersChange?: (filters: Array<{ id: string; value: string }>) => void
  onPaginationChange?: (page: number, pageSize: number) => void
  onSortingChange?: (sorting: Array<{ id: string; desc: boolean }>) => void
  isLoading?: boolean
}

export function RuasTable({
  ruas,
  pageCount,
  total,
  onFiltersChange,
  onPaginationChange,
  onSortingChange,
  isLoading = false,
}: TRuasTableProps) {
  const deleteMultipleRuasMutation = useDeleteMultipleRuas()
  const { handlePrint, isPrinting } = useReportPrint('listagem-ruas')
  const [isFetchingAll, setIsFetchingAll] = useState(false)
  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false)
  const fetchAllRuasForPrint = useFetchAllRuasForPrint()

  const { state, handlers, activeFiltersCount } = useTableState(
    onFiltersChange,
    onPaginationChange,
    onSortingChange
  )

  const { isDeleteModalOpen, setIsDeleteModalOpen, handleDeleteSelected } =
    useDeleteHandler(
      deleteMultipleRuasMutation,
      'Ruas excluídas com sucesso',
      'Erro ao eliminar ruas',
      state.selectedRows,
      undefined, // onSuccess callback
      'Algumas ruas foram excluídas com avisos', // partial success message
      (deletedIds: string[]) => {
        // Keep only the items that couldn't be deleted (failed items)
        // This way the user knows which ones still need attention
        const failedItems = state.selectedRows.filter(
          (id) => !deletedIds.includes(id)
        )
        handlers.handleRowSelectionChange(failedItems)
      }
    )

  const onPrintClick = () => {
    setIsPrintOptionsOpen(true)
  }

  const onPrintCurrentPage = () => {
    setIsPrintOptionsOpen(false)
    handlePrint(ruas)
  }

  const onPrintAll = async () => {
    setIsPrintOptionsOpen(false)
    try {
      setIsFetchingAll(true)
      const allRuas = await fetchAllRuasForPrint({
        filters: state.filters,
        sorting: state.sorting,
      })
      handlePrint(allRuas)
    } catch (error) {
      console.error('Error fetching all ruas for print:', error)
      toast.error('Erro ao buscar todas as ruas para impressão')
      // Fallback to printing current page
      handlePrint(ruas)
    } finally {
      setIsFetchingAll(false)
    }
  }

  return (
    <>
      <AppLoader
        isLoading={isFetchingAll || isPrinting}
        title={isFetchingAll ? 'A buscar ruas...' : 'A preparar impressão...'}
        description={
          isFetchingAll
            ? 'Aguarde enquanto carregamos todas as ruas'
            : 'Por favor aguarde'
        }
        icon='spinner'
        hideDelay={200}
      />
      {ruas && (
        <>
          <DataTable
            data={ruas}
            columns={columns}
            pageCount={pageCount}
            totalRows={total}
            onFiltersChange={handlers.handleFiltersChange}
            onPaginationChange={handlers.handlePaginationChange}
            onSortingChange={handlers.handleSortingChange}
            onRowSelectionChange={handlers.handleRowSelectionChange}
            selectedRows={state.selectedRows}
            initialColumnVisibility={state.columnVisibility}
            onColumnVisibilityChange={handlers.handleColumnVisibilityChange}
            initialPage={state.pagination.page}
            initialPageSize={state.pagination.pageSize}
            initialSorting={state.sorting}
            initialFilters={state.filters}
            initialActiveFiltersCount={activeFiltersCount}
            FilterControls={RuasFilterControls}
            isLoading={isLoading}
            globalSearchColumnId='nome'
            globalSearchPlaceholder='Procurar por nome da rua...'
            toolbarActions={[
              {
                label: 'Imprimir',
                icon: <Printer className='h-4 w-4' />,
                onClick: onPrintClick,
                variant: 'default',
                disabled: isPrinting || isFetchingAll,
              },
              {
                label: 'Remover',
                icon: <Trash2 className='h-4 w-4' />,
                onClick: () => setIsDeleteModalOpen(true),
                variant: 'destructive',
                disabled:
                  !state.selectedRows || state.selectedRows.length === 0,
              },
              {
                label: 'Adicionar',
                icon: <Plus className='h-4 w-4' />,
                onClick: () =>
                  handlers.handleCreateClick(
                    '/utilitarios/tabelas/geograficas/ruas'
                  ),
                variant: 'emerald',
              },
            ]}
          />

          <AlertModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteSelected}
            loading={deleteMultipleRuasMutation.isPending}
            title='Remover Ruas'
            description='Tem certeza que deseja remover as ruas selecionadas?'
          />

          <Dialog
            open={isPrintOptionsOpen}
            onOpenChange={setIsPrintOptionsOpen}
          >
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Opções de Impressão</DialogTitle>
                <DialogDescription>
                  Escolha o que deseja imprimir
                </DialogDescription>
              </DialogHeader>
              <div className='flex flex-col gap-3 py-4'>
                <Button
                  variant='outline'
                  className='w-full justify-start h-auto py-4 px-4'
                  onClick={onPrintCurrentPage}
                  disabled={isPrinting || isFetchingAll}
                >
                  <div className='flex items-center gap-3 w-full'>
                    <div className='flex-shrink-0'>
                      <FileText className='h-5 w-5 text-primary' />
                    </div>
                    <div className='flex-1 text-left'>
                      <div className='font-semibold'>Imprimir página atual</div>
                      <div className='text-sm text-muted-foreground font-normal'>
                        {ruas.length} registos
                      </div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start h-auto py-4 px-4'
                  onClick={onPrintAll}
                  disabled={isPrinting || isFetchingAll}
                >
                  <div className='flex items-center gap-3 w-full'>
                    <div className='flex-shrink-0'>
                      <FileStack className='h-5 w-5 text-primary' />
                    </div>
                    <div className='flex-1 text-left'>
                      <div className='font-semibold'>
                        Imprimir todas as páginas
                      </div>
                      <div className='text-sm text-muted-foreground font-normal'>
                        {total} registos
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant='ghost'
                  onClick={() => setIsPrintOptionsOpen(false)}
                >
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}
