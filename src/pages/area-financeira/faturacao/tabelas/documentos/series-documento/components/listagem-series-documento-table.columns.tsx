import type { TipoDocumentoTableDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<TipoDocumentoTableDTO>[] = [
  {
    accessorKey: 'codigoTipoDocumentoSaft',
    header: 'Tipo SAFT',
    sortKey: 'codigoTipoDocumentoSaft',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.codigoTipoDocumentoSaft ?? '—',
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
    accessorKey: 'abreviatura',
    header: 'Abreviatura',
    sortKey: 'abreviatura',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'numeroSerie',
    header: 'Série',
    sortKey: 'numeroSerie',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.numeroSerie ?? '—',
  },
  {
    accessorKey: 'natureza',
    header: 'Natureza',
    sortKey: 'natureza',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.natureza ?? '—',
  },
  {
    accessorKey: 'numVias',
    header: 'Vias',
    sortKey: 'numVias',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => row.original.numVias ?? '—',
  },
  {
    accessorKey: 'numeroDocumento',
    header: 'Nº Doc.',
    sortKey: 'numeroDocumento',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => row.original.numeroDocumento ?? '—',
  },
  {
    accessorKey: 'inactivo',
    header: 'Inactivo',
    sortKey: 'inactivo',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'center' as const },
    cell: ({ row }) => (row.original.inactivo ? 'Sim' : 'Não'),
  },
  {
    accessorKey: 'codigoATCUD',
    header: 'ATCUD',
    sortKey: 'codigoATCUD',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.codigoATCUD ?? '—',
  },
  {
    accessorKey: 'atcudEstado',
    header: 'Estado ATCUD',
    sortKey: 'atcudEstado',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.atcudEstado ?? '—',
  },
  {
    accessorKey: 'mostraFaturacao',
    header: 'Visível Faturação',
    sortKey: 'mostraFaturacao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'center' as const },
    cell: ({ row }) => (row.original.mostraFaturacao ? 'Sim' : 'Não'),
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: TipoDocumentoTableDTO) => void,
  onOpenEdit?: (data: TipoDocumentoTableDTO) => void,
  onOpenDelete?: (data: TipoDocumentoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<TipoDocumentoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<TipoDocumentoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
