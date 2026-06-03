import { useEffect, useState } from 'react'
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
import { fieldGap, inputClass, labelClass } from '@/lib/form-styles'
import { toast } from '@/utils/toast-utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dataDe: string
  dataAte: string
  /** Legado: TFaturaLinha.tipoCliente == '2' (organismo). */
  clienteEhOrganismo: boolean
  onApply: (dataDe: string, dataAte: string) => void
}

export function DocumentoFaturaGlobalDatasDialog({
  open,
  onOpenChange,
  dataDe,
  dataAte,
  clienteEhOrganismo,
  onApply,
}: Props) {
  const [de, setDe] = useState(dataDe)
  const [ate, setAte] = useState(dataAte)

  useEffect(() => {
    if (open) {
      setDe(dataDe)
      setAte(dataAte)
    }
  }, [open, dataDe, dataAte])

  const handleConfirm = () => {
    if (!clienteEhOrganismo) {
      toast.error(
        'Fatura global: o cliente tem de ser um organismo (legado: tipoCliente 2).',
      )
      return
    }
    if (!de.trim()) {
      toast.error('Indique a data inicial do intervalo.')
      return
    }
    if (!ate.trim()) {
      toast.error('Indique a data final do intervalo.')
      return
    }
    if (de > ate) {
      toast.error('A data inicial não pode ser posterior à data final.')
      return
    }

    onApply(de, ate)
    onOpenChange(false)
    toast.info(
      'Intervalo global aplicado ao documento. A importação automática de linhas (legado: FaturaGlobalObter) será disponível na Fase D; use Movimentos do Utente ou linhas manuais.',
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Fatura global — intervalo</DialogTitle>
        </DialogHeader>
        <p className='text-muted-foreground text-sm'>
          Legado: <code>modalFaturaGlobal</code> — datas gravadas em{' '}
          <code>FaturaGlobalDataInicio/Fim</code> ao emitir. A grelha de linhas em
          massa depende da API <code>FaturaGlobalObter</code> (ainda não migrada).
        </p>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className={fieldGap}>
            <Label className={labelClass}>Desde</Label>
            <Input
              type='date'
              className={inputClass}
              value={de}
              onChange={(e) => setDe(e.target.value)}
            />
          </div>
          <div className={fieldGap}>
            <Label className={labelClass}>Até</Label>
            <Input
              type='date'
              className={inputClass}
              value={ate}
              onChange={(e) => setAte(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleConfirm}>
            Aplicar intervalo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
