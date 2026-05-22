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
import { Checkbox } from '@/components/ui/checkbox'
import { ListaEsperaAdministrativoService } from '@/lib/services/consultas/lista-espera-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { toTimeSpan } from './lista-espera-form-utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  listaEsperaId: string | null
  utenteLabel?: string
  defaultHoraInicio?: string
  listPermId: string
  onConverted?: (marcacaoId: string) => void
}

export function ListaEsperaConverterMarcacaoModal({
  open,
  onOpenChange,
  listaEsperaId,
  utenteLabel,
  defaultHoraInicio = '',
  listPermId,
  onConverted,
}: Props) {
  const [horaInicio, setHoraInicio] = useState(defaultHoraInicio)
  const [horaFim, setHoraFim] = useState('')
  const [manterNaLista, setManterNaLista] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleOpen = (next: boolean) => {
    if (next) {
      setHoraInicio(defaultHoraInicio)
      setHoraFim('')
      setManterNaLista(false)
    }
    onOpenChange(next)
  }

  const handleConverter = async () => {
    if (!listaEsperaId) return
    const hi = toTimeSpan(horaInicio)
    if (!hi) {
      toast.error('Indique a hora de início.')
      return
    }

    setSaving(true)
    try {
      const res = await ListaEsperaAdministrativoService(listPermId).converterMarcacao(
        listaEsperaId,
        {
          horaInicio: hi,
          horaFim: toTimeSpan(horaFim),
          manterNaListaEspera: manterNaLista,
        }
      )
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        toast.success('Marcação criada a partir da lista de espera.')
        onConverted?.(res.info.data.consultaMarcacaoId)
        handleOpen(false)
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível converter.')
      }
    } catch {
      toast.error('Erro ao converter para marcação.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            Converter em marcação{utenteLabel ? ` — ${utenteLabel}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-3'>
          <div>
            <Label>Hora início</Label>
            <Input
              type='time'
              className='mt-1'
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>
          <div>
            <Label>Hora fim (opcional)</Label>
            <Input
              type='time'
              className='mt-1'
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
            />
          </div>
          <label className='flex items-center gap-2 text-sm'>
            <Checkbox
              checked={manterNaLista}
              onCheckedChange={(v) => setManterNaLista(v === true)}
            />
            Manter registo na lista de espera
          </label>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => handleOpen(false)}>
            Cancelar
          </Button>
          <Button type='button' disabled={saving} onClick={handleConverter}>
            {saving ? 'A converter…' : 'Converter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
