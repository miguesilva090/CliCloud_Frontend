import type { SeguradoraTableDTO } from '@/types/dtos/seguradoras/seguradora.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<SeguradoraTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'abreviatura',
    header: 'Abrev.',
    sortKey: 'abreviatura',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'apolice',
    header: 'Apólice',
    sortKey: 'apolice',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'avenca',
    header: 'Avença',
    sortKey: 'avenca',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'right' as const },
    cell: ({ row }) =>
      row.original.avenca != null
        ? row.original.avenca.toLocaleString('pt-PT', { minimumFractionDigits: 2 })
        : '—',
  },
  {
    accessorKey: 'createdOn',
    header: 'Criado em',
    sortKey: 'createdOn',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => {
      const dt = row.original.createdOn ? new Date(row.original.createdOn) : null
      return dt ? dt.toLocaleString('pt-PT') : '—'
    },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: SeguradoraTableDTO) => void,
  onOpenEdit?: (data: SeguradoraTableDTO) => void,
  onOpenDelete?: (data: SeguradoraTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<SeguradoraTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<SeguradoraTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
