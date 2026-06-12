import type { ContaBancariaTableDTO } from '@/types/dtos/bancos/conta-bancaria.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<ContaBancariaTableDTO>[] = [
  {
    accessorKey: 'numero',
    header: 'Número',
    sortKey: 'numero',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoConta',
    header: 'Tipo de Conta',
    sortKey: 'tipoConta',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'bancoNome',
    header: 'Instituição Financeira',
    sortKey: 'bancoNome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.bancoNome ?? '—',
  },
  {
    accessorKey: 'iban',
    header: 'IBAN',
    sortKey: 'iban',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.iban ?? '—',
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: ContaBancariaTableDTO) => void,
  onOpenEdit?: (data: ContaBancariaTableDTO) => void,
  onOpenDelete?: (data: ContaBancariaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<ContaBancariaTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<ContaBancariaTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
