import type { MoedaTableDTO } from '@/types/dtos/moedas/moeda.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

export const columns: DataTableColumnDef<MoedaTableDTO>[] = [
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    sortKey: 'descricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'plural',
    header: 'Plural',
    sortKey: 'plural',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'cambio',
    header: 'Câmbio',
    sortKey: 'cambio',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => {
      const val = row.original.cambio
      return val != null
        ? Number(val).toLocaleString('pt-PT', { minimumFractionDigits: 6 })
        : '—'
    },
  },
  {
    accessorKey: 'abreviatura',
    header: 'Abreviatura',
    sortKey: 'abreviatura',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'centesimos',
    header: 'Centésimos',
    sortKey: 'centesimos',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'centesimoPlural',
    header: 'Centésimo Plural',
    sortKey: 'centesimoPlural',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'simbolo',
    header: 'Símbolo',
    sortKey: 'simbolo',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
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
          title='Ver'
        >
          <Eye className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          title='Editar'
        >
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

export function getColumnsWithViewCallback(
  onOpenView: (data: MoedaTableDTO) => void,
  onOpenEdit?: (data: MoedaTableDTO) => void,
  onOpenDelete?: (data: MoedaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<MoedaTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<MoedaTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}

