import type { MotivoRetencaoTableDTO } from '@/types/dtos/taxas-iva/motivo-retencao.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<MotivoRetencaoTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: false,
    meta: {
      align: 'center' as const,
      width: 'w-[80px] min-w-[80px] max-w-[100px]',
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
  {
    accessorKey: 'tipoImposto',
    header: 'Imposto',
    sortKey: 'tipoImposto',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'center' as const,
      width: 'w-[90px] min-w-[90px]',
    },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: MotivoRetencaoTableDTO) => void,
  onOpenEdit?: (data: MotivoRetencaoTableDTO) => void,
  onOpenDelete?: (data: MotivoRetencaoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<MotivoRetencaoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<MotivoRetencaoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
