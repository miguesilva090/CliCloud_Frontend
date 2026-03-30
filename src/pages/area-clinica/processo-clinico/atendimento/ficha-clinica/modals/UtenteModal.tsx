import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AsyncCombobox } from '@/components/shared/async-combobox'

export interface UtenteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  utenteId: string
  onUtenteIdChange: (value: string) => void
  utenteSearch: string
  onUtenteSearchChange: (value: string) => void
  utenteItems: Array<{ value: string; label: string; secondary?: string }>
  isLoading: boolean
  onConfirm: () => void
}

export function UtenteModal({
  open,
  onOpenChange,
  utenteId,
  onUtenteIdChange,
  utenteSearch,
  onUtenteSearchChange,
  utenteItems,
  isLoading,
  onConfirm,
}: UtenteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Utentes</DialogTitle>
        </DialogHeader>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>Nome do Utente</label>
            <div className='grid grid-cols-[1fr_auto] items-center gap-2'>
              <AsyncCombobox
                placeholder='Nome do Utente'
                items={utenteItems}
                value={utenteId}
                onChange={onUtenteIdChange}
                searchValue={utenteSearch}
                onSearchValueChange={onUtenteSearchChange}
                isLoading={isLoading}
              />
              <Button variant='outline' size='icon'>
                +
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className='mt-4'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={onConfirm} disabled={!utenteId}>
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
