import type { ZonaComercialTableDTO } from '@/types/dtos/faturacao/zona-comercial.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<ZonaComercialTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Número',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: false,
    meta: {
      align: 'center' as const,
      width: 'w-[90px] min-w-[90px]',
    },
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    sortKey: 'descricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: ZonaComercialTableDTO) => void,
  onOpenEdit?: (data: ZonaComercialTableDTO) => void,
  onOpenDelete?: (data: ZonaComercialTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<ZonaComercialTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<ZonaComercialTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
