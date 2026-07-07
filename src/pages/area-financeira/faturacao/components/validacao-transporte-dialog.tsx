import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DateField } from '@/components/shared/date-field'
import { TimeField } from '@/components/shared/time-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/utils/toast-utils'
import type {
  AtualizarValidacaoTransporteRequest,
  DocumentoTableDTO,
} from '@/types/dtos/faturacao/documento.dtos'

export function ValidacaoTransporteDialog({
  documento,
  isSaving,
  onSave,
  onOpenChange,
}: {
  documento: DocumentoTableDTO | null
  isSaving?: boolean
  onSave: (payload: AtualizarValidacaoTransporteRequest) => Promise<void>
  onOpenChange: (open: boolean) => void
}) {
  const [codigo, setCodigo] = useState('')
  const [dataTransporte, setDataTransporte] = useState('')
  const [horaTransporte, setHoraTransporte] = useState('')
  const handleSave = async () => {
    if (!documento) return
    if (!codigo.trim()) {
      toast.error('Código de validação é obrigatório.')
      return
    }

    try {
      await onSave({
        codigoValidacaoTransporte: codigo.trim(),
        dataTransporte: dataTransporte || null,
        horaTransporte: horaTransporte || null,
      })
      toast.success('Validação de transporte guardada com sucesso.')
      onOpenChange(false)
      setCodigo('')
      setDataTransporte('')
      setHoraTransporte('')
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Falha ao guardar validação de transporte.'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={!!documento} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Validação de Transporte</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Código de validação *</Label>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder='Ex.: AT123456789'
            />
          </div>
          <div className='space-y-2'>
            <Label>Data transporte</Label>
            <DateField
              value={dataTransporte}
              onChange={setDataTransporte}
            />
          </div>
          <div className='space-y-2'>
            <Label>Hora transporte</Label>
            <TimeField
              value={horaTransporte}
              onChange={setHoraTransporte}
              placeholder='Hora'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!!isSaving}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
