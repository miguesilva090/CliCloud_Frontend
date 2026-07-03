import { useEffect, useState } from 'react'
import type { EstadosDentariosTableDTO } from '@/types/dtos/odontologia/estados-dentarios.dtos'
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
import { EstadosDentariosService } from '@/lib/services/processo-clinico/odontologia/estados-dentarios-service'
import { ResponseStatus } from '@/types/api/responses'
import { modules } from '@/config/modules'

type ModalMode = 'view' | 'create' | 'edit'

interface EstadoDentarioViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: EstadosDentariosTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  descricao: string
  estadoPadrao: boolean
  ativo: boolean
}

const permId = modules.areaClinica.permissions.estadosDentarios.id

export function EstadoDentarioViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: EstadoDentarioViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    codigo: '',
    descricao: '',
    estadoPadrao: false,
    ativo: true,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        codigo: viewData.codigo ?? '',
        descricao: viewData.descricao ?? '',
        estadoPadrao: viewData.estadoPadrao ?? false,
        ativo: viewData.ativo ?? true,
      })
    }
    if (open && mode === 'create') {
      setValues({
        codigo: '',
        descricao: '',
        estadoPadrao: false,
        ativo: true,
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.codigo?.trim()) {
      toast.error('Código é obrigatório.')
      return
    }
    if (!values.descricao?.trim()) {
      toast.error('Descrição é obrigatória.')
      return
    }

    try {
      const client = EstadosDentariosService(permId)
      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      if (isEdit && (!editId || editId === 'undefined')) {
        toast.error(
          'Não foi possível identificar o registo a atualizar. Feche e abra novamente a edição.'
        )
        return
      }

      if (isEdit && editId) {
        const response = await client.update(editId, {
          codigo: values.codigo.trim(),
          descricao: values.descricao.trim(),
          estadoPadrao: values.estadoPadrao,
          ativo: values.ativo,
        })
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Estado dentário atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar estado dentário.'
          toast.error(msg)
        }
      } else {
        const response = await client.create({
          codigo: values.codigo.trim(),
          descricao: values.descricao.trim(),
          estadoPadrao: values.estadoPadrao,
        })
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Estado dentário criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao criar estado dentário.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o estado dentário.')
    }
  }

  const title =
    mode === 'view'
      ? 'Estado Dentário'
      : mode === 'edit'
        ? 'Editar Estado Dentário'
        : 'Adicionar Estado Dentário'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar estado dentário.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Código</Label>
            <Input
              readOnly={isView}
              value={values.codigo}
              maxLength={10}
              placeholder='Código...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, codigo: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input
              readOnly={isView}
              value={values.descricao}
              maxLength={200}
              placeholder='Descrição...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, descricao: e.target.value }))
              }
            />
          </div>
          <div className='flex items-center justify-between gap-4'>
            <Label htmlFor='estado-padrao'>Estado Padrão</Label>
            <Switch
              id='estado-padrao'
              disabled={isView}
              checked={values.estadoPadrao}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, estadoPadrao: Boolean(checked) }))
              }
            />
          </div>
          {isEdit || isView ? (
            <div className='flex items-center justify-between gap-4'>
              <Label htmlFor='ativo'>Ativo</Label>
              <Switch
                id='ativo'
                disabled={isView}
                checked={values.ativo}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({ ...prev, ativo: Boolean(checked) }))
                }
              />
            </div>
          ) : null}
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={() => onOpenChange(false)}>
              OK
            </Button>
          ) : (
            <>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar}>
                OK
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
