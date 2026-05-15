import { useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { LoteDirectService } from '@/lib/services/credenciais/lote-direct-service'
import { useLoteDirectFuncionalidadeId } from '../queries/listagem-lote-direct-queries'

const MESES = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

export function CorrigirLotesModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const permId = useLoteDirectFuncionalidadeId()
  const now = new Date()
  const [mes, setMes] = useState(String(now.getMonth() + 1))
  const [ano, setAno] = useState(String(now.getFullYear()))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const current = new Date()
    setMes(String(current.getMonth() + 1))
    setAno(String(current.getFullYear()))
  }, [open])

  const handleConfirm = async () => {
    const mesNumero = Number(mes)
    const anoNumero = Number(ano)

    if (!Number.isInteger(mesNumero) || mesNumero < 1 || mesNumero > 12) {
      toast.error('Selecione um mês válido.')
      return
    }

    if (!Number.isInteger(anoNumero) || anoNumero < 1900) {
      toast.error('Indique um ano válido.')
      return
    }

    setSubmitting(true)
    try {
      const response = await LoteDirectService(permId).corrigirLotes({
        mes: mesNumero,
        ano: anoNumero,
      })

      if (response.info.status === ResponseStatus.Success) {
        toast.success('Lotes corrigidos com sucesso.')
        onOpenChange(false)
        onSuccess?.()
        return
      }

      toast.error(
        response.info.messages?.['$']?.[0] ?? 'Não foi possível corrigir os lotes.'
      )
    } catch (error: unknown) {
      toast.error(
        (error as Error)?.message ?? 'Ocorreu um erro ao corrigir os lotes.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Corrigir Lotes</DialogTitle>
          <DialogDescription className='sr-only'>
            Corrigir lotes automáticos para o mês e ano selecionados.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <Label htmlFor='corrigir-lotes-mes'>Mês</Label>
            <Select value={mes} onValueChange={setMes}>
              <SelectTrigger id='corrigir-lotes-mes'>
                <SelectValue placeholder='Selecione o mês' />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='corrigir-lotes-ano'>Ano</Label>
            <Input
              id='corrigir-lotes-ano'
              type='number'
              min={1900}
              value={ano}
              onChange={(event) => setAno(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type='button' onClick={() => void handleConfirm()} disabled={submitting}>
            {submitting ? 'A corrigir...' : 'Corrigir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
