import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { ListaEsperaTableDTO } from '@/types/dtos/consultas/lista-espera-administrativo.dtos'
import type { ReactNode } from 'react'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-PT')
}

function formatTime(value?: string | null) {
  if (!value) return '—'
  const parts = value.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return value
}

/** Colunas alinhadas a ListaEsperaLst.aspx (legado). */
const baseColumns: DataTableColumnDef<ListaEsperaTableDTO>[] = [
  {
    accessorKey: 'utenteNome',
    header: 'Utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNome || '—',
  },
  {
    accessorKey: 'utenteTelefone',
    header: 'Tel. utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteTelefone || '—',
  },
  {
    accessorKey: 'utenteNumero',
    header: 'Cód. utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNumero || '—',
  },
  {
    accessorKey: 'medicoNome',
    header: 'Médico',
    enableSorting: false,
    cell: ({ row }) => row.original.medicoNome || '—',
  },
  {
    accessorKey: 'especialidadeDesignacao',
    header: 'Especialidade',
    enableSorting: false,
    cell: ({ row }) => row.original.especialidadeDesignacao || '—',
  },
  {
    accessorKey: 'data',
    header: 'Data',
    sortKey: 'data',
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.data),
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    enableSorting: false,
    cell: ({ row }) => row.original.organismoNome || '—',
  },
  {
    accessorKey: 'prioridadeDesignacao',
    header: 'Prioridade',
    enableSorting: false,
    cell: ({ row }) => row.original.prioridadeDesignacao || '—',
  },
  {
    accessorKey: 'horaInicio',
    header: 'Hora pretendida',
    enableSorting: false,
    cell: ({ row }) => formatTime(row.original.horaInicio),
  },
]

export function getListaEsperaColumns(
  onOpenView: (data: ListaEsperaTableDTO) => void,
  onOpenEdit?: (data: ListaEsperaTableDTO) => void,
  onOpenDelete?: (data: ListaEsperaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: ListaEsperaTableDTO) => ReactNode
): DataTableColumnDef<ListaEsperaTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<ListaEsperaTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      isRowActionsLocked: (row) => row.convertido === true,
      renderExtraActions,
    }),
  ]
}
