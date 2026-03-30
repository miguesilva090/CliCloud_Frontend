import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import { SubsistemaServicoService } from '@/lib/services/servicos/subsistema-servico-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface SubsistemaServicoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: SubsistemaServicoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  servicoId: string
  organismoId: string
  subsistemaId: string
  valorServico: string
  valorOrganismo: string
  margemOrganismoPercent: string
  valorUtente: string
  margemUtentePercent: string
  inativo: boolean
}

export function SubsistemaServicoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: SubsistemaServicoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    servicoId: '',
    organismoId: '',
    subsistemaId: '',
    valorServico: '',
    valorOrganismo: '',
    margemOrganismoPercent: '',
    valorUtente: '',
    margemUtentePercent: '',
    inativo: false,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)

  const { data: servicosResponse } = useQuery({
    queryKey: ['servicos-light-subsistema', { open }],
    queryFn: () => ServicoService().getServicoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: organismosResponse } = useQuery({
    queryKey: ['organismos-light-subsistema', { open }],
    queryFn: () => OrganismoService().getOrganismoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const servicos = servicosResponse?.info?.data ?? []
  const organismos = organismosResponse?.info?.data ?? []

  useEffect(() => {
    const loadForViewOrEdit = async () => {
      if (!open || !(isView || isEdit) || !viewData) return

      const id =
        viewData.id ?? (viewData as unknown as { Id?: string }).Id ?? ''
      if (!id) return

      try {
        const resp = await SubsistemaServicoService().getSubsistemaServicoById(
          String(id)
        )
        const dto = resp.info.data
        if (!dto) return
        setValues({
          servicoId: dto.servicoId ?? '',
          organismoId: dto.organismoId ?? '',
          subsistemaId: dto.subsistemaId ?? '',
          valorServico:
            dto.valorServico != null ? String(dto.valorServico) : '',
          valorOrganismo:
            dto.valorOrganismo != null ? String(dto.valorOrganismo) : '',
          margemOrganismoPercent:
            dto.margemOrganismoPercent != null
              ? String(dto.margemOrganismoPercent)
              : '',
          valorUtente: dto.valorUtente != null ? String(dto.valorUtente) : '',
          margemUtentePercent:
            dto.margemUtentePercent != null
              ? String(dto.margemUtentePercent)
              : '',
          inativo: dto.inativo ?? false,
        })
      } catch {
        // se falhar, mantemos valores atuais
      }
    }

    if (open && mode === 'create') {
      setValues({
        servicoId: '',
        organismoId: '',
        subsistemaId: '',
        valorServico: '',
        valorOrganismo: '',
        margemOrganismoPercent: '',
        valorUtente: '',
        margemUtentePercent: '',
        inativo: false,
      })
    } else {
      void loadForViewOrEdit()
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const parseNumber = (value: string, field: string): number | undefined => {
    if (!value) return undefined
    const num = Number(value)
    if (Number.isNaN(num)) {
      toast.error(`Valor inválido para ${field}.`)
      throw new Error('invalid-number')
    }
    return num
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.servicoId.trim() || !values.organismoId.trim()) {
      toast.error('Serviço e Organismo são obrigatórios.')
      return
    }

    let valorServico: number | undefined
    let valorOrganismo: number | undefined
    let margemOrganismoPercent: number | undefined
    let valorUtente: number | undefined
    let margemUtentePercent: number | undefined

    try {
      valorServico = parseNumber(values.valorServico, 'Val. Serviço')
      valorOrganismo = parseNumber(values.valorOrganismo, 'Val. Organismo')
      margemOrganismoPercent = parseNumber(
        values.margemOrganismoPercent,
        'Margem Org. (%)'
      )
      valorUtente = parseNumber(values.valorUtente, 'Val. Utente')
      margemUtentePercent = parseNumber(
        values.margemUtentePercent,
        'Margem Utente (%)'
      )
    } catch {
      return
    }

    try {
      const client = SubsistemaServicoService()

      const subsistemaGuid =
        values.subsistemaId.trim().length > 0
          ? values.subsistemaId.trim()
          : (globalThis.crypto?.randomUUID
              ? globalThis.crypto.randomUUID()
              : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`)

      const body = {
        servicoId: values.servicoId.trim(),
        organismoId: values.organismoId.trim(),
        subsistemaId: subsistemaGuid,
        valorServico: valorServico ?? 0,
        valorOrganismo: valorOrganismo ?? 0,
        margemOrganismoPercent: margemOrganismoPercent ?? 0,
        valorUtente: valorUtente ?? 0,
        margemUtentePercent: margemUtentePercent ?? 0,
        inativo: values.inativo,
      }

      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      const response =
        isEdit && viewData && editId
          ? await client.updateSubsistemaServico(editId, { ...body, id: editId })
          : await client.createSubsistemaServico(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Subsistema de Serviço atualizado com sucesso.'
            : 'Subsistema de Serviço criado com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Subsistema de Serviço.'
            : 'Falha ao criar Subsistema de Serviço.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ??
          'Ocorreu um erro ao guardar o Subsistema de Serviço.'
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Subsistema de Serviço'
      : mode === 'edit'
        ? 'Editar Subsistema de Serviço'
        : 'Adicionar Subsistema de Serviço'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar um Subsistema de Serviço.
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-3 gap-4 py-4'>
          <div className='col-span-1 min-w-0 grid gap-2'>
            <Label>Serviço</Label>
            <div className='flex gap-2'>
              <Select
                disabled={isView}
                value={values.servicoId}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, servicoId: value }))
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue
                    placeholder='Selecione o serviço...'
                    className='truncate'
                  />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.designacao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isView && (
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='h-9 w-9 flex-shrink-0'
                  onClick={() => {
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/consultas/servicos/servicos',
                      'Serviços',
                    )
                  }}
                  title='Abrir página de Serviços'
                >
                  +
                </Button>
              )}
            </div>
          </div>
          <div className='col-span-1 min-w-0 grid gap-2'>
            <Label>Organismo</Label>
            <div className='flex gap-2'>
              <Select
                disabled={isView}
                value={values.organismoId}
                onValueChange={(value) =>
                  setValues((prev) => ({ ...prev, organismoId: value }))
                }
              >
                <SelectTrigger className='w-full'>
                  <SelectValue
                    placeholder='Selecione o organismo...'
                    className='truncate'
                  />
                </SelectTrigger>
                <SelectContent>
                  {organismos.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.nome ?? o.nomeComercial ?? o.abreviatura ?? o.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isView && (
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='h-9 w-9 flex-shrink-0'
                  onClick={() => {
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/entidades/organismos',
                      'Organismos',
                    )
                  }}
                  title='Abrir página de Organismos'
                >
                  +
                </Button>
              )}
            </div>
          </div>
          <div className='col-span-3 mt-2 grid grid-cols-3 gap-4'>
            <div className='grid gap-2'>
              <Label>Val. Serv. (EUR)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.valorServico}
                placeholder='0,00'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    valorServico: e.target.value,
                  }))
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>Val. Org. (EUR)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.valorOrganismo}
                placeholder='0,00'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    valorOrganismo: e.target.value,
                  }))
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>Margem Org. (%)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.margemOrganismoPercent}
                placeholder='0,00'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    margemOrganismoPercent: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className='col-span-3 mt-2 grid grid-cols-3 gap-4'>
            <div className='grid gap-2'>
              <Label>Val. Utente (EUR)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.valorUtente}
                placeholder='0,00'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    valorUtente: e.target.value,
                  }))
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label>Margem Utente (%)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.margemUtentePercent}
                placeholder='0,00'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    margemUtentePercent: e.target.value,
                  }))
                }
              />
            </div>
            <div className='flex items-center gap-2 mt-6'>
              <Checkbox
                disabled={isView}
                checked={values.inativo}
                onCheckedChange={(checked) =>
                  setValues((prev) => ({
                    ...prev,
                    inativo: Boolean(checked),
                  }))
                }
              />
              <Label>Inativo</Label>
            </div>
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

