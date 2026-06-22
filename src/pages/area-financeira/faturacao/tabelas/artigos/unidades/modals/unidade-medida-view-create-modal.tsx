import { useEffect, useState } from 'react'
import type { UnidadeMedidaTableDTO } from '@/types/dtos/stocks/unidade-medida.dtos'
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
import { UnidadeMedidaService } from '@/lib/services/stocks/unidade-medida-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface UnidadeMedidaViewCreateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: ModalMode
    viewData: UnidadeMedidaTableDTO | null
    onSuccess?: () => void
}

type FormValues = {
    codigo: string
    descricao: string
}

const emptyValues: FormValues = {
    codigo: '',
    descricao: '',
}

function resolveRowId(data: UnidadeMedidaTableDTO | null): string {
    if (!data) return ''
    const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
    return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function UnidadeMedidaViewCreateModal({
    open,
    onOpenChange,
    mode,
    viewData,
    onSuccess,
}: UnidadeMedidaViewCreateModalProps) {
    const [values, setValues] = useState<FormValues>(emptyValues)
    const [loading, setLoading] = useState(false)

    const isView = mode === 'view'
    const isEdit = mode === 'edit'

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
                const response =
                    await UnidadeMedidaService().getUnidadeMedidaById(rowId)
                if (cancelled) return

                if (
                    response.info.status !== ResponseStatus.Success ||
                    !response.info.data
                ) {
                    const msg =
                        response.info.messages?.['$']?.[0] ??
                        'Não foi possível carregar a unidade.'
                    toast.error(msg)
                    return
                }

                const data = response.info.data
                setValues({
                    codigo:
                        data.codigo != null ? String(data.codigo) : '',
                    descricao: data.descricao ?? '',
                })
            } catch (error: unknown) {
                if (!cancelled) {
                    const err = error as { message?: string }
                    toast.error(err?.message ?? 'Erro ao carregar unidade.')
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

        if (!values.descricao?.trim()) {
            toast.error('Descrição é obrigatória.')
            return
        }

        const body = {
            descricao: values.descricao.trim(),
        }

        try {
            const client = UnidadeMedidaService()
            const editId = resolveRowId(viewData)

            if (isEdit && editId) {
                const response = await client.updateUnidadeMedida(editId, body)
                if (response.info.status === ResponseStatus.Success) {
                    toast.success('Unidade atualizada com sucesso.')
                    onOpenChange(false)
                    onSuccess?.()
                } else {
                    const msg =
                        response.info.messages?.['$']?.[0] ??
                        'Falha ao atualizar unidade.'
                    toast.error(msg)
                }
            } else {
                const response = await client.createUnidadeMedida(body)
                if (response.info.status === ResponseStatus.Success) {
                    toast.success('Unidade criada com sucesso.')
                    onOpenChange(false)
                    onSuccess?.()
                } else {
                    const msg =
                        response.info.messages?.['$']?.[0] ??
                        'Falha ao criar unidade.'
                    toast.error(msg)
                }
            }
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err?.message ?? 'Ocorreu um erro ao guardar a unidade.')
        }
    }

    const title =
        mode === 'create'
            ? 'Nova Unidade'
            : mode === 'edit'
              ? 'Editar Unidade'
              : 'Unidade'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Formulário de unidade de medida.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <p className='py-6 text-sm text-muted-foreground'>
                        A carregar...
                    </p>
                ) : (
                    <div className='space-y-4 py-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='unidade-codigo'>Código</Label>
                            <Input
                                id='unidade-codigo'
                                value={
                                    values.codigo ||
                                    (mode === 'create' ? '—' : '')
                                }
                                readOnly
                                className='bg-muted'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='unidade-descricao'>Descrição</Label>
                            <Input
                                id='unidade-descricao'
                                value={values.descricao}
                                onChange={(e) =>
                                    setValues((p) => ({
                                        ...p,
                                        descricao: e.target.value,
                                    }))
                                }
                                readOnly={isView}
                                maxLength={15}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {isView ? (
                        <Button
                            type='button'
                            onClick={() => onOpenChange(false)}
                        >
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
                            <Button
                                type='button'
                                onClick={handleGuardar}
                                disabled={loading}
                            >
                                OK
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
