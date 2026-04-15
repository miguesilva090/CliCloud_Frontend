import { useEffect , useState } from 'react'
import type 
{
    CreateFeriadoRequest,
    FeriadoDTO,
    UpdateFeriadoRequest,
} from '@/types/dtos/utility/feriado.dtos'
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
import { FeriadoService } from '@/lib/services/utility/feriados-service'
import { ResponseStatus } from '@/types/api/responses'

type ModalMode = 'view' | 'create' | 'edit'

interface FeriadoViewCreateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: ModalMode
    viewData: FeriadoDTO | null
    onSuccess: () => void
}

type FormValues = {
    data: string
    designacao: string
    ativo: boolean
}

function toInputDate(value?: string): string {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
}

export function FeriadoViewCreateModal({
    open,
    onOpenChange,
    mode,
    viewData,
    onSuccess,
}: FeriadoViewCreateModalProps) {
    const [values, setValues] = useState<FormValues>({
        data: '',
        designacao: '',
        ativo: true,
    })

    const isView = mode === 'view'
    const isEdit = mode === 'edit'
    
    useEffect(() => {
        if (open && (isView || isEdit) && viewData) {
            setValues({
                data: toInputDate(viewData.data),
                designacao: viewData.designacao ?? '',
                ativo: viewData.ativo ?? true,
            })
        }

        if ( open && mode === 'create') {
            setValues({
                data: '',
                designacao: '',
                ativo: true,
            })
        }
    }, [open, mode, isView, isEdit, viewData])

    const handleClose = () => onOpenChange(false)

    const handleGuardar = async () => {
        if (isView) return 

        if (!values.data) {
            toast.error('Data é obrigatória.')
            return
        }

        if(!values.designacao.trim()) {
            toast.error('Designação é obrigatória.')
            return
        }

        try {
            const client = FeriadoService()

            const bodyCreate: CreateFeriadoRequest = {
                data: new Date(values.data).toISOString(),
                designacao: values.designacao.trim(),
            }

            const bodyUpdate: UpdateFeriadoRequest = {
                ...bodyCreate,
                ativo: values.ativo,
            }

            const response = 
                isEdit && viewData?.id
                    ? await client.updateFeriado(viewData.id, bodyUpdate)
                    : await client.createFeriado(bodyCreate)

            if (response.info?.status === ResponseStatus.Success) {
                toast.success(isEdit ? 'Feriado atualizado com sucesso.' : 'Feriado criado com sucesso.')
                onOpenChange(false)
                onSuccess?.()
            } else {
                const msg = 
                    response.info.messages?.['$']?.[0] ?? 
                    (isEdit ? 'Falha ao atualizar feriado.' : 'Falha ao criar feriado.')
                toast.error(msg)
            }
    } catch ( error: unknown) {
        const err = error as { message?: string }
        toast.error(err?.message ?? 'Ocorreu um erro ao guardar o feriado.')
    }
}

const title = 
    mode === 'view' ? 'Feriado' : mode === 'edit' ? 'Editar Feriado' : 'Adicionar Feriado'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className='sr-only'>
                        Formulário para ver, criar ou editar feriados. 
                    </DialogDescription>
                </DialogHeader>

                <div className='grid gap-4 py-4'>
                    <div className='grid gap-2'>
                        <Label>Data</Label>
                        <Input
                            type='date'
                            readOnly={isView}
                            value={values.data}
                            onChange={(e) => setValues((prev) => ({ ...prev, data: e.target.value}))}
                        />
                    </div>

                    <div className='grid gap-2'>
                        <Label>Designação</Label>
                        <Input 
                            readOnly={isView}
                            value={values.designacao}
                            maxLength={150}
                            placeholder='Ex: Dia de Portugal'
                            onChange={(e) => setValues((prev) => ({ ...prev, designacao: e.target.value }))}
                        />
                    </div>

                    {(isEdit || isView ) && (
                        <div className='flex items-center gap-2'>
                            <input 
                                id='feriado-ativo'
                                type='checkbox'
                                checked={values.ativo}
                                disabled={isView}
                                onChange={(e) => setValues((prev) => ({ ...prev, ativo: e.target.checked }))}
                            />
                            <Label htmlFor='feriado-ativo'>Ativo</Label>
                        </div>
                    )}
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