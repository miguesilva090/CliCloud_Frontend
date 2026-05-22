import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { OrdemEntradaTableDTO } from '@/types/dtos/consultas/ordem-entrada.dtos'

export function OrdemEntradaAnularModal({
  open,
  onOpenChange,
  row,
  listPermId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: OrdemEntradaTableDTO | null
  listPermId: string
  onSaved?: () => void
}) {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!row?.id) return
    if (!motivo.trim()) {
      toast.error('Indique o motivo da anulação.')
      return
    }

    setSaving(true)
    try {
      const res = await AdmissaoAdministrativoService(listPermId).anularOrdemEntrada(row.id, {
        motivo: motivo.trim(),
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Ordem anulada.')
        setMotivo('')
        onOpenChange(false)
        onSaved?.()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível anular.')
      }
    } catch {
      toast.error('Erro ao anular ordem.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            Anular ordem{row?.utenteNome ? ` — ${row.utenteNome}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div>
          <Label>Motivo</Label>
          <Textarea
            className='mt-1'
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' variant='destructive' disabled={saving} onClick={handleSave}>
            {saving ? 'A anular…' : 'Anular'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
