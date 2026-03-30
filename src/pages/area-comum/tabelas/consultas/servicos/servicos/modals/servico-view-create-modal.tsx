import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ServicoTableDTO } from '@/types/dtos/servicos/servico.dtos'
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
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { TipoServicoService } from '@/lib/services/servicos/tipo-servico-service'
import { TaxaIvaService } from '@/lib/services/taxas-iva/taxa-iva-service'
import { ResponseStatus } from '@/types/api/responses'
import type { TipoServicoLightDTO } from '@/types/dtos/servicos/tipo-servico.dtos'
import type { TaxaIvaLightDTO } from '@/types/dtos/taxas-iva/taxa-iva.dtos'

type ModalMode = 'view' | 'create' | 'edit'

interface ServicoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: ServicoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  designacao: string
  tipoServicoId: string
  preco: string
  duracao: string
  taxaIvaId: string
  ean: string
  tipoAparelhoId: string
  codigoMotivoIsencao: string
  tratDentario: boolean
  inativo: boolean
}

export function ServicoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: ServicoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    designacao: '',
    tipoServicoId: '',
    preco: '',
    duracao: '',
    taxaIvaId: '',
    ean: '',
    tipoAparelhoId: '',
    codigoMotivoIsencao: '',
    tratDentario: false,
    inativo: false,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const { data: tiposServicoResponse } = useQuery({
    queryKey: ['tipos-servico-light', { open }],
    queryFn: () => TipoServicoService().getTipoServicoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: taxasIvaResponse } = useQuery({
    queryKey: ['taxas-iva-light', { open }],
    queryFn: () => TaxaIvaService().getTaxasIvaLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const tiposServico: TipoServicoLightDTO[] =
    tiposServicoResponse?.info?.data ?? []

  const taxasIva: TaxaIvaLightDTO[] = useMemo(
    () =>
      (taxasIvaResponse?.info?.data ?? [])
        .slice()
        .sort((a, b) => a.taxa - b.taxa || a.descricao.localeCompare(b.descricao)),
    [taxasIvaResponse]
  )

  const tipoServicoSelecionado = useMemo(
    () => tiposServico.find((t) => t.id === values.tipoServicoId) ?? null,
    [tiposServico, values.tipoServicoId]
  )

  const taxaIvaSelecionada = useMemo(
    () => taxasIva.find((t) => t.id === values.taxaIvaId) ?? null,
    [taxasIva, values.taxaIvaId]
  )

  useEffect(() => {
    const loadForViewOrEdit = async () => {
      if (!open || !(isView || isEdit) || !viewData) return

      const rawId =
        'id' in viewData ? viewData.id : (viewData as { Id?: string }).Id
      const id = typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''
      if (!id) return

      try {
        const resp = await ServicoService().getServico(id)
        const dto = resp.info.data
        if (!dto) return

        setValues({
          designacao: dto.designacao ?? '',
          tipoServicoId: dto.tipoServicoId ?? '',
          preco: dto.preco != null ? String(dto.preco) : '',
          duracao: dto.duracao ?? '',
          taxaIvaId: dto.taxaIvaId ?? '',
          ean: dto.ean ?? '',
          tipoAparelhoId: dto.tipoAparelhoId ?? '',
          codigoMotivoIsencao:
            dto.codigoMotivoIsencao != null
              ? String(dto.codigoMotivoIsencao)
              : '',
          tratDentario: dto.tratDentario ?? false,
          inativo: dto.inativo ?? false,
        })
      } catch (error) {
        const err = error as { message?: string }
        toast.error(
          err?.message ??
            'Não foi possível carregar os detalhes completos do serviço.'
        )
      }
    }

    if (open && mode === 'create') {
      setValues({
        designacao: '',
        tipoServicoId: '',
        preco: '',
        duracao: '',
        taxaIvaId: '',
        ean: '',
        tipoAparelhoId: '',
        codigoMotivoIsencao: '',
        tratDentario: false,
        inativo: false,
      })
    } else {
      void loadForViewOrEdit()
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.designacao.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    if (!values.tipoServicoId) {
      toast.error('Tipo de Serviço é obrigatório.')
      return
    }

    const precoNum = values.preco ? Number(values.preco) : undefined
    if (values.preco && Number.isNaN(precoNum)) {
      toast.error('Valor inválido para preço.')
      return
    }

    const taxaIvaZero =
      taxaIvaSelecionada != null && Number(taxaIvaSelecionada.taxa) === 0

    let codigoMotivoIsencaoNum: number | undefined
    if (taxaIvaZero) {
      if (!values.codigoMotivoIsencao.trim()) {
        toast.error('Motivo de isenção é obrigatório quando a Taxa IVA é 0%.')
        return
      }

      // Extrair a parte numérica do código (ex.: "M07 - ARTIGO..."
      // -> 7). Mais tarde isto será substituído por um dropdown
      // ligado à tabela de motivos.
      const match = values.codigoMotivoIsencao.match(/\d+/)
      if (!match) {
        toast.error('Motivo de isenção deve conter um código numérico (ex.: M07 - ...).')
        return
      }
      codigoMotivoIsencaoNum = Number.parseInt(match[0] ?? '', 10)
    }

    try {
      const client = ServicoService()

      const body = {
        designacao: values.designacao.trim(),
        tipoServicoId: values.tipoServicoId,
        preco: precoNum,
        duracao: values.duracao || undefined,
        taxaIvaId: values.taxaIvaId || undefined,
        ean: values.ean || undefined,
        tipoAparelhoId: values.tipoAparelhoId || undefined,
        tratDentario: values.tratDentario,
        codigoMotivoIsencao: codigoMotivoIsencaoNum,
        inativo: values.inativo,
      }

      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      const response =
        isEdit && viewData && editId
          ? await client.updateServico(editId, { ...body, id: editId })
          : await client.createServico(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit ? 'Serviço atualizado com sucesso.' : 'Serviço criado com sucesso.'
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit ? 'Falha ao atualizar serviço.' : 'Falha ao criar serviço.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o serviço.')
    }
  }

  const title =
    mode === 'view'
      ? 'Serviço'
      : mode === 'edit'
        ? 'Editar Serviço'
        : 'Adicionar Serviço'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar um serviço.
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4'>
          <div className='col-span-1 grid gap-2'>
            <Label>Designação</Label>
            <Input
              disabled={isView}
              value={values.designacao}
              maxLength={250}
              placeholder='Designação do serviço...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, designacao: e.target.value }))
              }
            />
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Tipo de Serviço</Label>
            <Select
              disabled={isView}
              value={values.tipoServicoId}
              onValueChange={(value) =>
                setValues((prev) => ({ ...prev, tipoServicoId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder='Selecione o tipo de serviço...'
                  aria-label={
                    tipoServicoSelecionado
                      ? `Tipo de serviço: ${tipoServicoSelecionado.descricao}`
                      : undefined
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tiposServico.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Valor (EUR)</Label>
            <Input
              disabled={isView}
              type='number'
              step={0.01}
              value={values.preco}
              placeholder='0,00'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, preco: e.target.value }))
              }
            />
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Duração</Label>
            <Input
              disabled={isView}
              value={values.duracao}
              maxLength={50}
              placeholder='Duração (texto livre)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, duracao: e.target.value }))
              }
            />
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Taxa IVA</Label>
            <Select
              disabled={isView}
              value={values.taxaIvaId}
              onValueChange={(value) =>
                setValues((prev) => ({ ...prev, taxaIvaId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder='Selecione a taxa IVA...'
                  aria-label={
                    taxaIvaSelecionada
                      ? `Taxa IVA: ${taxaIvaSelecionada.descricao} (${taxaIvaSelecionada.taxa.toFixed(2)}%)`
                      : undefined
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {taxasIva.map((taxa) => (
                  <SelectItem key={taxa.id} value={taxa.id}>
                    {taxa.descricao} ({taxa.taxa.toFixed(2)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Tipo de Aparelho</Label>
            <Input
              disabled={isView}
              value={values.tipoAparelhoId}
              maxLength={50}
              placeholder='Tipo de aparelho (provisório)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, tipoAparelhoId: e.target.value }))
              }
            />
          </div>
          {taxaIvaSelecionada && Number(taxaIvaSelecionada.taxa) === 0 ? (
            <div className='col-span-1 grid gap-2'>
              <Label>Motivo de Isenção</Label>
              <Input
                disabled={isView}
                value={values.codigoMotivoIsencao}
                maxLength={120}
                placeholder='Ex.: M07 - ARTIGO 9.º NR.2 DO CIVA'
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    codigoMotivoIsencao: e.target.value,
                  }))
                }
              />
            </div>
          ) : null}
          <div className='col-span-1 grid gap-2'>
            <Label>Cód. EAN</Label>
            <Input
              disabled={isView}
              value={values.ean}
              maxLength={50}
              placeholder='EAN...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, ean: e.target.value }))
              }
            />
          </div>
          <div className='col-span-1 flex items-center gap-2 mt-2'>
            <Checkbox
              disabled={isView}
              checked={values.tratDentario}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, tratDentario: Boolean(checked) }))
              }
            />
            <Label>Serviço Dentário</Label>
          </div>
          <div className='col-span-1 flex items-center gap-2 mt-2'>
            <Checkbox
              disabled={isView}
              checked={values.inativo}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, inativo: Boolean(checked) }))
              }
            />
            <Label>Inativo</Label>
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

