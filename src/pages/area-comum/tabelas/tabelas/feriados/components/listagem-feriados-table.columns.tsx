import type { FeriadoDTO } from '@/types/dtos/utility/feriado.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

export const columns: DataTableColumnDef<FeriadoDTO>[] = [
  {
    accessorKey: 'data',
    header: 'Data',
    sortKey: 'data',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => {
      const value = row.original.data
      const dt = value ? new Date(value) : null
      return dt ? dt.toLocaleDateString('pt-PT') : '-'
    },
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'designacao',
    header: 'Designacao',
    sortKey: 'designacao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'ativo',
    header: 'Ativo',
    sortKey: 'ativo',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (row.original.ativo ? 'Sim' : 'Não'),
    meta: { align: 'left' as const },
  },
  {
    id: 'actions',
    header: () => <div className='w-full pr-5 text-right'>Opções</div>,
    cell: () => (
      <div className='flex w-full items-center justify-end gap-1'>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Ver'>
          <Eye className='h-4 w-4' />
        </Button>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Editar'>
          <Pencil className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive'
          title='Apagar'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' as const },
  },
]

export function getColumnsWithViewCallbacks(
  onOpenView: (data: FeriadoDTO) => void,
  onOpenEdit?: (data: FeriadoDTO) => void,
  onOpenDelete?: (data: FeriadoDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<FeriadoDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<FeriadoDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
