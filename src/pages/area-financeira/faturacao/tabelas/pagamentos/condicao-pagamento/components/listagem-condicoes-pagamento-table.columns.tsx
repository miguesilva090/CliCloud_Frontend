import type { CondicaoPagamentoTableDTO } from '@/types/dtos/pagamentos/condicao-pagamento.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

const formatDecimal = (value: number | null | undefined) =>
  value == null ? '—' : String(value).replace('.', ',')

export const columns: DataTableColumnDef<CondicaoPagamentoTableDTO>[] = [
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
  {
    accessorKey: 'nDiasPagamento',
    header: 'N.º Dias',
    sortKey: 'nDiasPagamento',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'center' as const,
      width: 'w-[100px] min-w-[100px]',
    },
    cell: ({ row }) => formatDecimal(row.original.nDiasPagamento),
  },
  {
    accessorKey: 'desconto',
    header: 'Desconto',
    sortKey: 'desconto',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'center' as const,
      width: 'w-[100px] min-w-[100px]',
    },
    cell: ({ row }) => formatDecimal(row.original.desconto),
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: CondicaoPagamentoTableDTO) => void,
  onOpenEdit?: (data: CondicaoPagamentoTableDTO) => void,
  onOpenDelete?: (data: CondicaoPagamentoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<CondicaoPagamentoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<CondicaoPagamentoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
