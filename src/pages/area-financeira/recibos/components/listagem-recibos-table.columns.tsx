import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { ReciboTableDTO } from '@/types/dtos/faturacao/recibo.dtos'
import { Badge } from '@/components/ui/badge'

function formatMoney(value?: number | null): string {
  if (value == null) return '-'
  return Number(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value?: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-PT')
}

const baseColumns: DataTableColumnDef<ReciboTableDTO>[] = [
  {
    accessorKey: 'numeroDocumento',
    header: 'N. Documento',
    sortKey: 'numeroDocumento',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => String(row.original.numeroDocumento ?? '-'),
  },
  {
    accessorKey: 'data',
    header: 'Data',
    sortKey: 'data',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => formatDate(row.original.data),
  },
  {
    accessorKey: 'totalDocumento',
    header: 'Total Documento',
    sortKey: 'totalDocumento',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => formatMoney(row.original.totalDocumento),
  },
  {
    accessorKey: 'totalLiquido',
    header: 'Total Líquido',
    sortKey: 'totalLiquido',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => formatMoney(row.original.totalLiquido),
  },
  {
    accessorKey: 'liquidado',
    header: 'Liquidado',
    sortKey: 'liquidado',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) =>
      row.original.liquidado ? (
        <Badge variant='default'>Sim</Badge>
      ) : (
        <Badge variant='secondary'>Não</Badge>
      ),
  },
]

export const recibosColumns = baseColumns

export function getRecibosColumnsWithViewCallback(
  onOpenView: (data: ReciboTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<ReciboTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<ReciboTableDTO>({
      onOpenView,
      rowActionPermissions,
    }),
  ]
}