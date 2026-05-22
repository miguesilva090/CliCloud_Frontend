import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
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

function formatStatus(row: MarcacaoAdministrativoTableDTO): string {
  if (row.statusConsultaLabel?.trim()) return row.statusConsultaLabel
  switch (row.statusConsulta) {
    case 0:
      return 'Agendada'
    case 2:
      return 'Desmarcada'
    case 4:
      return 'Suspensa'
    default:
      return '—'
  }
}

const baseColumns: DataTableColumnDef<MarcacaoAdministrativoTableDTO>[] = [
  {
    accessorKey: 'data',
    header: 'Data',
    sortKey: 'data',
    enableSorting: true,
    cell: ({ row }) => formatDate(row.original.data),
    meta: { align: 'left' },
  },
  {
    accessorKey: 'horaInicio',
    header: 'Hora',
    sortKey: 'horaInicio',
    enableSorting: true,
    cell: ({ row }) => formatTime(row.original.horaInicio),
    meta: { align: 'left', width: 'w-[72px]' },
  },
  {
    accessorKey: 'utenteNumero',
    header: 'N.º Utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNumero || '—',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Utente',
    enableSorting: false,
    cell: ({ row }) => row.original.utenteNome || '—',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'medicoNome',
    header: 'Médico',
    enableSorting: false,
    cell: ({ row }) => row.original.medicoNome || '—',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'especialidadeDesignacao',
    header: 'Especialidade',
    enableSorting: false,
    cell: ({ row }) => row.original.especialidadeDesignacao || '—',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'statusConsulta',
    header: 'Estado',
    enableSorting: false,
    cell: ({ row }) => formatStatus(row.original),
    meta: { align: 'left' },
  },
]

export function getMarcacoesAdministrativoColumns(
  onOpenView: (row: MarcacaoAdministrativoTableDTO) => void,
  onOpenEdit?: (row: MarcacaoAdministrativoTableDTO) => void,
  onOpenDesmarcar?: (row: MarcacaoAdministrativoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (row: MarcacaoAdministrativoTableDTO) => ReactNode
) {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef({
      onOpenView,
      onOpenEdit,
      onOpenDelete: onOpenDesmarcar,
      rowActionPermissions,
      deleteTitle: 'Desmarcar',
      renderExtraActions,
    }),
  ]
}
