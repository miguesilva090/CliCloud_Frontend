import { useEffect, useState } from 'react'
import type { MotivosDesmarcacaoTableDTO } from '@/types/dtos/motivos-desmarcacao/motivos-desmarcacao.dtos'
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
import { MotivosDesmarcacaoService } from '@/lib/services/motivos-desmarcacao'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface MotivosDesmarcacaoViewCreateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: ModalMode
    viewData: MotivosDesmarcacaoTableDTO | null
    onSuccess?: () => void
}

type FormValues = {
    descricao: string
}

export function MotivosDesmarcacaoViewCreateModal({
    open,
    onOpenChange,
    mode,
    viewData,
    onSuccess,
}: MotivosDesmarcacaoViewCreateModalProps) {
    const [values, setValues] = useState<FormValues>({
        descricao: '',
    })

    const isView = mode === 'view'
    const isEdit = mode === 'edit'

    useEffect(() => {
        if (open && (isView || isEdit) && viewData) {
            setValues({
                descricao: viewData.descricao ?? '',
            })
        }
        if (open && mode === 'create') {
            setValues({
                descricao: '',
            })
        }
    }, [open, mode, isView, isEdit, viewData])

    const handleGuardar = async () => {
        if (isView) return

        if (!values.descricao?.trim()) {
            toast.error('Descrição é obrigatória.')
            return
        }

        try {
            const client = MotivosDesmarcacaoService()

            const rawId =
                viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
            const editId =
                typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

            if (isEdit && (!editId || editId === 'undefined')) {
                toast.error(
                    'Não foi possível identificar o registo a atualizar. Feche e abra novamente a edição.'
                )
                return
            }

            if (isEdit && viewData && editId) {
                const body = { descricao: values.descricao.trim() }
                const response = await client.updateMotivosDesmarcacao(editId, body)
                const status = (response.info as { status?: number })?.status
                if (status === ResponseStatus.Success) {
                    toast.success('Motivo de desmarcação atualizado com sucesso.')
                    onOpenChange(false)
                    onSuccess?.()
                } else {
                    const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao atualizar Motivo de Desmarcação.'
                    toast.error(msg)
                }
            } else {
                const body = { descricao: values.descricao.trim() }
                const response = await client.createMotivosDesmarcacao(body)
                const status = (response.info as { status?: number })?.status
                if (status === ResponseStatus.Success) {
                    toast.success('Motivo de desmarcação criado com sucesso.')
                    onOpenChange(false)
                    onSuccess?.()
                } else {
                    const msg = (response.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ?? 'Falha ao criar Motivo de Desmarcação.'
                    toast.error(msg)
                }
            }
        } catch (error: unknown) {
            const err = error as { message?: string }
            toast.error(err?.message ?? 'Ocorreu um erro ao guardar o Motivo de Desmarcação.')
        }
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>{'CliCloud'}</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Formulário para ver, criar ou editar motivo de desmarcação.
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <div className='grid gap-2'>
                        <Label>Descrição</Label>
                        <Input
                            readOnly={isView}
                            value={values.descricao}
                            maxLength={100}
                            placeholder='Descrição...'
                            onChange={(e) =>
                                setValues((prev) => ({ ...prev, descricao: e.target.value }))
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    {isView ? (
                        <Button type='button' onClick={() => onOpenChange(false)}>
                            OK
                        </Button>
                    ) : (
                        <>
                            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type='button' onClick={handleGuardar}>
                                OK
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}