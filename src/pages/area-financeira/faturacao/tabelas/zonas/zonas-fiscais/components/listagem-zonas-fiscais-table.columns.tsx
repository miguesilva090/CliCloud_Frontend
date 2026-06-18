import type { ZonaFiscalTableDTO } from '@/types/dtos/faturacao/zona-fiscal.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<ZonaFiscalTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: false,
    meta: {
      align: 'center' as const,
      width: 'w-[80px] min-w-[80px]',
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
  onOpenView: (data: ZonaFiscalTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<ZonaFiscalTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<ZonaFiscalTableDTO>({
      onOpenView,
      rowActionPermissions,
      omitDelete: true,
      isRowActionsLocked: () => true,
    }),
  ]
}
