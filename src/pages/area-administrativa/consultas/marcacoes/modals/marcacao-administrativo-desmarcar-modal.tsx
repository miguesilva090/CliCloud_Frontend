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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: MarcacaoAdministrativoTableDTO | null
  listPermId: string
  onDesmarcada?: () => void
}

export function MarcacaoAdministrativoDesmarcarModal({
  open,
  onOpenChange,
  row,
  listPermId,
  onDesmarcada,
}: Props) {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setMotivo('')
  }, [open, row?.id])

  const utenteLabel = row
    ? [row.utenteNumero, row.utenteNome].filter(Boolean).join(' — ')
    : ''

  const handleConfirmar = async () => {
    if (!row?.id) return
    const texto = motivo.trim()
    if (!texto) {
      toast.error('Indique o motivo da desmarcação.')
      return
    }

    setSaving(true)
    try {
      const res = await MarcacoesAdministrativoService(listPermId).desmarcar(row.id, {
        motivo: texto,
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Marcação desmarcada.')
        onOpenChange(false)
        onDesmarcada?.()
      } else {
        const msg =
          res.info?.messages?.['$']?.[0] ??
          Object.values(res.info?.messages ?? {})[0]?.[0] ??
          'Não foi possível desmarcar a marcação.'
        toast.error(msg)
      }
    } catch {
      toast.error('Não foi possível desmarcar a marcação.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Desmarcar marcação</DialogTitle>
          <DialogDescription>
            {utenteLabel
              ? `Utente: ${utenteLabel}`
              : 'Confirme o motivo da desmarcação (legado MarcacoesLst).'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='motivo-desmarcar-marcacao'>Motivo</Label>
          <Textarea
            id='motivo-desmarcar-marcacao'
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            maxLength={500}
          />
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' variant='destructive' disabled={saving} onClick={handleConfirmar}>
            {saving ? 'A guardar…' : 'Desmarcar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
