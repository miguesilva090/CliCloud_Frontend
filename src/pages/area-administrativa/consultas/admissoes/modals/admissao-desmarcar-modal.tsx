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
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: AdmissaoTableDTO | null
  listPermId: string
  onDesmarcada?: () => void
}

export function AdmissaoDesmarcarModal({
  open,
  onOpenChange,
  row,
  listPermId,
  onDesmarcada,
}: Props) {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setMotivo('')
    }
  }, [open, row?.id])

  const utenteLabel = row
    ? [row.utenteNumero, row.utenteNome].filter(Boolean).join(' — ')
    : ''

  const handleConfirmar = async () => {
    if (!row?.id) {
      return
    }

    const texto = motivo.trim()
    if (!texto) {
      toast.error('Indique o motivo da desmarcação.')
      return
    }

    setSaving(true)
    try {
      const res = await AdmissaoAdministrativoService(listPermId).desmarcar(row.id, {
        motivo: texto,
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Admissão desmarcada.')
        onOpenChange(false)
        onDesmarcada?.()
      } else {
        toast.error(res.info?.messages?.[0] ?? 'Não foi possível desmarcar a admissão.')
      }
    } catch {
      toast.error('Não foi possível desmarcar a admissão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Desmarcar admissão</DialogTitle>
          <DialogDescription>
            {utenteLabel
              ? `Confirma que pretende desmarcar a admissão de ${utenteLabel}? O registo deixa de aparecer na lista do dia.`
              : 'Confirma que pretende desmarcar esta admissão? O registo deixa de aparecer na lista do dia.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-2 py-2'>
          <Label htmlFor='motivo-desmarcar'>Motivo</Label>
          <Textarea
            id='motivo-desmarcar'
            rows={4}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder='Indique o motivo da desmarcação…'
            disabled={saving}
          />
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={() => void handleConfirmar()}
            disabled={saving}
          >
            {saving ? 'A desmarcar…' : 'Desmarcar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
