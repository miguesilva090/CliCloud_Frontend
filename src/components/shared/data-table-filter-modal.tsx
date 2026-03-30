import { CheckIcon, TrashIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { EnhancedModal } from '@/components/ui/enhanced-modal'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DataTableFilterModalProps {
  isOpen: boolean
  onClose: () => void
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
  FilterControls: React.ComponentType<{
    table: any
    columns: any[]
    onApplyFilters: () => void
    onClearFilters: () => void
  }>
}

export function DataTableFilterModal({
  isOpen,
  onClose,
  table,
  columns,
  onApplyFilters,
  onClearFilters,
  FilterControls,
}: DataTableFilterModalProps) {
  const handleApplyFilters = () => {
    onApplyFilters()
    onClose()
  }

  return (
    <EnhancedModal
      title='Filtros'
      description='Selecione os filtros que deseja aplicar à tabela'
      isOpen={isOpen}
      onClose={onClose}
      size='lg'
    >
      <div className='flex flex-col h-full'>
        <ScrollArea className='flex-1'>
          <div className='p-4'>
            <FilterControls
              table={table}
              columns={columns}
              onApplyFilters={handleApplyFilters}
              onClearFilters={onClearFilters}
            />
          </div>
        </ScrollArea>
        <div className='flex flex-col justify-end space-y-2 border-t bg-background pt-4 mt-6 md:flex-row md:space-x-4 md:space-y-0'>
          <Button
            variant='outline'
            onClick={onClose}
            className='w-full md:w-auto'
          >
            Cancelar
          </Button>
          <Button
            variant='outline'
            onClick={onClearFilters}
            className='w-full md:w-auto'
          >
            <TrashIcon className='mr-2 h-4 w-4' />
            Limpar
          </Button>
          <Button onClick={handleApplyFilters} className='w-full md:w-auto'>
            <CheckIcon className='mr-2 h-4 w-4' />
            Aplicar
          </Button>
        </div>
      </div>
    </EnhancedModal>
  )
}
