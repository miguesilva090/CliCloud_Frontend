import type { MargemMedicoTableDTO } from '@/types/dtos/saude/margem-medico.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

export const margemMedicosColumns: DataTableColumnDef<MargemMedicoTableDTO>[] = [
  {
    accessorKey: 'servicoDesignacao',
        header: 'Serviço',
        sortKey: 'servicoDesignacao',
        enableSorting: true, 
        enableHiding: true, 
        meta: { align: 'left' as const },
    },
    {
        accessorKey: 'medicoNome',
        header: 'Médico',
        sortKey: 'medicoNome',
        enableSorting: true, 
        enableHiding: true, 
        meta: { align: 'left' as const },
    },
    {
        accessorKey: 'valorMargem',
        header: 'Valor Margem ',
        sortKey: 'valorMargem',
        enableSorting: true, 
        enableHiding: true, 
        meta: { align: 'left' as const },
        cell: ({ row }) => {
            const value = row.original.valorMargem ?? 0
            return <span className='tabular-nums'>{value.toFixed(2)}</span>
        },
    },
    {
        accessorKey: 'percentagemMargem',
        header: 'Margem (%)',
        sortKey: 'percentagemMargem',
        enableSorting: true, 
        enableHiding: true, 
        meta: { align: 'left' as const },
        cell: ({ row }) => {
            const value = row.original.percentagemMargem ?? 0
            return <span className='tabular-nums'>{value.toFixed(2)}</span>
        },
    },
    {
        id: 'actions',
        header: () => <div className='text-right w-full pr-5'>Opções</div>,
        cell: () => (
            <div className='flex items-center justify-end gap-1'>
                <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Ver'>
                    <Eye className='h-4 w-4' />
                </Button>
                <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    title='Editar'>
                    <Pencil className='h-4 w-4' />
                </Button>
                <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-destructive hover:text-destructive'
                    title='Apagar'>
                    <Trash2 className='h-4 w-4' />
                </Button>
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { align: 'right' as const },
    },
]

export function getMargemMedicosColumnsWithViewCallback(
    onOpenView: (data: MargemMedicoTableDTO) => void,
    onOpenEdit?: (data: MargemMedicoTableDTO) => void,
    onOpenDelete?: (data: MargemMedicoTableDTO) => void,
    rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<MargemMedicoTableDTO>[] {
    return [
        ...margemMedicosColumns.filter((c) => c.id !== 'actions'),
        createAreaComumListActionsColumnDef<MargemMedicoTableDTO>({
            onOpenView,
            onOpenEdit,
            onOpenDelete,
            rowActionPermissions,
        }),
    ]
}