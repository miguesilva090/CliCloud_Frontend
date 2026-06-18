import type { ZonaFiscalTableDTO } from '@/types/dtos/faturacao/zona-fiscal.dtos'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ZonaFiscalViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  viewData: ZonaFiscalTableDTO | null
}

export function ZonaFiscalViewModal({
  open,
  onOpenChange,
  viewData,
}: ZonaFiscalViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Zona Fiscal</DialogTitle>
          <DialogDescription>Consulta de registo (somente leitura).</DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='zona-fiscal-codigo'>Código</Label>
            <Input
              id='zona-fiscal-codigo'
              value={viewData?.codigo ?? ''}
              readOnly
              disabled
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='zona-fiscal-descricao'>Descrição</Label>
            <Input
              id='zona-fiscal-descricao'
              value={viewData?.descricao ?? ''}
              readOnly
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
