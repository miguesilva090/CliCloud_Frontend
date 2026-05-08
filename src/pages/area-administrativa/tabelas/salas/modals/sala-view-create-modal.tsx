import { useEffect, useState } from 'react'
import type { SalaTableDTO } from '@/types/dtos/consultas/sala.dtos'
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
import { Switch } from '@/components/ui/switch'
import { toast } from '@/utils/toast-utils'
import { SalaService } from '@/lib/services/consultas/sala-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: SalaTableDTO | null
  onSuccess?: () => void
}

export function SalaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: Props) {
  const [nome, setNome] = useState('')
  const [numeroSala, setNumeroSala] = useState(0)
  const [clinicaId, setClinicaId] = useState('')
  const [ativa, setAtiva] = useState(true)
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return
    if ((isView || isEdit) && viewData) {
      setNome(viewData.nome ?? '')
      setNumeroSala(viewData.numeroSala ?? 0)
      setClinicaId(viewData.clinicaId ?? '')
      setAtiva(Boolean(viewData.ativa))
    } else {
      setNome('')
      setNumeroSala(0)
      setClinicaId('')
      setAtiva(true)
    }
  }, [open, isView, isEdit, viewData])

  const handleSave = async () => {
    if (isView) return
    if (!nome.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }
    if (!clinicaId.trim()) {
      toast.error('ClinicaId é obrigatório.')
      return
    }

    try {
      const payload = {
        Nome: nome.trim(),
        NumeroSala: Number(numeroSala),
        ClinicaId: clinicaId.trim(),
        Ativa: ativa,
      }
      const client = SalaService()
      const response = isEdit && viewData?.id
        ? await client.updateSala(viewData.id, payload)
        : await client.createSala(payload)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(isEdit ? 'Sala atualizada.' : 'Sala criada.')
        onOpenChange(false)
        onSuccess?.()
        return
      }
      toast.error(response.info.messages?.['$']?.[0] ?? 'Falha ao guardar sala.')
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Erro ao guardar sala.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' ? 'Sala' : mode === 'edit' ? 'Editar Sala' : 'Adicionar Sala'}
          </DialogTitle>
          <DialogDescription className='sr-only'>Formulário de sala.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Nome</Label>
            <Input readOnly={isView} value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className='grid gap-2'>
            <Label>Número Sala</Label>
            <Input
              readOnly={isView}
              type='number'
              value={numeroSala}
              onChange={(e) => setNumeroSala(Number(e.target.value))}
            />
          </div>
          <div className='grid gap-2'>
            <Label>ClinicaId</Label>
            <Input readOnly={isView} value={clinicaId} onChange={(e) => setClinicaId(e.target.value)} />
          </div>
          <div className='flex items-center justify-between rounded border p-3'>
            <Label className='mb-0'>Ativa</Label>
            <Switch checked={ativa} onCheckedChange={setAtiva} disabled={isView} />
          </div>
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={() => onOpenChange(false)}>OK</Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type='button' onClick={handleSave}>OK</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
