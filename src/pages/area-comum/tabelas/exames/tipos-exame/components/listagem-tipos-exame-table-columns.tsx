import type { TipoExameTableDTO } from '@/types/dtos/exames/tipo-exame'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

const formatPreco = (value: number) =>
  Number.isNaN(Number(value))
    ? '—'
    : Number(value).toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

export const columns: DataTableColumnDef<TipoExameTableDTO>[] = [
  {
    accessorKey: 'designacao',
    header: 'Designação',
    sortKey: 'designacao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'preco',
    header: 'Preço',
    sortKey: 'preco',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => formatPreco(row.original.preco),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'ean',
    header: 'EAN',
    sortKey: 'ean',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (row.original.ean?.trim() ? row.original.ean : '—'),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'inativo',
    header: 'Inativo',
    sortKey: 'inativo',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (row.original.inativo ? 'Inactivo' : 'Ativo'),
    meta: { align: 'center' as const },
  },
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
  onOpenView: (data: TipoExameTableDTO) => void,
  onOpenEdit?: (data: TipoExameTableDTO) => void,
  onOpenDelete?: (data: TipoExameTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<TipoExameTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<TipoExameTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}

