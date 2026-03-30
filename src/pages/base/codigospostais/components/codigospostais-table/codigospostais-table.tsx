import { useState } from 'react'
import { CodigoPostalTableDTO } from '@/types/dtos/base/codigospostais.dtos'
import { Plus, Printer, Trash2, FileText, FileStack } from 'lucide-react'
// import { useLocation } from 'react-router-dom'
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
import { useDeleteMultipleCodigosPostais } from '../../queries/codigospostais-mutations'
import { useFetchAllCodigosPostaisForPrint } from '../../queries/codigospostais-queries'
import { columns } from './codigospostais-columns'
import { filterFields } from './codigospostais-constants'
import { CodigosPostaisFilterControls } from './codigospostais-filter-controls'

type TCodigosPostaisTableProps = {
  codigosPostais: CodigoPostalTableDTO[]
  page: number
  pageSize: number
  total: number
  pageCount: number
  onFiltersChange?: (filters: Array<{ id: string; value: string }>) => void
  onPaginationChange?: (page: number, pageSize: number) => void
  onSortingChange?: (sorting: Array<{ id: string; desc: boolean }>) => void
  isLoading?: boolean
}

export function CodigosPostaisTable({
  codigosPostais,
  pageCount,
  total,
  page,
  pageSize,
  onFiltersChange,
  onPaginationChange,
  onSortingChange,
  isLoading = false,
}: TCodigosPostaisTableProps) {
  // const location = useLocation()
  const deleteMultipleCodigosPostaisMutation = useDeleteMultipleCodigosPostais()
  const { handlePrint, isPrinting } = useReportPrint('listagem-codigospostais')
  const [isFetchingAll, setIsFetchingAll] = useState(false)
  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false)
  const fetchAllCodigosPostaisForPrint = useFetchAllCodigosPostaisForPrint()

  const { state, handlers, activeFiltersCount } = useTableState(
    onFiltersChange,
    onPaginationChange,
    onSortingChange
  )

  const { isDeleteModalOpen, setIsDeleteModalOpen, handleDeleteSelected } =
    useDeleteHandler(
      deleteMultipleCodigosPostaisMutation,
      'Códigos Postais removidos com sucesso',
      'Erro ao remover códigos postais',
      state.selectedRows,
      undefined, // onSuccess callback
      'Algumas códigos postais foram removidos com avisos', // partial success message
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
    handlePrint(codigosPostais)
  }

  const onPrintAll = async () => {
    setIsPrintOptionsOpen(false)
    try {
      setIsFetchingAll(true)
      const allCodigosPostais = await fetchAllCodigosPostaisForPrint({
        filters: state.filters,
        sorting: state.sorting,
      })
      handlePrint(allCodigosPostais)
    } catch (error) {
      console.error('Error fetching all codigos postais for print:', error)
      toast.error('Erro ao buscar todos os códigos postais para impressão')
      // Fallback to printing current page
      handlePrint(codigosPostais)
    } finally {
      setIsFetchingAll(false)
    }
  }

  return (
    <>
      <AppLoader
        isLoading={isFetchingAll || isPrinting}
        title={
          isFetchingAll
            ? 'A buscar códigos postais...'
            : 'A preparar impressão...'
        }
        description={
          isFetchingAll
            ? 'Aguarde enquanto carregamos todos os códigos postais'
            : 'Por favor aguarde'
        }
        icon='spinner'
        hideDelay={200}
      />
      {codigosPostais && (
        <>
          <DataTable
            columns={columns}
            data={codigosPostais}
            pageCount={pageCount}
            initialPage={page}
            initialPageSize={pageSize}
            initialSorting={state.sorting}
            initialColumnVisibility={state.columnVisibility}
            onColumnVisibilityChange={handlers.handleColumnVisibilityChange}
            filterFields={filterFields}
            FilterControls={CodigosPostaisFilterControls}
            isLoading={isLoading}
            onFiltersChange={handlers.handleFiltersChange}
            onPaginationChange={handlers.handlePaginationChange}
            onSortingChange={handlers.handleSortingChange}
            initialActiveFiltersCount={activeFiltersCount}
            baseRoute='/utilitarios/tabelas/geograficas/codigospostais'
            selectedRows={state.selectedRows}
            onRowSelectionChange={handlers.handleRowSelectionChange}
            enableSorting={true}
            totalRows={total}
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
                disabled: state.selectedRows.length === 0,
              },
              {
                label: 'Adicionar',
                icon: <Plus className='h-4 w-4' />,
                onClick: () =>
                  handlers.handleCreateClick(
                    '/utilitarios/tabelas/geograficas/codigospostais'
                  ),
                variant: 'emerald',
              },
            ]}
          />

          <AlertModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteSelected}
            loading={deleteMultipleCodigosPostaisMutation.isPending}
            title='Remover Códigos Postais'
            description='Tem certeza que deseja remover os códigos postais selecionados?'
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
                        {codigosPostais.length} registos
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
