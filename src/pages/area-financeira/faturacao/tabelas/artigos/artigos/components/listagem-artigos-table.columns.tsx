import type { ArtigoTableDTO } from '@/types/dtos/stocks/artigo.dtos'
import { TIPO_ARTIGO_OPTIONS } from '@/types/dtos/stocks/artigo.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

function labelTipo(tipo: number) {
  return TIPO_ARTIGO_OPTIONS.find((o) => o.value === tipo)?.label ?? String(tipo)
}

export const columns: DataTableColumnDef<ArtigoTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: false,
    meta: { align: 'left' as const, width: 'w-[72px] min-w-[72px]' },
  },
  {
    accessorKey: 'numeroArtigo',
    header: 'Nº Artigo',
    sortKey: 'numeroArtigo',
    enableSorting: true,
    meta: { align: 'left' as const, width: 'w-[100px] min-w-[100px]' },
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    sortKey: 'descricao',
    enableSorting: true,
  },
  {
    accessorKey: 'armazemNome',
    header: 'Armazém',
    sortKey: 'armazemNome',
    enableSorting: true,
  },
  {
    accessorKey: 'precoUnitarioSemIva1',
    header: 'PU',
    sortKey: 'precoUnitarioSemIva1',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => Number(row.original.precoUnitarioSemIva1 ?? 0).toFixed(2),
  },
  {
    accessorKey: 'precoVendaComIva1',
    header: 'PVP',
    sortKey: 'precoVendaComIva1',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => Number(row.original.precoVendaComIva1 ?? 0).toFixed(2),
  },
  {
    accessorKey: 'tipoArtigo',
    header: 'Tipo',
    sortKey: 'tipoArtigo',
    enableSorting: true,
    cell: ({ row }) => labelTipo(row.original.tipoArtigo),
  },
  {
    accessorKey: 'inativo',
    header: 'Inativo',
    sortKey: 'inativo',
    enableSorting: true,
    meta: { align: 'center' as const },
    cell: ({ row }) => (row.original.inativo ? 'Sim' : ''),
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: ArtigoTableDTO) => void,
  onOpenEdit?: (data: ArtigoTableDTO) => void,
  onOpenDelete?: (data: ArtigoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<ArtigoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<ArtigoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
