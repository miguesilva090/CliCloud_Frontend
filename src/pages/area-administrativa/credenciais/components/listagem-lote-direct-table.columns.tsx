import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { LoteDirectTableDTO } from '@/types/dtos/credenciais/lote-direct.dtos'
import type { ReactNode } from 'react'

function formatMoney(value?: number | null): string {
  if (value == null) return '-'
  return Number(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const baseColumns: DataTableColumnDef<LoteDirectTableDTO>[] = [
  {
    accessorKey: 'credencial',
    header: 'Credencial',
    sortKey: 'credencial',
    enableSorting: true,
    cell: ({ row }) => row.original.credencial || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'utenteNumero',
    header: 'Cód. Utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNumero || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNome || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'mesAno',
    header: 'Mês/Ano',
    enableSorting: false,
    cell: ({ row }) => row.original.mesAno || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'numeroLote',
    header: 'N.º Lote',
    sortKey: 'numeroLote',
    enableSorting: true,
    cell: ({ row }) =>
      row.original.numeroLote != null ? String(row.original.numeroLote) : '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'codigoOrganismo',
    header: 'Organismo',
    sortKey: 'codigoOrganismo',
    enableSorting: true,
    cell: ({ row }) => {
      const sigla = row.original.organismoSigla?.trim()
      const cod = row.original.codigoOrganismo
      if (sigla) {
        return (
          <span title={cod != null ? `Código ULS: ${cod}` : undefined}>{sigla}</span>
        )
      }
      if (cod != null) return String(cod)
      return '-'
    },
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'valorTaxas',
    header: 'Taxas',
    enableSorting: false,
    cell: ({ row }) => formatMoney(row.original.valorTaxas),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'valorTotal',
    header: 'Total',
    enableSorting: false,
    cell: ({ row }) => formatMoney(row.original.valorTotal),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'tipoServico',
    header: 'Tipo Serviço',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.tipoServico != null ? String(row.original.tipoServico) : '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoLote',
    header: 'Tipo Lote',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.tipoLote != null ? String(row.original.tipoLote) : '-',
    meta: { align: 'left' as const },
  },
]

export function getLoteDirectColumns(
  onOpenView: (data: LoteDirectTableDTO) => void,
  onOpenEdit?: (data: LoteDirectTableDTO) => void,
  onOpenDelete?: (data: LoteDirectTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: LoteDirectTableDTO) => ReactNode
): DataTableColumnDef<LoteDirectTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<LoteDirectTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      renderExtraActions,
    }),
  ]
}