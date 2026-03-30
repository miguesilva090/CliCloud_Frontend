import { useEffect, useState } from 'react'
import type { MedicoExternoTableDTO } from '@/types/dtos/saude/medicos-externos.dtos'
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
import { toast } from '@/utils/toast-utils'
import { MedicoExternoService } from '@/lib/services/saude/medico-externo-service'
import { ResponseStatus } from '@/types/api/responses'

/** EntidadeTipo.MedicoExterno = 3 */
const TIPO_ENTIDADE_MEDICO_EXTERNO = 3

type ModalMode = 'view' | 'create' | 'edit'

interface MedicoExternoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: MedicoExternoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  nome: string
  carteira: string
  numeroContribuinte: string
}

export function MedicoExternoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: MedicoExternoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    nome: '',
    carteira: '',
    numeroContribuinte: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        nome: viewData.nome ?? '',
        carteira: viewData.carteira ?? '',
        numeroContribuinte: viewData.numeroContribuinte ?? '',
      })
    }
    if (open && mode === 'create') {
      setValues({
        nome: '',
        carteira: '',
        numeroContribuinte: '',
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.nome?.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }

    try {
      const client = MedicoExternoService('medicos-externos')

      const body = {
        nome: values.nome.trim(),
        tipoEntidadeId: TIPO_ENTIDADE_MEDICO_EXTERNO,
        carteira: values.carteira?.trim() || undefined,
        numeroContribuinte: values.numeroContribuinte?.trim() || undefined,
      }

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

      const response =
        isEdit && viewData && editId
          ? await client.updateMedicoExterno(editId, body)
          : await client.createMedicoExterno(body)

      if (response.info?.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Médico externo atualizado com sucesso.'
            : 'Médico externo criado com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Médico Externo.'
            : 'Falha ao criar Médico Externo.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Médico Externo.'
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Médicos Externos'
      : mode === 'edit'
        ? 'Editar Médico Externo'
        : 'Adicionar Médico Externo'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar médico externo.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4 max-h-[60vh] overflow-y-auto'>
          <div className='grid gap-2'>
            <Label>Nome</Label>
            <Input
              readOnly={isView}
              value={values.nome}
              maxLength={200}
              placeholder='Nome...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, nome: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Carteira Profissional</Label>
            <Input
              readOnly={isView}
              value={values.carteira}
              maxLength={100}
              placeholder='Carteira profissional...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, carteira: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>Nr. Contribuinte</Label>
            <Input
              readOnly={isView}
              value={values.numeroContribuinte}
              maxLength={20}
              placeholder='Nº contribuinte...'
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  numeroContribuinte: e.target.value,
                }))
              }
            />
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
              <Button type='button' onClick={handleGuardar} size='sm' className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                Gravar Médico Externo
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
