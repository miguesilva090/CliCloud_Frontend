import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isSubmitting?: boolean
  onConfirm: (payload: { motivoCodigo: string; motivoDescricao: string }) => void
}

export function AnularReceitaModal({
  open,
  onOpenChange,
  isSubmitting,
  onConfirm,
}: Props) {
  const [motivoCodigo, setMotivoCodigo] = useState('OUT')
  const [motivoDescricao, setMotivoDescricao] = useState('')

  const handleConfirm = () => {
    onConfirm({
      motivoCodigo: motivoCodigo.trim(),
      motivoDescricao: motivoDescricao.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anular receita</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <Label htmlFor='motivoCodigo'>Código do motivo</Label>
            <Input
              id='motivoCodigo'
              value={motivoCodigo}
              onChange={(e) => setMotivoCodigo(e.target.value)}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='motivoDescricao'>Descrição</Label>
            <Textarea
              id='motivoDescricao'
              value={motivoDescricao}
              onChange={(e) => setMotivoDescricao(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={
              isSubmitting ||
              !motivoCodigo.trim() ||
              !motivoDescricao.trim()
            }
          >
            Anular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
