import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { ListaEsperaTratamentoTableDTO } from '@/types/dtos/tratamentos/lista-espera-tratamento-administrativo.dtos'
import type { ReactNode } from 'react'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-PT')
}

const baseColumns: DataTableColumnDef<ListaEsperaTratamentoTableDTO>[] = [
  {
    accessorKey: 'ordem',
    header: 'Ordem',
    sortKey: 'ordem',
    enableSorting: true,
    cell: ({ row }) => row.original.ordem ?? '—',
  },
  {
    accessorKey: 'dataEntrada',
    header: 'Data entrada',
    sortKey: 'dataEntrada',
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.dataEntrada),
  },
  {
    accessorKey: 'utenteNome',
    header: 'Utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNome || '—',
  },
  {
    accessorKey: 'designacao',
    header: 'Designação',
    enableSorting: false,
    cell: ({ row }) => row.original.designacao || '—',
  },
  {
    accessorKey: 'numSessoes',
    header: 'N.º sessões',
    enableSorting: false,
    cell: ({ row }) => row.original.numSessoes ?? '—',
  },
  {
    accessorKey: 'prioridadeDesignacao',
    header: 'Prioridade',
    enableSorting: false,
    cell: ({ row }) => row.original.prioridadeDesignacao || '—',
  },
  {
    accessorKey: 'estadoDesignacao',
    header: 'Estado',
    enableSorting: false,
    cell: ({ row }) => row.original.estadoDesignacao || '—',
  },
  {
    accessorKey: 'credencial',
    header: 'Credencial',
    enableSorting: false,
    cell: ({ row }) => row.original.credencial || '—',
  },
  {
    accessorKey: 'validadeCredencial',
    header: 'Validade credencial',
    enableSorting: false,
    cell: ({ row }) => formatDate(row.original.validadeCredencial),
  },
  {
    accessorKey: 'localTratamentoDesignacao',
    header: 'Local',
    enableSorting: false,
    cell: ({ row }) => row.original.localTratamentoDesignacao || '—',
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    enableSorting: false,
    cell: ({ row }) => row.original.organismoNome || '—',
  },
]

export function getListaEsperaTratamentoColumns(
  onOpenView: (data: ListaEsperaTratamentoTableDTO) => void,
  onOpenEdit?: (data: ListaEsperaTratamentoTableDTO) => void,
  onOpenDelete?: (data: ListaEsperaTratamentoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: ListaEsperaTratamentoTableDTO) => ReactNode
): DataTableColumnDef<ListaEsperaTratamentoTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<ListaEsperaTratamentoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      renderExtraActions,
    }),
  ]
}
