import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { AcordosTableDTO } from '@/types/dtos/exames/acordos'
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
import { AcordosService } from '@/lib/services/exames/acordos-service'
import { TipoExameService } from '@/lib/services/exames/tipo-exame-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface AcordoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: AcordosTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  tipoExameId: string
  organismoId: string
  codigoSubsistema: string
  valTipoExame: string
  valorOrganismo: string
  margemOrganismo: string
  valorUtente: string
  inactivo: boolean
}

export function AcordoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: AcordoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    tipoExameId: '',
    organismoId: '',
    codigoSubsistema: '',
    valTipoExame: '',
    valorOrganismo: '',
    margemOrganismo: '',
    valorUtente: '',
    inactivo: false,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const { data: tiposExameResponse } = useQuery({
    queryKey: ['tipos-exame-light-acordos', { open }],
    queryFn: () => TipoExameService().getTipoExamesLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: organismosResponse } = useQuery({
    queryKey: ['organismos-light-acordos', { open }],
    queryFn: () => OrganismoService().getOrganismoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const tiposExame = tiposExameResponse?.info?.data ?? []
  const organismos = organismosResponse?.info?.data ?? []

  useEffect(() => {
    const loadForViewOrEdit = async () => {
      if (!open || !(isView || isEdit) || !viewData) return

      const id = viewData.id ?? (viewData as unknown as { Id?: string }).Id ?? ''
      if (!id) return

      try {
        const resp = await AcordosService().getAcordosById(String(id))
        const dto = resp.info.data
        if (!dto) return
        setValues({
          tipoExameId: dto.tipoExameId ?? '',
          organismoId: dto.organismoId ?? '',
          codigoSubsistema: dto.codigoSubsistema ?? '',
          valTipoExame: dto.valTipoExame != null ? String(dto.valTipoExame) : '',
          valorOrganismo:
            dto.valorOrganismo != null ? String(dto.valorOrganismo) : '',
          margemOrganismo:
            dto.margemOrganismo != null ? String(dto.margemOrganismo) : '',
          valorUtente: dto.valorUtente != null ? String(dto.valorUtente) : '',
          inactivo: dto.inactivo ?? false,
        })
      } catch {
      }
    }

    if (open && mode === 'create') {
      setValues({
        tipoExameId: '',
        organismoId: '',
        codigoSubsistema: '',
        valTipoExame: '',
        valorOrganismo: '',
        margemOrganismo: '',
        valorUtente: '',
        inactivo: false,
      })
    } else {
      void loadForViewOrEdit()
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => onOpenChange(false)

  const parseVal = (value: string): number => {
    if (!value || !value.trim()) return 0
    const n = Number(value.replace(',', '.'))
    return Number.isNaN(n) ? 0 : n
  }

  const formatNum = (n: number): string =>
    Number.isNaN(n) ? '0,00' : n.toFixed(2).replace('.', ',')

  const handleValTipoExameChange = (valTipoExame: string) => {
    setValues((prev) => {
      const valorServico = parseVal(valTipoExame)
      const margem = parseVal(prev.margemOrganismo)
      if (margem <= 0) {
        return {
          ...prev,
          valTipoExame,
          valorOrganismo: '0,00',
          valorUtente: formatNum(valorServico),
        }
      }
      const valorOrg = valorServico * (margem / 100)
      const valorUtente = valorServico - valorOrg
      return {
        ...prev,
        valTipoExame,
        valorOrganismo: formatNum(valorOrg),
        valorUtente: formatNum(valorUtente),
      }
    })
  }

  const handleMargemOrganismoChange = (margemOrganismo: string) => {
    setValues((prev) => {
      const valorServico = parseVal(prev.valTipoExame)
      let margem = parseVal(margemOrganismo)
      if (margem > 100) margem = 100
      const margemStr = margem >= 100 ? '100,00' : margemOrganismo
      if (margem <= 0) {
        return {
          ...prev,
          margemOrganismo: margemStr,
          valorOrganismo: '0,00',
          valorUtente: formatNum(valorServico),
        }
      }
      const valorOrg = valorServico * (margem / 100)
      const valorUtente = valorServico - valorOrg
      return {
        ...prev,
        margemOrganismo: margemStr,
        valorOrganismo: formatNum(valorOrg),
        valorUtente: formatNum(valorUtente),
      }
    })
  }

  const handleValorOrganismoChange = (valorOrganismo: string) => {
    setValues((prev) => {
      const valorServico = parseVal(prev.valTipoExame)
      const valorOrga = parseVal(valorOrganismo)
      if (valorOrga <= 0) {
        return {
          ...prev,
          valorOrganismo: '0,00',
          margemOrganismo: '0,00',
          valorUtente: formatNum(valorServico),
        }
      }
      if (valorOrga > valorServico && valorServico > 0) {
        toast.error('O valor pago pelo organismo não pode ser superior ao valor do tipo de exame.')
        const valorOrg = valorServico
        const margem = (valorOrg / valorServico) * 100
        const valorUtente = valorServico - valorOrg
        return {
          ...prev,
          valorOrganismo: formatNum(valorOrg),
          margemOrganismo: formatNum(margem),
          valorUtente: formatNum(valorUtente),
        }
      }
      if (valorOrga > 0 && valorOrga <= valorServico) {
        const margem = (valorOrga / valorServico) * 100
        const valorUtente = valorServico - valorOrga
        return {
          ...prev,
          valorOrganismo,
          margemOrganismo: formatNum(margem),
          valorUtente: formatNum(valorUtente),
        }
      }
      return { ...prev, valorOrganismo }
    })
  }

  const handleValorUtenteChange = (valorUtente: string) => {
    setValues((prev) => {
      const valorServico = parseVal(prev.valTipoExame)
      const valorUt = parseVal(valorUtente)
      if (valorUt <= 0) {
        const valorOrg = valorServico
        const margem = valorServico > 0 ? (valorOrg / valorServico) * 100 : 0
        return {
          ...prev,
          valorUtente: '0,00',
          valorOrganismo: formatNum(valorOrg),
          margemOrganismo: formatNum(margem),
        }
      }
      if (valorUt > valorServico && valorServico > 0) {
        toast.error('O valor pago pelo utente não pode ser superior ao valor do tipo de exame.')
        const valorUtCapped = valorServico
        const valorOrg = valorServico - valorUtCapped
        const margem = (valorOrg / valorServico) * 100
        return {
          ...prev,
          valorUtente: formatNum(valorUtCapped),
          valorOrganismo: formatNum(valorOrg),
          margemOrganismo: formatNum(margem),
        }
      }
      if (valorUt > 0 && valorUt <= valorServico) {
        const valorOrg = valorServico - valorUt
        const margem = valorServico > 0 ? (valorOrg / valorServico) * 100 : 0
        return {
          ...prev,
          valorUtente,
          valorOrganismo: formatNum(valorOrg),
          margemOrganismo: formatNum(margem),
        }
      }
      return { ...prev, valorUtente }
    })
  }

  const parseNumber = (value: string, field: string): number | undefined => {
    if (!value.trim()) return undefined
    const num = Number(value.replace(',', '.'))
    if (Number.isNaN(num)) {
      toast.error(`Valor inválido para ${field}.`)
      throw new Error('invalid-number')
    }
    return num
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.tipoExameId.trim() || !values.organismoId.trim()) {
      toast.error('Tipo de exame e Organismo são obrigatórios.')
      return
    }

    let valTipoExame: number | undefined
    let valorOrganismo: number | undefined
    let margemOrganismo: number | undefined
    let valorUtente: number | undefined

    try {
      valTipoExame = parseNumber(values.valTipoExame, 'Val. Tipo Exame')
      valorOrganismo = parseNumber(values.valorOrganismo, 'Valor Org.')
      margemOrganismo = parseNumber(values.margemOrganismo, 'Margem Org.')
      valorUtente = parseNumber(values.valorUtente, 'Val. Utente')
    } catch {
      return
    }

    try {
      const client = AcordosService()
      const body = {
        tipoExameId: values.tipoExameId.trim(),
        organismoId: values.organismoId.trim(),
        codigoSubsistema: values.codigoSubsistema.trim() || undefined,
        valTipoExame: valTipoExame ?? undefined,
        valorOrganismo: valorOrganismo ?? undefined,
        margemOrganismo: margemOrganismo ?? undefined,
        valorUtente: valorUtente ?? undefined,
        inactivo: values.inactivo,
      }

      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      const response =
        isEdit && viewData && editId
          ? await client.updateAcordos(editId, { ...body })
          : await client.createAcordos(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit ? 'Acordo atualizado com sucesso.' : 'Acordo criado com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit ? 'Falha ao atualizar acordo.' : 'Falha ao criar acordo.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o acordo.')
    }
  }

  const title =
    mode === 'view'
      ? 'Acordo'
      : mode === 'edit'
        ? 'Editar Acordo'
        : 'Novo Acordo'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar um Acordo (Tipo Exame / Organismo).
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='col-span-2 min-w-0 grid gap-2'>
            <Label>Cód. Subsistema</Label>
            <Input
              disabled={isView}
              value={values.codigoSubsistema}
              placeholder='Ex.: 2345'
              maxLength={20}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, codigoSubsistema: e.target.value }))
              }
            />
          </div>
          <div className='min-w-0 grid gap-2'>
            <Label>Cód. Organismo *</Label>
            <Select
              disabled={isView}
              value={values.organismoId}
              onValueChange={(value) =>
                setValues((prev) => ({ ...prev, organismoId: value }))
              }
            >
              <SelectTrigger className='w-full min-w-0 overflow-hidden [&>span]:block [&>span]:min-w-0 [&>span]:truncate'>
                <SelectValue placeholder='Selecione o organismo...' />
              </SelectTrigger>
              <SelectContent>
                {organismos.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.nome ?? o.nomeComercial ?? o.abreviatura ?? o.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='min-w-0 grid gap-2'>
            <Label>Cód. Tipo Exame *</Label>
            <Select
              disabled={isView}
              value={values.tipoExameId}
              onValueChange={(value) =>
                setValues((prev) => ({ ...prev, tipoExameId: value }))
              }
            >
              <SelectTrigger className='w-full min-w-0 overflow-hidden [&>span]:block [&>span]:min-w-0 [&>span]:truncate'>
                <SelectValue placeholder='Selecione o tipo de exame...' />
              </SelectTrigger>
              <SelectContent>
                {tiposExame.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.designacao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-2'>
            <Label>Val. Tipo Exame (€)</Label>
            <Input
              disabled={isView}
              type='text'
              inputMode='decimal'
              value={values.valTipoExame}
              placeholder='0,00'
              onChange={(e) => handleValTipoExameChange(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Margem Org. (%)</Label>
            <Input
              disabled={isView}
              type='text'
              inputMode='decimal'
              value={values.margemOrganismo}
              placeholder='0,00'
              onChange={(e) => handleMargemOrganismoChange(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Valor Org. (€)</Label>
            <Input
              disabled={isView}
              type='text'
              inputMode='decimal'
              value={values.valorOrganismo}
              placeholder='0,00'
              onChange={(e) => handleValorOrganismoChange(e.target.value)}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Val. Utente (€)</Label>
            <Input
              disabled={isView}
              type='text'
              inputMode='decimal'
              value={values.valorUtente}
              placeholder='0,00'
              onChange={(e) => handleValorUtenteChange(e.target.value)}
            />
          </div>
          <div className='col-span-2 flex items-center gap-2'>
            <Checkbox
              disabled={isView}
              checked={values.inactivo}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, inactivo: Boolean(checked) }))
              }
            />
            <Label>Inactivo</Label>
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

