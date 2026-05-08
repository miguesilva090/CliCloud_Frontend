import type { MotivoConsultaTableDTO } from '@/types/dtos/consultas/motivo-consulta-table.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<MotivoConsultaTableDTO>[] = [
  {
    accessorKey: 'designacao',
    header: 'Designação',
    sortKey: 'designacao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: MotivoConsultaTableDTO) => void,
  onOpenEdit?: (data: MotivoConsultaTableDTO) => void,
  onOpenDelete?: (data: MotivoConsultaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<MotivoConsultaTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<MotivoConsultaTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
