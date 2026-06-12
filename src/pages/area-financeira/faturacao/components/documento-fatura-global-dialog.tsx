import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fieldGap, inputClass, labelClass } from '@/lib/form-styles'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import type { FaturaGlobalObterResponse } from '@/types/dtos/faturacao/documento-emissao.dtos'
import { useFaturaGlobalObterMutation } from '../queries/documento-editor-queries'

const TIPOS_FATURA = [
  { value: 'Consultas', label: 'Consultas' },
  { value: 'Consultas e Tratamentos', label: 'Consultas e Tratamentos' },
] as const

function parseDataIso(iso: string): Date | undefined {
  if (!iso.trim()) return undefined
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organismoId: string | null
  dataDe: string
  dataAte: string
  onApply: (data: FaturaGlobalObterResponse) => void
}

export function DocumentoFaturaGlobalDialog({
  open,
  onOpenChange,
  organismoId,
  dataDe: dataDeProp,
  dataAte: dataAteProp,
  onApply,
}: Props) {
  const [dataDe, setDataDe] = useState(dataDeProp)
  const [dataAte, setDataAte] = useState(dataAteProp)
  const [tipoFatura, setTipoFatura] = useState<string>(TIPOS_FATURA[0].value)
  const [opcaoTipo, setOpcaoTipo] = useState('1')

  const obterMutation = useFaturaGlobalObterMutation()

  useEffect(() => {
    if (!open) return
    setDataDe(dataDeProp)
    setDataAte(dataAteProp)
    setTipoFatura(TIPOS_FATURA[0].value)
    setOpcaoTipo('2')
  }, [open, dataDeProp, dataAteProp])

  const handleConfirm = async () => {
    if (!organismoId) {
      toast.error('Indique o organismo no separador Cliente antes de aplicar a fatura global.')
      return
    }
    if (!dataDe.trim()) {
      toast.error('Indique a data inicial do intervalo.')
      return
    }
    if (!dataAte.trim()) {
      toast.error('Indique a data final do intervalo.')
      return
    }
    if (dataDe > dataAte) {
      toast.error('A data inicial não pode ser posterior à data final.')
      return
    }

    const res = await obterMutation.mutateAsync({
      organismoId,
      tipoFatura,
      dataDe,
      dataAte,
      opcaoTipo: Number(opcaoTipo),
    })

    if (res.info?.status !== ResponseStatus.Success || !res.info.data) {
      const msg =
        res.info?.messages?.$?.[0] ??
        res.info?.messages?.['']?.[0] ??
        'Não foi possível obter a fatura global.'
      toast.error(msg)
      return
    }

    onApply(res.info.data)
    onOpenChange(false)
    toast.success('Linhas da fatura global aplicadas ao documento.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Fatura global</DialogTitle>
        </DialogHeader>
        <p className='text-muted-foreground text-sm'>
          Importa admissões do organismo no intervalo indicado. Para SAD GNR, a admissão
          tem de ter o recibo (FR) emitido antes de faturar ao organismo.
        </p>
        <div className='grid gap-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className={fieldGap}>
              <Label className={labelClass}>Desde</Label>
              <DatePicker
                value={parseDataIso(dataDe)}
                onChange={(date) =>
                  setDataDe(date ? format(date, 'yyyy-MM-dd') : '')
                }
                placeholder='Data inicial'
                displayFormat='dd-MM-yyyy'
                className={inputClass}
              />
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Até</Label>
              <DatePicker
                value={parseDataIso(dataAte)}
                onChange={(date) =>
                  setDataAte(date ? format(date, 'yyyy-MM-dd') : '')
                }
                placeholder='Data final'
                displayFormat='dd-MM-yyyy'
                className={inputClass}
              />
            </div>
          </div>
          <div className={fieldGap}>
            <Label className={labelClass}>Tipo de fatura</Label>
            <Select value={tipoFatura} onValueChange={setTipoFatura}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder='Tipo' />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_FATURA.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className={fieldGap}>
            <Label className={labelClass}>Opção</Label>
            <Select value={opcaoTipo} onValueChange={setOpcaoTipo}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='2'>Por admissão</SelectItem>
                <SelectItem value='1'>Resumo (linha única)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={() => void handleConfirm()}
            disabled={obterMutation.isPending || !organismoId}
          >
            {obterMutation.isPending ? 'A carregar…' : 'Aplicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
