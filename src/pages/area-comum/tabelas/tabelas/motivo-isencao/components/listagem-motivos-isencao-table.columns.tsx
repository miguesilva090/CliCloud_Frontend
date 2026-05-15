import type { MotivoIsencaoTableDTO } from '@/types/dtos/taxas-iva/motivo-isencao.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<MotivoIsencaoTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
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
    accessorKey: 'createdOn',
    header: 'Criado em',
    sortKey: 'createdOn',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => {
      const raw = row.original.createdOn
      if (!raw) return '—'
      try {
        return new Date(raw).toLocaleString()
      } catch {
        return String(raw)
      }
    },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: MotivoIsencaoTableDTO) => void,
  onOpenEdit?: (data: MotivoIsencaoTableDTO) => void,
  onOpenDelete?: (data: MotivoIsencaoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<MotivoIsencaoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<MotivoIsencaoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
