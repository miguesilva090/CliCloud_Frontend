import type { ReactNode } from 'react'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'
import { Badge } from '@/components/ui/badge'
import {
  formatDatePt,
  formatMoneyPt,
  getDocumentoEstadoBadge,
  getDocumentoNumeroLabel,
} from '../utils/faturacao-documento-display'

const hiddenFilterColumn = (
  accessorKey: string,
): DataTableColumnDef<DocumentoTableDTO> => ({
  accessorKey,
  header: accessorKey,
  enableSorting: false,
  enableHiding: false,
  meta: { hidden: true },
  cell: () => null,
})

const baseColumns: DataTableColumnDef<DocumentoTableDTO>[] = [
  hiddenFilterColumn('tipoDocumentoId'),
  hiddenFilterColumn('data_de'),
  hiddenFilterColumn('data_ate'),
  hiddenFilterColumn('nomecliente_de'),
  hiddenFilterColumn('nomecliente_ate'),
  hiddenFilterColumn('numerodocumento_de'),
  hiddenFilterColumn('numerodocumento_ate'),
  hiddenFilterColumn('anulado'),
  hiddenFilterColumn('liquidado'),
  {
    accessorKey: 'tipoDocumentoAbreviatura',
    header: 'Tipo',
    sortKey: 'tipoDocumentoAbreviatura',
    enableSorting: true,
    cell: ({ row }) => row.original.tipoDocumentoAbreviatura ?? '-',
  },
  {
    accessorKey: 'tipoSerie',
    header: 'Série',
    sortKey: 'tipoSerie',
    enableSorting: true,
    cell: ({ row }) => row.original.tipoSerie ?? '-',
  },
  {
    accessorKey: 'numeroExibicao',
    header: 'N.º TFatura',
    sortKey: 'numeroExibicao',
    enableSorting: true,
    cell: ({ row }) => getDocumentoNumeroLabel(row.original),
  },
  {
    accessorKey: 'data',
    header: 'Data',
    sortKey: 'data',
    enableSorting: true,
    cell: ({ row }) => formatDatePt(row.original.data),
  },
  {
    accessorKey: 'nomeCliente',
    header: 'Cliente',
    sortKey: 'nomeCliente',
    enableSorting: true,
    cell: ({ row }) =>
      row.original.nomeCliente ?? row.original.utenteNome ?? '-',
  },
  {
    accessorKey: 'origemLabel',
    header: 'Origem',
    sortKey: 'origemLabel',
    enableSorting: true,
    cell: ({ row }) => row.original.origemLabel ?? '-',
  },
  {
    accessorKey: 'totalDesconto',
    header: 'Total desconto',
    sortKey: 'totalDesconto',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => formatMoneyPt(row.original.totalDesconto),
  },
  {
    accessorKey: 'totalIva',
    header: 'Total IVA',
    sortKey: 'totalIva',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => formatMoneyPt(row.original.totalIva),
  },
  {
    accessorKey: 'totalDocumento',
    header: 'Total fatura',
    sortKey: 'totalDocumento',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => formatMoneyPt(row.original.totalDocumento),
  },
  {
    accessorKey: 'estadoDocumentoLabel',
    header: 'Estado',
    enableSorting: false,
    cell: ({ row }) => {
      const { label, variant } = getDocumentoEstadoBadge(row.original)
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  {
    accessorKey: 'liquidado',
    header: 'Liquidado',
    sortKey: 'liquidado',
    enableSorting: true,
    cell: ({ row }) =>
      row.original.liquidado ? (
        <Badge variant='default'>Sim</Badge>
      ) : (
        <Badge variant='outline'>Não</Badge>
      ),
  },
]

export const faturacaoColumns = baseColumns

export function getFaturacaoColumnsWithActions(
  onOpenView: (data: DocumentoTableDTO) => void,
  renderExtraActions?: (data: DocumentoTableDTO) => ReactNode,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<DocumentoTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<DocumentoTableDTO>({
      onOpenView,
      rowActionPermissions,
      omitDelete: true,
      renderExtraActions,
    }),
  ]
}
