import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ResponseStatus } from '@/types/api/responses';
import type { LoteDirectTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos';
import { toast } from '@/utils/toast-utils';
import { usePassarLoteDirectParaAtivo } from '../queries/lote-direct-ativo-mutation';

const MESES = [
    { value: '1', label: 'Janeiro'},
    { value: '2', label: 'Fevereiro'},
    { value: '3', label: 'Março'},
    { value: '4', label: 'Abril'},
    { value: '5', label: 'Maio'},
    { value: '6', label: 'Junho'},
    { value: '7', label: 'Julho'},
    { value: '8', label: 'Agosto'},
    { value: '9', label: 'Setembro'},
    { value: '10', label: 'Outubro'},
    { value: '11', label: 'Novembro'},
    { value: '12', label: 'Dezembro'},
]

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    row: LoteDirectTableDTO | null
    onSuccess: () => void
}

export function PassarParaAtivoModal({ open, onOpenChange, row, onSuccess }: Props) {
    const now = new Date()
    const mutation = usePassarLoteDirectParaAtivo()
    const [novoMes, setNovoMes] = useState(String(now.getMonth() + 1))
    const [novoAno, setNovoAno] = useState(String(now.getFullYear()))

    const handleConfirm = async () => {
        if (!row?.id) return
        
        const mes = Number(novoMes)
        const ano = Number(novoAno)

        if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
            toast.error('Selecione um mês válido')
            return
        }

        if (!Number.isInteger(ano) || ano < 1900) {
            toast.error('Indique um ano válido')
            return
        }

        try
        {
            const res = await mutation.mutateAsync({
                loteDirectId: row.id,
                novoMes: mes,
                novoAno: ano,
            })

            if (res.info.status === ResponseStatus.Success) {
                toast.success('Credencial passou para ativo.')
                onSuccess?.()
                onOpenChange(false)
                return
            }

            toast.error(res.info.messages?.['$']?.[0] ?? 'Não foi possível passar para ativo')
        } catch (error) {
            toast.error((error as Error)?.message ?? 'Erro ao passar para ativo')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle>Passar para ativo</DialogTitle>
                    <DialogDescription>
                    Vai reativar a credencial selecionada, aplicando o novo mês/ano e recalculando o lote
                    no período destino.
                    </DialogDescription>
                </DialogHeader>

                <div className='grid gap-4 py-2'>
                    <div className='grid gap-2'>
                        <Label htmlFor='passar-ativo-mes'>Novo mês</Label>
                        <Select value={novoMes} onValueChange={setNovoMes} disabled={mutation.isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder='Selecione o mês' />
                            </SelectTrigger>
                            <SelectContent>
                                {MESES.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='grid gap-2'>
                        <Label htmlFor='passar-ativo-ano'>Novo ano</Label>
                        <Input 
                            id='passar-ativo-ano'
                            type='number'
                            min={1900}
                            value={novoAno}
                            onChange={(e) => setNovoAno(e.target.value)}
                            disabled={mutation.isPending}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancelar</Button>
                    <Button type='button' onClick={() => void handleConfirm()} disabled={mutation.isPending}>{mutation.isPending ? 'A processar...' : 'Confirmar'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}