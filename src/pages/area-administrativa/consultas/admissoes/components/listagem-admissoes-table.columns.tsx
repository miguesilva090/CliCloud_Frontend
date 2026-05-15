import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import type { ReactNode } from 'react'

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-PT')
}

function formatTime(value?: string | null) {
  if (!value) return '-'
  const parts = value.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return value
}

const baseColumns: DataTableColumnDef<AdmissaoTableDTO>[] = [
  {
    accessorKey: 'ordem',
    header: 'Ord.',
    sortKey: 'ordem',
    enableSorting: true,
    cell: ({ row }) => row.original.ordem ?? '-',
    meta: { align: 'center' as const },
  },
  {
    accessorKey: 'data',
    header: 'Data',
    sortKey: 'data',
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.data),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'horaInicio',
    header: 'Hora',
    enableSorting: false,
    cell: ({ row }) => formatTime(row.original.horaInicio),
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
    accessorKey: 'medicoNome',
    header: 'Médico',
    enableSorting: false,
    cell: ({ row }) => row.original.medicoNome || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'especialidadeDesignacao',
    header: 'Especialidade',
    enableSorting: false,
    cell: ({ row }) => row.original.especialidadeDesignacao || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'credencial',
    header: 'Credencial',
    enableSorting: false,
    cell: ({ row }) => row.original.credencial || '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'confirmado',
    header: 'Confirm.',
    enableSorting: false,
    cell: ({ row }) => (row.original.confirmado ? 'Sim' : 'Não'),
    meta: { align: 'center' as const },
  },
  {
    accessorKey: 'efetuado',
    header: 'Efetuado',
    enableSorting: false,
    cell: ({ row }) => (row.original.efetuado ? 'Sim' : 'Não'),
    meta: { align: 'center' as const },
  },
]

export function getAdmissoesColumns(
  onOpenView: (data: AdmissaoTableDTO) => void,
  onOpenEdit?: (data: AdmissaoTableDTO) => void,
  onOpenDelete?: (data: AdmissaoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: AdmissaoTableDTO) => ReactNode
): DataTableColumnDef<AdmissaoTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<AdmissaoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      renderExtraActions,
    }),
  ]
}
