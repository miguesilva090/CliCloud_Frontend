import type { AnaliseTableDTO } from '@/types/dtos/exames/analises'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

export const columns: DataTableColumnDef<AnaliseTableDTO>[] = [
    { accessorKey: 'nome', header: 'Nome', sortKey: 'nome', enableSorting: true, enableHiding: true, meta: { align: 'left' as const } },
    { accessorKey: 'unidadeMedida', header: 'Unidade de Medida', sortKey: 'unidadeMedida', enableSorting: true, enableHiding: true, meta: { align: 'left' as const } },
    { accessorKey: 'valoresReferencia', header: 'Valores de Referência', sortKey: 'valoresReferencia', enableSorting: true, enableHiding: true, meta: { align: 'left' as const } },
    { 
        id: 'actions',
        header: () => <div className='text-right w-full pr-5'>Opções</div>,
        cell: () => (
            <div className='flex items-center justify-end gap-1'>
                <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Ver'>
                    <Eye className='h-4 w-4' />
                </Button>
                <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Editar'>
                    <Pencil className='h-4 w-4' />
                </Button>
                <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-destructive hover:text-destructive' title='Apagar'>
                    <Trash2 className='h-4 w-4' />
                </Button>
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { align: 'right' as const },
    },
]

export function getColumnsWithViewCallback(
    onOpenView: (data: AnaliseTableDTO) => void,
    onOpenEdit?: (data: AnaliseTableDTO) => void,
    onOpenDelete?: (data: AnaliseTableDTO) => void,
): DataTableColumnDef<AnaliseTableDTO>[] {
    return [
        ...columns.filter((c) => c.id !== 'actions'),
        {
            id: 'actions',
            header: () => <div className='text-right w-full pr-5'>Opções</div>,
            cell: ({ row }) => (
                <div className='flex items-center justify-end gap-1'>
                    <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Ver' onClick={() => onOpenView(row.original)}>
                        <Eye className='h-4 w-4' />
                    </Button>
                    <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Editar' onClick={() => onOpenEdit?.(row.original)}>
                        <Pencil className='h-4 w-4' />
                    </Button>
                    <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-destructive hover:text-destructive' title='Apagar' onClick={() => onOpenDelete?.(row.original)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            meta: { align: 'right' as const },
        },
    ]
}