import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { MargemMedicoTableDTO } from '@/types/dtos/saude/margem-medico.dtos'
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
import { MargemMedicoService } from '@/lib/services/saude/margem-medico-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { ResponseStatus } from '@/types/api/responses'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import type { MedicoLightDTO } from '@/types/dtos/saude/medicos.dtos'

type ModalMode = 'view' | 'create' | 'edit'

interface MargemMedicoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: MargemMedicoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  servicoId: string
  medicoId: string
  valorMargem: string
  percentagemMargem: string
}

export function MargemMedicoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: MargemMedicoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    servicoId: '',
    medicoId: '',
    valorMargem: '',
    percentagemMargem: '',
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const { data: servicosResponse } = useQuery({
    queryKey: ['servicos-light-margem-medico', { open }],
    queryFn: () => ServicoService().getServicoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: medicosResponse } = useQuery({
    queryKey: ['medicos-light-margem-medico', { open }],
    queryFn: () => MedicosService('margem-medico').getMedicosLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const servicos: ServicoLightDTO[] = servicosResponse?.info?.data ?? []
  const medicos: MedicoLightDTO[] = medicosResponse?.info?.data ?? []

  useEffect(() => {
    const loadForViewOrEdit = async () => {
      if (!open || !(isView || isEdit) || !viewData) return

      const rawId =
        viewData.id ?? (viewData as unknown as { Id?: string }).Id ?? ''
      const id = typeof rawId === 'string' ? rawId : String(rawId)
      if (!id) return

      try {
        const resp = await MargemMedicoService().getMargemMedico(id)
        const dto = resp.info.data
        if (!dto) return

        setValues({
          servicoId: dto.servicoId ?? '',
          medicoId: dto.medicoId ?? '',
          valorMargem: dto.valorMargem != null ? String(dto.valorMargem) : '',
          percentagemMargem:
            dto.percentagemMargem != null
              ? String(dto.percentagemMargem)
              : '',
        })
      } catch (error) {
        const err = error as { message?: string }
        toast.error(
          err?.message ?? 'Não foi possível carregar os detalhes da margem.'
        )
      }
    }

    if (open && (isView || isEdit) && viewData) {
      loadForViewOrEdit()
    }
    if (open && mode === 'create') {
      setValues({
        servicoId: '',
        medicoId: '',
        valorMargem: '',
        percentagemMargem: '',
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.servicoId) {
      toast.error('Serviço é obrigatório.')
      return
    }
    if (!values.medicoId) {
      toast.error('Médico é obrigatório.')
      return
    }

    const valorNum = values.valorMargem ? Number(values.valorMargem) : undefined
    const percNum = values.percentagemMargem
      ? Number(values.percentagemMargem)
      : undefined

    if (values.valorMargem && Number.isNaN(valorNum)) {
      toast.error('Valor da margem inválido.')
      return
    }
    if (values.percentagemMargem && Number.isNaN(percNum)) {
      toast.error('Percentagem da margem inválida.')
      return
    }

    try {
      const client = MargemMedicoService()
      const body = {
        servicoId: values.servicoId,
        medicoId: values.medicoId,
        valorMargem: valorNum,
        percentagemMargem: percNum,
      }

      const rawId =
        viewData &&
        ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      const response =
        isEdit && viewData && editId
          ? await client.updateMargemMedico(editId, body)
          : await client.createMargemMedico(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Margem de Médico atualizada com sucesso.'
            : 'Margem de Médico criada com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Margem de Médico.'
            : 'Falha ao criar Margem de Médico.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar a Margem de Médico.'
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Margem de Médico'
      : mode === 'edit'
        ? 'Editar Margem de Médico'
        : 'Adicionar Margem de Médico'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar uma Margem de Médico.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Serviço</Label>
            <Select
              disabled={isView}
              value={values.servicoId}
              onValueChange={(v) =>
                setValues((prev) => ({ ...prev, servicoId: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecionar serviço...' />
              </SelectTrigger>
              <SelectContent>
                {servicos.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.designacao ?? s.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>Médico</Label>
            <Select
              disabled={isView}
              value={values.medicoId}
              onValueChange={(v) =>
                setValues((prev) => ({ ...prev, medicoId: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecionar médico...' />
              </SelectTrigger>
              <SelectContent>
                {medicos.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nome ?? m.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>Valor Margem (opcional)</Label>
            <Input
              disabled={isView}
              type='number'
              step={0.01}
              value={values.valorMargem}
              placeholder='0,00'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, valorMargem: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2'>
            <Label>% Margem (opcional)</Label>
            <Input
              disabled={isView}
              type='number'
              step={0.01}
              value={values.percentagemMargem}
              placeholder='0,00'
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  percentagemMargem: e.target.value,
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
