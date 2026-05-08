import type { TipoCartaTableDTO } from '@/types/dtos/utility/tipo-carta.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<TipoCartaTableDTO>[] = [
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    sortKey: 'descricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'obs',
    header: 'Obs',
    sortKey: 'obs',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: TipoCartaTableDTO) => void,
  onOpenEdit?: (data: TipoCartaTableDTO) => void,
  onOpenDelete?: (data: TipoCartaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<TipoCartaTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<TipoCartaTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
