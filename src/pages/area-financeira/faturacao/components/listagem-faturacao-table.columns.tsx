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
import { podeEditarDocumento } from '../utils/listagem-faturacao-acoes'

/** Colunas só para filtros (ocultas na grelha — ver `hiddenColumns` no DataTable). */
export const FATURACAO_HIDDEN_FILTER_COLUMNS = [
  'tipoDocumentoId',
  'data_de',
  'data_ate',
  'nomecliente_de',
  'nomecliente_ate',
  'numerodocumento_de',
  'numerodocumento_ate',
  'anulado',
  'liquidado',
  'siglaficheiro',
] as const

const hiddenFilterColumn = (
  id: string,
): DataTableColumnDef<DocumentoTableDTO> => ({
  id,
  accessorKey: id,
  header: '',
  enableSorting: false,
  enableHiding: false,
  meta: { hidden: true },
  cell: () => null,
})

const visibleColumns: DataTableColumnDef<DocumentoTableDTO>[] = [
  {
    accessorKey: 'numeroExibicao',
    header: 'N.º documento',
    sortKey: 'numeroExibicao',
    enableSorting: true,
    cell: ({ row }) => getDocumentoNumeroLabel(row.original),
  },
  {
    accessorKey: 'data',
    header: 'Data',
    sortKey: 'data',
    enableSorting: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => formatDatePt(row.original.data),
  },
  {
    accessorKey: 'nomeCliente',
    header: 'Cliente',
    sortKey: 'nomeCliente',
    enableSorting: true,
    meta: { align: 'left' as const },
    cell: ({ row }) =>
      row.original.nomeCliente ?? row.original.utenteNome ?? '—',
  },
  {
    accessorKey: 'origemLabel',
    header: 'Origem',
    sortKey: 'origemLabel',
    enableSorting: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.origemLabel ?? '—',
  },
  {
    id: 'referenciaDocumento',
    accessorKey: 'referenciaDocumento',
    header: 'Ref.',
    enableSorting: false,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.referenciaDocumento?.trim() || '—',
  },
  {
    id: 'admissoesResumo',
    accessorKey: 'admissoesResumo',
    header: 'Admissões',
    enableSorting: false,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.admissoesResumo?.trim() || '—',
  },
  {
    accessorKey: 'totalDesconto',
    header: 'Total descontos',
    sortKey: 'totalDesconto',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => formatMoneyPt(row.original.totalDesconto),
  },
  {
    accessorKey: 'totalIva',
    header: 'Total imposto',
    sortKey: 'totalIva',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => formatMoneyPt(row.original.totalIva),
  },
  {
    accessorKey: 'totalDocumento',
    header: 'Total',
    sortKey: 'totalDocumento',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => formatMoneyPt(row.original.totalDocumento),
  },
  {
    id: 'estado',
    accessorKey: 'estadoDocumentoLabel',
    header: 'Estado',
    sortKey: 'estadoDocumentoLabel',
    enableSorting: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => {
      const { label, variant } = getDocumentoEstadoBadge(row.original)
      return <Badge variant={variant}>{label}</Badge>
    },
  },
]

const filterColumns: DataTableColumnDef<DocumentoTableDTO>[] =
  FATURACAO_HIDDEN_FILTER_COLUMNS.map((id) => hiddenFilterColumn(id))

export const faturacaoColumns: DataTableColumnDef<DocumentoTableDTO>[] = [
  ...visibleColumns,
  ...filterColumns,
]

export function getFaturacaoColumnsWithActions(
  onOpenView: (data: DocumentoTableDTO) => void,
  onOpenEdit: (data: DocumentoTableDTO) => void,
  renderExtraActions?: (data: DocumentoTableDTO) => ReactNode,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<DocumentoTableDTO>[] {
  return [
    ...visibleColumns,
    createAreaComumListActionsColumnDef<DocumentoTableDTO>({
      onOpenView,
      onOpenEdit,
      rowActionPermissions,
      omitDelete: true,
      isRowActionsLocked: (data) => !podeEditarDocumento(data),
      renderExtraActions,
    }),
    ...filterColumns,
  ]
}
