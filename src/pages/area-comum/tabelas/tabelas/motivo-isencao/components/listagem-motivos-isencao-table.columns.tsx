import type { MotivoIsencaoTableDTO } from '@/types/dtos/taxas-iva/motivo-isencao.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

/** Colunas alinhadas ao legado MotivoIsencaoLst (Número, Motivo, Norma, Menção, Opções). */
export const columns: DataTableColumnDef<MotivoIsencaoTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Número',
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
    header: 'Motivo',
    sortKey: 'descricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'norma',
    header: 'Norma',
    sortKey: 'norma',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.norma?.trim() ?? '',
  },
  {
    accessorKey: 'mencao',
    header: 'Menção',
    sortKey: 'mencao',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'left' as const,
      width: 'w-[200px] min-w-[160px]',
    },
    cell: ({ row }) => row.original.mencao?.trim() ?? '',
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
