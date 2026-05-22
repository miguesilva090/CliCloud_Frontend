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
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import { toTimeSpan } from './marcacao-administrativo-form-utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: MarcacaoAdministrativoTableDTO | null
  listPermId: string
  onSaved?: () => void
}

function isoDateFromRow(row: MarcacaoAdministrativoTableDTO | null): string {
  if (!row?.data) return ''
  const d = new Date(row.data)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function horaFromRow(row: MarcacaoAdministrativoTableDTO | null): string {
  if (!row?.horaInicio) return ''
  const parts = row.horaInicio.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return row.horaInicio
}

export function MarcacaoAdministrativoMudarHorarioModal({
  open,
  onOpenChange,
  row,
  listPermId,
  onSaved,
}: Props) {
  const [data, setData] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && row) {
      setData(isoDateFromRow(row))
      setHoraInicio(horaFromRow(row))
    }
  }, [open, row])

  const handleSave = async () => {
    if (!row?.id) return
    if (!data || !horaInicio) {
      toast.error('Indique data e hora.')
      return
    }

    setSaving(true)
    try {
      const res = await MarcacoesAdministrativoService(listPermId).mudarHorario(row.id, {
        data: `${data}T00:00:00`,
        horaInicio: toTimeSpan(horaInicio) as string,
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Horário atualizado.')
        onOpenChange(false)
        onSaved?.()
      } else {
        const msg =
          res.info?.messages?.['$']?.[0] ??
          Object.values(res.info?.messages ?? {})[0]?.[0] ??
          'Não foi possível alterar o horário.'
        toast.error(msg)
      }
    } catch {
      toast.error('Não foi possível alterar o horário.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Mudar horário</DialogTitle>
        </DialogHeader>
        <div className='grid gap-3'>
          <div className='space-y-1'>
            <Label>Data</Label>
            <Input type='date' value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className='space-y-1'>
            <Label>Hora</Label>
            <Input type='time' value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' disabled={saving} onClick={handleSave}>
            {saving ? 'A guardar…' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
