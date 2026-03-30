import { useEffect, useMemo, useState } from 'react'
import type { EntidadeFinanceiraTableDTO } from '@/types/dtos/utility/entidade-financeira.dtos'
import { CondicaoSns } from '@/types/enums/condicao-sns.enum'
import { useQuery } from '@tanstack/react-query'
import { TipoEntidadeFinanceiraService } from '@/lib/services/utility/tipo-entidade-financeira-service'
import { useGetPaisesSelect } from '@/pages/base/paises/queries/paises-queries'
import { EntidadesFinanceirasService } from '@/lib/services/utility/entidades-financeiras-service'
import { ResponseStatus } from '@/types/api/responses'
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

type ModalMode = 'view' | 'create' | 'edit'

interface EntidadeFinanceiraViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: EntidadeFinanceiraTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  nome: string
  abreviatura: string
  paisPrefixo: string
  tipoEntidadeFinanceiraDesignacao: string
  condicaoSns: CondicaoSns | null
}

export function EntidadeFinanceiraViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: EntidadeFinanceiraViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>({
    nome: '',
    abreviatura: '',
    paisPrefixo: '',
    tipoEntidadeFinanceiraDesignacao: '',
    condicaoSns: CondicaoSns.NaoEspecificado,
  })

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const { data: paisesOptions = [] } = useGetPaisesSelect()

  const { data: tiposEntidadeOptions = [] } = useQuery({
    queryKey: ['tipos-entidade-select'],
    queryFn: async () => {
      const response = await TipoEntidadeFinanceiraService(
        'tipos-entidade',
      ).getTiposEntidadeLight()
      return response.info.data ?? []
    },
    staleTime: 30_000,
  })

  const selectedPais = useMemo(
    () => paisesOptions.find((p: any) => p.nome === values.paisPrefixo) ?? null,
    [paisesOptions, values.paisPrefixo],
  )

  const selectedTipoEntidade = useMemo(
    () =>
      tiposEntidadeOptions.find(
        (t: any) => t.designacao === values.tipoEntidadeFinanceiraDesignacao,
      ) ?? null,
    [tiposEntidadeOptions, values.tipoEntidadeFinanceiraDesignacao],
  )

  useEffect(() => {
    if (open && (isView || isEdit) && viewData) {
      setValues({
        nome: viewData.nome ?? '',
        abreviatura: viewData.abreviatura ?? '',
        paisPrefixo: viewData.paisPrefixo ?? '',
        tipoEntidadeFinanceiraDesignacao:
          viewData.tipoEntidadeFinanceiraDesignacao ?? '',
        condicaoSns: viewData.condicaoSns ?? CondicaoSns.NaoEspecificado,
      })
    }
    if (open && mode === 'create') {
      setValues({
        nome: '',
        abreviatura: '',
        paisPrefixo: '',
        tipoEntidadeFinanceiraDesignacao: '',
        condicaoSns: CondicaoSns.NaoEspecificado,
      })
    }
  }, [open, mode, isView, isEdit, viewData])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.nome?.trim()) {
      toast.error('Designação (Nome) é obrigatória.')
      return
    }

    if (!selectedPais) {
      toast.error('Selecione um País.')
      return
    }

    if (!selectedTipoEntidade) {
      toast.error('Selecione um Tipo de Entidade.')
      return
    }

    try {
      const client = EntidadesFinanceirasService('entidades-financeiras')

      const body = {
        // Campos base de Entidade
        Nome: values.nome,
        TipoEntidadeId: 10, // EntidadeFinanceira
        Codigo:
          (viewData as { codigo?: string })?.codigo ??
          values.nome.trim().slice(0, 50),
        PaisPrefixo: values.paisPrefixo,
        TipoEntidadeFinanceiraId: selectedTipoEntidade.id as string,
        // Campos específicos de EntidadeFinanceira
        Abreviatura: values.abreviatura || undefined,
        // Campos opcionais herdados
        Email: viewData?.email ?? undefined,
        NumeroContribuinte: viewData?.numeroContribuinte ?? undefined,
      }

      const response =
        isEdit && viewData
          ? await client.updateEntidadeFinanceira(viewData.id, body)
          : await client.createEntidadeFinanceira(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Entidade Financeira atualizada com sucesso.'
            : 'Entidade Financeira criada com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit
            ? 'Falha ao atualizar Entidade Financeira.'
            : 'Falha ao criar Entidade Financeira.')
        toast.error(msg)
      }
    } catch (error: any) {
      toast.error(
        error?.message ??
          'Ocorreu um erro ao criar a Entidade Financeira Responsável.',
      )
    }
  }

  const title = isView
    ? 'Entidade Financeira Responsável'
    : isEdit
      ? 'Editar Entidade Financeira Responsável'
      : 'Adicionar Entidade Financeira Responsável'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4 md:grid-cols-2'>
          <div className='grid gap-2 min-w-0'>
            <Label>Abreviatura</Label>
            <Input
              readOnly={isView}
              value={values.abreviatura}
              onChange={(e) =>
                setValues((p) => ({ ...p, abreviatura: e.target.value }))
              }
            />
          </div>
          <div className='grid gap-2 md:col-span-2'>
            <Label>Designação</Label>
            <Input
              readOnly={isView}
              value={values.nome}
              onChange={(e) => setValues((p) => ({ ...p, nome: e.target.value }))}
            />
          </div>
          <div className='grid gap-2'>
            <Label>País</Label>
            {isView ? (
              <Input readOnly value={values.paisPrefixo} />
            ) : (
              <select
                className='h-9 w-full max-w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'
                value={values.paisPrefixo}
                onChange={(e) =>
                  setValues((p) => ({ ...p, paisPrefixo: e.target.value }))
                }
              >
                <option value=''>Selecione...</option>
                {paisesOptions.map((p: any) => (
                  <option key={p.id} value={p.nome}>
                    {p.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className='grid gap-2 min-w-0'>
            <Label>Tipo Entidade</Label>
            {isView ? (
              <Input readOnly value={values.tipoEntidadeFinanceiraDesignacao} />
            ) : (
              <select
                className='h-9 w-full max-w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring'
                value={values.tipoEntidadeFinanceiraDesignacao}
                onChange={(e) =>
                  setValues((p) => ({
                    ...p,
                    tipoEntidadeFinanceiraDesignacao: e.target.value,
                  }))
                }
              >
                <option value=''>Selecione...</option>
                {tiposEntidadeOptions.map((t: any) => (
                  <option key={t.id} value={t.designacao}>
                    {t.designacao}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className='grid gap-2 md:col-span-2'>
            <Label>Condição</Label>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  id='condicao-sns'
                  name='condicaoSns'
                  className='h-4 w-4'
                  checked={values.condicaoSns === CondicaoSns.CondicaoSns}
                  onChange={() =>
                    !isView &&
                    setValues((p) => ({
                      ...p,
                      condicaoSns: CondicaoSns.CondicaoSns,
                    }))
                  }
                  disabled={isView}
                />
                <Label htmlFor='condicao-sns' className='font-normal'>
                  Condição Sns
                </Label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  id='condicao-terceiro-pagador'
                  name='condicaoSns'
                  className='h-4 w-4'
                  checked={values.condicaoSns === CondicaoSns.TerceiroPagador}
                  onChange={() =>
                    !isView &&
                    setValues((p) => ({
                      ...p,
                      condicaoSns: CondicaoSns.TerceiroPagador,
                    }))
                  }
                  disabled={isView}
                />
                <Label htmlFor='condicao-terceiro-pagador' className='font-normal'>
                  Condição Terceiro Pagador
                </Label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  type='radio'
                  id='condicao-nao-especificado'
                  name='condicaoSns'
                  className='h-4 w-4'
                  checked={values.condicaoSns === CondicaoSns.NaoEspecificado}
                  onChange={() =>
                    !isView &&
                    setValues((p) => ({
                      ...p,
                      condicaoSns: CondicaoSns.NaoEspecificado,
                    }))
                  }
                  disabled={isView}
                />
                <Label htmlFor='condicao-nao-especificado' className='font-normal'>
                  Não especificado
                </Label>
              </div>
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

