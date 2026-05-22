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
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { OrdemEntradaTableDTO } from '@/types/dtos/consultas/ordem-entrada.dtos'

export function OrdemEntradaDefinirOrdemModal({
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
  const [ordem, setOrdem] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && row) {
      setOrdem(row.ordem != null ? String(row.ordem) : '')
    }
  }, [open, row])

  const handleSave = async () => {
    if (!row?.id) return
    const n = parseInt(ordem, 10)
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Indique uma ordem válida (número positivo).')
      return
    }

    setSaving(true)
    try {
      const res = await AdmissaoAdministrativoService(listPermId).definirOrdemEntrada(row.id, {
        ordem: n,
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Ordem definida.')
        onOpenChange(false)
        onSaved?.()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível definir a ordem.')
      }
    } catch {
      toast.error('Erro ao definir ordem.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-sm'>
        <DialogHeader>
          <DialogTitle>
            Ordem de entrada{row?.utenteNome ? ` — ${row.utenteNome}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div>
          <Label>Nº ordem</Label>
          <Input
            type='number'
            min={1}
            className='mt-1'
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
          />
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
