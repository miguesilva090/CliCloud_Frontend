import { useState } from 'react'
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
import { toast } from '@/utils/toast-utils'
import { FeriadoService } from '@/lib/services/utility/feriados-service'
import { ResponseStatus } from '@/types/api/responses'

interface FeriadoInserirAnoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function FeriadoInserirAnoModal({
  open,
  onOpenChange,
  onSuccess,
}: FeriadoInserirAnoModalProps) {
  const [ano, setAno] = useState<number>(new Date().getFullYear())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  const handleInserir = async () => {
    if (!Number.isInteger(ano) || ano < 1900 || ano > 3000) {
      toast.error('Ano inválido. Use um valor entre 1900 e 3000.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await FeriadoService().inserirFeriadosAno({ ano })
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Feriados anuais inseridos com sucesso.')
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ?? 'Falha ao inserir feriados anuais.'
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao inserir feriados anuais.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Inserir Feriados do Ano</DialogTitle>
          <DialogDescription>
            Esta ação cria os feriados nacionais e móveis para o ano indicado, sem
            duplicar datas existentes.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='feriado-ano'>Ano</Label>
            <Input
              id='feriado-ano'
              type='number'
              min={1900}
              max={3000}
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleInserir} disabled={isSubmitting}>
            {isSubmitting ? 'A inserir...' : 'Inserir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
