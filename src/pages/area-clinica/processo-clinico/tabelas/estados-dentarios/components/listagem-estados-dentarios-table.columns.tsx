import type { EstadosDentariosTableDTO } from '@/types/dtos/odontologia/estados-dentarios.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<EstadosDentariosTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const, width: 'w-[120px]' },
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
    accessorKey: 'estadoPadrao',
    header: 'Estado Padrão',
    cell: ({ row }) => (row.original.estadoPadrao ? 'Sim' : 'Não'),
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'center' as const, width: 'w-[130px]' },
  },
  {
    accessorKey: 'ativo',
    header: 'Ativo',
    cell: ({ row }) => (row.original.ativo ? 'Sim' : 'Não'),
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'center' as const, width: 'w-[90px]' },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: EstadosDentariosTableDTO) => void,
  onOpenEdit?: (data: EstadosDentariosTableDTO) => void,
  onOpenDelete?: (data: EstadosDentariosTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<EstadosDentariosTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<EstadosDentariosTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
