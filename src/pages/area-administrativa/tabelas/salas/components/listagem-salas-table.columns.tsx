import type { SalaTableDTO } from '@/types/dtos/consultas/sala.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Badge } from '@/components/ui/badge'

export const columns: DataTableColumnDef<SalaTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'numeroSala',
    header: 'N. Sala',
    sortKey: 'numeroSala',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'ativa',
    header: 'Ativa',
    sortKey: 'ativa',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) =>
      row.original.ativa ? (
        <Badge variant='default'>Sim</Badge>
      ) : (
        <Badge variant='secondary'>Não</Badge>
      ),
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: SalaTableDTO) => void,
  onOpenEdit?: (data: SalaTableDTO) => void,
  onOpenDelete?: (data: SalaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<SalaTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<SalaTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
