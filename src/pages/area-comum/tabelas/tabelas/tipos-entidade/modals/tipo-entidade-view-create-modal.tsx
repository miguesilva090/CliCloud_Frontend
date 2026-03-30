import { useState, useEffect } from 'react'
import type {
  TipoEntidadeFinanceiraTableDTO,
  CreateTipoEntidadeFinanceiraDTO,
  UpdateTipoEntidadeFinanceiraDTO,
} from '@/types/dtos/utility/tipo-entidade-financeira.dtos'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TipoEntidadeFinanceiraService } from '@/lib/services/utility/tipo-entidade-financeira-service'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

type ModalMode = 'view' | 'create' | 'edit'

interface TipoEntidadeViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: TipoEntidadeFinanceiraTableDTO | null
  onSuccess?: () => void
}

export function TipoEntidadeViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: TipoEntidadeViewCreateModalProps) {
  const [values, setValues] = useState<CreateTipoEntidadeFinanceiraDTO>({
    sigla: '',
    designacao: '',
    dominio: '',
    descricaoDominio: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isEdit || isView) && viewData) {
      setValues({
        sigla: viewData.sigla ?? '',
        designacao: viewData.designacao ?? '',
        dominio: viewData.dominio ?? '',
        descricaoDominio: viewData.descricaoDominio ?? '',
      })
    }
    if (open && mode === 'create') {
      setValues({
        sigla: '',
        designacao: '',
        dominio: '',
        descricaoDominio: '',
      })
    }
  }, [open, mode, viewData, isEdit, isView])

  const handleOk = () => {
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setValues({
      sigla: '',
      designacao: '',
      dominio: '',
      descricaoDominio: '',
    })
  }

  const handleGuardar = async () => {
    if (
      !values.sigla.trim() ||
      !values.designacao.trim() ||
      !values.dominio.trim() ||
      !values.descricaoDominio.trim()
    ) {
      toast.error('Preencha Sigla, Designação, Domínio e Descrição.')
      return
    }

    try {
      if (isEdit && viewData?.id) {
        const payload: UpdateTipoEntidadeFinanceiraDTO = {
          ...values,
          id: viewData.id,
        }
        const response = await TipoEntidadeFinanceiraService(
          'tipos-entidade',
        ).updateTipoEntidade(viewData.id, payload)
        const result = handleApiResponse(
          response,
          'Tipo de Entidade atualizado com sucesso',
          'Erro ao atualizar Tipo de Entidade',
          'Tipo de Entidade atualizado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          onSuccess?.()
        }
      } else {
        const response = await TipoEntidadeFinanceiraService(
          'tipos-entidade',
        ).createTipoEntidade(values)
        const result = handleApiResponse(
          response,
          'Tipo de Entidade adicionado com sucesso',
          'Erro ao adicionar Tipo de Entidade',
          'Tipo de Entidade adicionado com avisos',
        )
        if (result.success) {
          onOpenChange(false)
          onSuccess?.()
        }
      }
    } catch {
      toast.error(
        isEdit ? 'Erro ao atualizar Tipo de Entidade' : 'Erro ao adicionar Tipo de Entidade',
      )
    }
  }

  const title = isView
    ? 'Tipos de Entidade'
    : isEdit
      ? 'Editar Tipo de Entidade'
      : 'Adicionar Tipo de Entidade'

  const isSaving = false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          {isView && viewData ? (
            <>
              <div className='grid gap-2'>
                <Label>Sigla</Label>
                <Input readOnly value={viewData.sigla ?? ''} className='bg-muted' />
              </div>
              <div className='grid gap-2'>
                <Label>Designação</Label>
                <Input
                  readOnly
                  value={viewData.designacao ?? ''}
                  className='bg-muted'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Domínio</Label>
                <Input readOnly value={viewData.dominio ?? ''} className='bg-muted' />
              </div>
              <div className='grid gap-2'>
                <Label>Descrição Domínio</Label>
                <Input
                  readOnly
                  value={viewData.descricaoDominio ?? ''}
                  className='bg-muted'
                />
              </div>
            </>
          ) : (
            <>
              <div className='grid gap-2'>
                <Label>Sigla</Label>
                <Input
                  value={values.sigla}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, sigla: e.target.value }))
                  }
                  placeholder='Sigla'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Designação</Label>
                <Input
                  value={values.designacao}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, designacao: e.target.value }))
                  }
                  placeholder='Designação'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Domínio</Label>
                <Input
                  value={values.dominio}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, dominio: e.target.value }))
                  }
                  placeholder='Domínio'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Descrição Domínio</Label>
                <Input
                  value={values.descricaoDominio}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, descricaoDominio: e.target.value }))
                  }
                  placeholder='Descrição do Domínio'
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={handleOk}>
              OK
            </Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar} disabled={isSaving}>
                {isSaving ? 'A guardar...' : 'Guardar'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

