import type { SubsistemaArtigoTableDTO } from '@/types/dtos/stocks/subsistema-artigo.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

const money = (v: number) => (
  <span className='tabular-nums'>{Number(v ?? 0).toFixed(2)}</span>
)

export const columns: DataTableColumnDef<SubsistemaArtigoTableDTO>[] = [
  {
    accessorKey: 'codigoCartaoInstituicao',
    header: 'Cartão Inst.',
    sortKey: 'codigoCartaoInstituicao',
    enableSorting: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    sortKey: 'organismoNome',
    enableSorting: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => <span>{row.original.organismoNome ?? '—'}</span>,
  },
  {
    accessorKey: 'artigoDescricao',
    header: 'Artigo',
    sortKey: 'artigoDescricao',
    enableSorting: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => (
      <span>
        {row.original.artigoDescricao ?? '—'}
        {row.original.artigoNumero ? ` [${row.original.artigoNumero}]` : ''}
      </span>
    ),
  },
  {
    accessorKey: 'valorServico',
    header: 'Val. Serv.',
    sortKey: 'valorServico',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => money(row.original.valorServico),
  },
  {
    accessorKey: 'margemOrganismoPercent',
    header: 'Margem %',
    sortKey: 'margemOrganismoPercent',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => money(row.original.margemOrganismoPercent),
  },
  {
    accessorKey: 'valorOrganismo',
    header: 'Val. Org.',
    sortKey: 'valorOrganismo',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => money(row.original.valorOrganismo),
  },
  {
    accessorKey: 'valorUtente',
    header: 'Val. Utente',
    sortKey: 'valorUtente',
    enableSorting: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => money(row.original.valorUtente),
  },
  {
    accessorKey: 'inativo',
    header: 'Estado',
    sortKey: 'inativo',
    enableSorting: true,
    meta: { align: 'center' as const },
    cell: ({ row }) => (
      <span>{row.original.inativo ? 'Inativo' : 'Ativo'}</span>
    ),
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: SubsistemaArtigoTableDTO) => void,
  onOpenEdit?: (data: SubsistemaArtigoTableDTO) => void,
  onOpenDelete?: (data: SubsistemaArtigoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
) {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<SubsistemaArtigoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
