import { useEffect, useState } from 'react'
import type {
  PatologiaTableDTO,
  PatologiaDTO,
  CreatePatologiaRequest,
} from '@/types/dtos/patologias/patologia.dtos'
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
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/utils/toast-utils'
import { PatologiaService } from '@/lib/services/patologias/patologia-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface PatologiaViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: PatologiaTableDTO | null
  fullData?: PatologiaDTO | null
  onSuccess?: () => void
}

type FormValues = {
  designacao: string
  localTratamentoId: string
  organismoId: string
  especificacaoTecnica: string
  doencas: string
  inativo: boolean
}

export function PatologiaViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  fullData: initialFullData,
  onSuccess,
}: PatologiaViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    designacao: '',
    localTratamentoId: '',
    organismoId: '',
    especificacaoTecnica: '',
    doencas: '',
    inativo: false,
  })
  const [fullData, setFullData] = useState<PatologiaDTO | null>(null)
  const [loading, setLoading] = useState(false)

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      const id = viewData.id ?? (viewData as { Id?: string }).Id
      if (id && !initialFullData) {
        setLoading(true)
        PatologiaService()
          .getPatologiaById(String(id))
          .then((res) => {
            if (res.info?.data) {
              const d = res.info.data as PatologiaDTO
              setFullData(d)
              setValues({
                designacao: d.designacao ?? '',
                localTratamentoId: d.localTratamentoId ?? '',
                organismoId: d.organismoId ?? '',
                especificacaoTecnica: d.especificacaoTecnica ?? '',
                doencas: d.doencas ?? '',
                inativo: d.inativo ?? false,
              })
            }
          })
          .finally(() => setLoading(false))
      } else if (initialFullData) {
        setFullData(initialFullData)
        setValues({
          designacao: initialFullData.designacao ?? '',
          localTratamentoId: initialFullData.localTratamentoId ?? '',
          organismoId: initialFullData.organismoId ?? '',
          especificacaoTecnica: initialFullData.especificacaoTecnica ?? '',
          doencas: initialFullData.doencas ?? '',
          inativo: initialFullData.inativo ?? false,
        })
      } else {
        setValues({
          designacao: viewData.designacao ?? '',
          localTratamentoId: '',
          organismoId: '',
          especificacaoTecnica: '',
          doencas: '',
          inativo: (viewData as PatologiaTableDTO).inativo ?? false,
        })
      }
    }
    if (open && mode === 'create') {
      setFullData(null)
      setValues({
        designacao: '',
        localTratamentoId: '',
        organismoId: '',
        especificacaoTecnica: '',
        doencas: '',
        inativo: false,
      })
    }
  }, [open, mode, isView, isEdit, viewData?.id, initialFullData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.designacao?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    try {
      const client = PatologiaService()
      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      const body: CreatePatologiaRequest = {
        designacao: values.designacao.trim(),
        localTratamentoId: values.localTratamentoId || undefined,
        organismoId: values.organismoId || undefined,
        especificacaoTecnica: values.especificacaoTecnica || undefined,
        doencas: values.doencas || undefined,
        inativo: values.inativo,
        patologiaServicos: fullData?.patologiaServicos?.length
          ? fullData.patologiaServicos.map((ps) => ({
              subsistemaServicoId: ps.subsistemaServicoId,
              duracao: ps.duracao ?? undefined,
              ordem: ps.ordem ?? 0,
              fisioterapia: ps.fisioterapia ?? false,
              auxiliar: ps.auxiliar ?? false,
              valorUtente: ps.valorUtente ?? 0,
              valorOrganismo: ps.valorOrganismo ?? 0,
              percentagemInstituicao: ps.percentagemInstituicao ?? undefined,
              precoEur: ps.precoEur ?? undefined,
              observacoes: ps.observacoes ?? undefined,
            }))
          : undefined,
        doencaIds: fullData?.doencaIds ?? undefined,
      }

      if (isEdit && editId) {
        const response = await client.updatePatologia(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Patologia atualizada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao atualizar Patologia.'
          toast.error(msg)
        }
      } else {
        const response = await client.createPatologia(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Patologia criada com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao criar Patologia.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a Patologia.')
    }
  }

  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{'CliCloud'}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar patologia.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className='py-4'>A carregar...</p>
        ) : (
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label>Designação</Label>
              <Input
                readOnly={isView}
                value={values.designacao}
                maxLength={100}
                placeholder='Designação...'
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, designacao: e.target.value }))
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>Local de Tratamento (ID)</Label>
              <Input
                readOnly={isView}
                value={values.localTratamentoId}
                placeholder='Guid do local...'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    localTratamentoId: e.target.value,
                  }))
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>Organismo (ID)</Label>
              <Input
                readOnly={isView}
                value={values.organismoId}
                placeholder='Guid do organismo...'
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, organismoId: e.target.value }))
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>Especificação Técnica</Label>
              <Textarea
                readOnly={isView}
                value={values.especificacaoTecnica}
                placeholder='Especificação técnica...'
                rows={2}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    especificacaoTecnica: e.target.value,
                  }))
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>Doenças (texto)</Label>
              <Textarea
                readOnly={isView}
                value={values.doencas}
                placeholder='Doenças...'
                rows={2}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, doencas: e.target.value }))
                }
              />
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='inativo'
                checked={values.inativo}
                disabled={isView}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({
                    ...prev,
                    inativo: checked === true,
                  }))
                }
              />
              <Label htmlFor='inativo'>Inativo</Label>
            </div>
            {fullData && (fullData.patologiaServicos?.length ?? 0) > 0 && (
              <div className='text-sm text-muted-foreground'>
                {fullData.patologiaServicos?.length} linha(s) Organismo/Serviço.
              </div>
            )}
            {fullData && (fullData.doencaIds?.length ?? 0) > 0 && (
              <div className='text-sm text-muted-foreground'>
                {fullData.doencaIds?.length} doença(s) associada(s).
              </div>
            )}
          </div>
        )}
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
                Guardar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
