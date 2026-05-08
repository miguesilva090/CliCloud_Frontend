import type { EstadoSinistroDTO } from '@/types/dtos/sinistrados/estado-sinistro.dto'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

const columns: DataTableColumnDef<EstadoSinistroDTO>[] = [
  {
    accessorKey: 'designacao',
    header: 'Designação',
    sortKey: 'designacao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
]

export function getEstadoSinistroColumns(
  onOpenView: (data: EstadoSinistroDTO) => void,
  onOpenEdit?: (data: EstadoSinistroDTO) => void,
  onOpenDelete?: (data: EstadoSinistroDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<EstadoSinistroDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<EstadoSinistroDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
