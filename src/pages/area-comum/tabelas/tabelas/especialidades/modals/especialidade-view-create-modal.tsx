import { useEffect, useState } from 'react'
import type { EspecialidadeTableDTO } from '@/types/dtos/especialidades/especialidade.dtos'
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/utils/toast-utils'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface EspecialidadeViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: EspecialidadeTableDTO | null
  onSuccess?: () => void
}

/** Apenas Designação e Globalbooking (como no legado). Id/Guid não é exibido ao cliente. */
type FormValues = {
  nome: string
  globalbooking: boolean
}

export function EspecialidadeViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: EspecialidadeViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    nome: '',
    globalbooking: false,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        nome: viewData.nome ?? '',
        globalbooking: viewData.globalbooking ?? false,
      })
    }
    if (open && mode === 'create') {
      setValues({
        nome: '',
        globalbooking: false,
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.nome?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    try {
      const client = EspecialidadeService()

      // Backend espera: Nome, CategoriaEspecialidadeId?, Fisioterapia, Atendimento, Globalbooking
      // UI mostra só Designação e Globalbooking; em create usamos valores por defeito; em update preservamos o que já existe
      const body = {
        Nome: values.nome.trim(),
        CategoriaEspecialidadeId:
          isEdit && viewData?.categoriaEspecialidadeId != null
            ? viewData.categoriaEspecialidadeId
            : (null as string | null),
        Fisioterapia: isEdit && viewData ? viewData.fisioterapia : false,
        Atendimento: isEdit && viewData ? viewData.atendimento : false,
        Globalbooking: values.globalbooking,
      }

      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      if (isEdit && (!editId || editId === 'undefined')) {
        toast.error(
          'Não foi possível identificar o registo a atualizar. Feche e abra novamente a edição.',
        )
        return
      }

      const response =
        isEdit && viewData && editId
          ? await client.updateEspecialidade(editId, body)
          : await client.createEspecialidade(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Especialidade atualizada com sucesso.'
            : 'Especialidade criada com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Especialidade.'
            : 'Falha ao criar Especialidade.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a Especialidade.')
    }
  }

  const title =
    mode === 'view'
      ? 'Especialidade'
      : mode === 'edit'
        ? 'Editar Especialidade'
        : 'Adicionar Especialidade'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar especialidade (designação e globalbooking).
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Designação</Label>
            <Input
              readOnly={isView}
              value={values.nome}
              maxLength={30}
              placeholder='Designação...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, nome: e.target.value }))
              }
            />
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='globalbooking'
              checked={values.globalbooking}
              disabled={isView}
              onCheckedChange={(checked) =>
                setValues((prev) => ({
                  ...prev,
                  globalbooking: checked === true,
                }))
              }
            />
            <Label htmlFor='globalbooking' className='cursor-pointer'>
              Globalbooking
            </Label>
          </div>
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={handleClose}>
              OK
            </Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar}>
                Guardar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

