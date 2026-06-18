import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ArmazemTableDTO } from '@/types/dtos/stocks/armazem.dtos'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { ArmazemService } from '@/lib/services/stocks/armazem-service'
import { CodigosPostaisService } from '@/lib/services/base/codigospostais-service'
import { ResponseStatus } from '@/types/api/responses'
import { modules } from '@/config/modules'

type ModalMode = 'view' | 'create' | 'edit'

interface ArmazemViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: ArmazemTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  nome: string
  morada: string
  localidade: string
  codigoPostalId: string
  telefone: string
  fax: string
  armazemGeral: boolean
}

const emptyValues: FormValues = {
  codigo: '',
  nome: '',
  morada: '',
  localidade: '',
  codigoPostalId: '',
  telefone: '',
  fax: '',
  armazemGeral: false,
}

function resolveRowId(data: ArmazemTableDTO | null): string {
  if (!data) return ''
  const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
  return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function ArmazemViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: ArmazemViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [loading, setLoading] = useState(false)

  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  const tabelasPermId = modules.areaFinanceira.permissions.tabelas.id

  const { data: cpsRes } = useQuery({
    queryKey: ['codigos-postais-light-armazem', { open }],
    queryFn: () => CodigosPostaisService(tabelasPermId).getCodigosPostaisLight(),
    enabled: open,
    staleTime: 10 * 60 * 1000,
  })

  const codigosPostais = cpsRes?.info?.data ?? []

  const codigoPostalOptions = useMemo(
    () =>
      codigosPostais.map((cp) => ({
        id: cp.id,
        label: `${cp.codigo} ${cp.localidade}`.trim(),
      })),
    [codigosPostais],
  )

  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      setValues(emptyValues)
      return
    }

    const rowId = resolveRowId(viewData)
    if (!rowId) return

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const response = await ArmazemService().getArmazemById(rowId)
        if (cancelled) return

        if (
          response.info.status !== ResponseStatus.Success ||
          !response.info.data
        ) {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Não foi possível carregar o armazém.'
          toast.error(msg)
          return
        }

        const data = response.info.data
        setValues({
          codigo: data.codigo != null ? String(data.codigo) : '',
          nome: data.nome ?? '',
          morada: data.morada ?? '',
          localidade: data.localidade ?? '',
          codigoPostalId: data.codigoPostalId ?? '',
          telefone: data.telefone ?? '',
          fax: data.fax ?? '',
          armazemGeral: data.armazemGeral ?? false,
        })
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar armazém.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, mode, viewData])

  const handleGuardar = async () => {
    if (isView) return

    if (!values.nome?.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }

    const body = {
      nome: values.nome.trim(),
      morada: values.morada?.trim() || null,
      localidade: values.localidade?.trim() || null,
      codigoPostalId: values.codigoPostalId?.trim() || null,
      telefone: values.telefone?.trim() || null,
      fax: values.fax?.trim() || null,
      armazemGeral: values.armazemGeral,
    }

    try {
      const client = ArmazemService()
      const editId = resolveRowId(viewData)

      if (isEdit && editId) {
        const response = await client.updateArmazem(editId, body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Armazém atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar armazém.'
          toast.error(msg)
        }
      } else {
        const response = await client.createArmazem(body)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Armazém criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ?? 'Falha ao criar armazém.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o armazém.')
    }
  }

  const title =
    mode === 'create'
      ? 'Novo Armazém'
      : mode === 'edit'
        ? 'Editar Armazém'
        : 'Armazém'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de armazém.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='armazem-codigo'>Código</Label>
              <Input
                id='armazem-codigo'
                value={values.codigo || (mode === 'create' ? '—' : '')}
                readOnly
                className='bg-muted'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='armazem-nome'>Nome</Label>
              <Input
                id='armazem-nome'
                value={values.nome}
                onChange={(e) =>
                  setValues((p) => ({ ...p, nome: e.target.value }))
                }
                readOnly={isView}
                maxLength={40}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='armazem-morada'>Morada</Label>
              <Input
                id='armazem-morada'
                value={values.morada}
                onChange={(e) =>
                  setValues((p) => ({ ...p, morada: e.target.value }))
                }
                readOnly={isView}
                maxLength={50}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='armazem-localidade'>Localidade</Label>
              <Input
                id='armazem-localidade'
                value={values.localidade}
                onChange={(e) =>
                  setValues((p) => ({ ...p, localidade: e.target.value }))
                }
                readOnly={isView}
                maxLength={50}
              />
            </div>

            <div className='space-y-2'>
              <Label>Código postal</Label>
              <Select
                value={values.codigoPostalId || undefined}
                onValueChange={(v) =>
                  setValues((p) => ({ ...p, codigoPostalId: v }))
                }
                disabled={isView}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar código postal...' />
                </SelectTrigger>
                <SelectContent>
                  {codigoPostalOptions.map((cp) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='armazem-telefone'>Telefone</Label>
                <Input
                  id='armazem-telefone'
                  value={values.telefone}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, telefone: e.target.value }))
                  }
                  readOnly={isView}
                  maxLength={20}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='armazem-fax'>Fax</Label>
                <Input
                  id='armazem-fax'
                  value={values.fax}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, fax: e.target.value }))
                  }
                  readOnly={isView}
                  maxLength={20}
                />
              </div>
            </div>

            <div className='flex items-center justify-between gap-4'>
              <Label htmlFor='armazem-geral'>Armazém geral</Label>
              <Switch
                id='armazem-geral'
                checked={values.armazemGeral}
                onCheckedChange={(checked) =>
                  !isView && setValues((p) => ({ ...p, armazemGeral: checked }))
                }
                disabled={isView}
              />
            </div>
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
              <Button type='button' onClick={handleGuardar} disabled={loading}>
                OK
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
