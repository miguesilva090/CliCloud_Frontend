import { useEffect, useState } from 'react'
import type { BancoTableDTO } from '@/types/dtos/utility/banco.dtos'
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
import { toast } from '@/utils/toast-utils'
import { BancosService } from '@/lib/services/utility/bancos-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface BancoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: BancoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  nome: string
  abreviatura: string
}

export function BancoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: BancoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    nome: '',
    abreviatura: '',
  })

  const isView = mode === 'view'

  useEffect(() => {
    if (open && (mode === 'view' || mode === 'edit') && viewData) {
      setValues({
        nome: viewData.nome ?? '',
        abreviatura: viewData.abreviatura ?? '',
      })
    }
    if (open && mode === 'create') {
      setValues({
        nome: '',
        abreviatura: '',
      })
    }
  }, [open, mode, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.nome) {
      toast.error('Descrição é obrigatória.')
      return
    }

    try {
      const client = BancosService('bancos')

      const body = {
        Nome: values.nome,
        TipoEntidadeId: 11, // Banco
        Abreviatura: values.abreviatura || undefined,
      }

      const response =
        mode === 'edit' && viewData
          ? await client.updateBanco(viewData.id, body)
          : await client.createBanco(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          mode === 'edit'
            ? 'Banco atualizado com sucesso.'
            : 'Banco criado com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (mode === 'edit' ? 'Falha ao atualizar Banco.' : 'Falha ao criar Banco.')
        toast.error(msg)
      }
    } catch (error: any) {
      toast.error(error?.message ?? 'Ocorreu um erro ao criar o Banco.')
    }
  }

  const title =
    mode === 'view' ? 'Banco' : mode === 'edit' ? 'Editar Banco' : 'Adicionar Banco'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input
              readOnly={isView}
              value={values.nome}
              onChange={(e) => setValues((p) => ({ ...p, nome: e.target.value }))}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Abreviatura</Label>
            <Input
              readOnly={isView}
              value={values.abreviatura}
              onChange={(e) =>
                setValues((p) => ({ ...p, abreviatura: e.target.value }))
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

