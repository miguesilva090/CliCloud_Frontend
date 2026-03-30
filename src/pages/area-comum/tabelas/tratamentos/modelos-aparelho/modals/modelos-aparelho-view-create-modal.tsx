import { useEffect, useState } from 'react'
import type { ModeloAparelhoTableDTO } from '@/types/dtos/modelo-aparelho/modelo-aparelho.dtos'
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
import { toast } from '@/utils/toast-utils'
import { ModeloAparelhoService } from '@/lib/services/modelo-aparelho'
import { MarcaAparelhoService } from '@/lib/services/marca-aparelho'
import { ResponseStatus } from '@/types/api/responses'
import type { MarcaAparelhoLightDTO } from '@/types/dtos/marca-aparelho/marca-aparelho.dtos'

type ModalMode = 'view' | 'create' | 'edit'

interface ModelosAparelhoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: ModeloAparelhoTableDTO | null
  onSuccess?: () => void
}

export function ModelosAparelhoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: ModelosAparelhoViewCreateModalProps) {
  const [designacao, setDesignacao] = useState('')
  const [marcaAparelhoId, setMarcaAparelhoId] = useState('')
  const [marcas, setMarcas] = useState<MarcaAparelhoLightDTO[]>([])

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open) {
      MarcaAparelhoService()
        .getMarcaAparelhoLight()
        .then((r) => {
          const data = (r.info as { data?: MarcaAparelhoLightDTO[] })?.data ?? []
          setMarcas(Array.isArray(data) ? data : [])
        })
        .catch(() => setMarcas([]))
    }
  }, [open])

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setDesignacao(
        (viewData as { designacao?: string }).designacao ??
          (viewData as { Designacao?: string }).Designacao ??
          ''
      )
      const marcaId =
        (viewData as { marcaAparelhoId?: string }).marcaAparelhoId ??
        (viewData as { MarcaAparelhoId?: string }).MarcaAparelhoId ??
        ''
      setMarcaAparelhoId(marcaId)
    }
    if (open && mode === 'create') {
      setDesignacao('')
      setMarcaAparelhoId('')
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return
    if (!designacao?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }
    if (!marcaAparelhoId) {
      toast.error('Marca é obrigatória.')
      return
    }
    try {
      const client = ModeloAparelhoService()
      const rawId = viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId = typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''
      if (isEdit && (!editId || editId === 'undefined')) {
        toast.error('Não foi possível identificar o registo a atualizar.')
        return
      }
      const body = { designacao: designacao.trim(), marcaAparelhoId }
      if (isEdit && editId) {
        const response = await client.updateModeloAparelho(editId, body)
        const status = (response.info as { status?: number })?.status
        if (status === ResponseStatus.Success) {
          toast.success('Modelo de aparelho atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao atualizar.'
          toast.error(msg)
        }
      } else {
        const response = await client.createModeloAparelho(body)
        const status = (response.info as { status?: number })?.status
        if (status === ResponseStatus.Success) {
          toast.success('Modelo de aparelho criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao criar.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message ?? 'Erro ao guardar.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Modelo de Aparelho</DialogTitle>
          <DialogDescription className='sr-only'>Ver/criar/editar modelo de aparelho.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input readOnly={isView} value={designacao} maxLength={100} placeholder='Designação...' onChange={(e) => setDesignacao(e.target.value)} />
          </div>
          <div className='grid gap-2'>
            <Label>Marca</Label>
            <Select disabled={isView} value={marcaAparelhoId} onValueChange={setMarcaAparelhoId}>
              <SelectTrigger>
                <SelectValue placeholder='Selecionar marca...' />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {(m as { designacao?: string }).designacao ?? (m as { Designacao?: string }).Designacao ?? m.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={() => onOpenChange(false)}>OK</Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type='button' onClick={handleGuardar}>Guardar</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
