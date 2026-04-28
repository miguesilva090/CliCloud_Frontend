import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { AtestadoTableDTO } from '@/types/dtos/saude/atestados.dtos'
import {
  createAreaComumListActionsColumnDef,
} from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT')
}

export const columns: Array<ColumnDef<AtestadoTableDTO> & DataTableColumnDef<AtestadoTableDTO>> = [
 
  {
    accessorKey: 'numeroSNS',
    header: 'Nº SNS',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      row.original.numeroSNS || '—',
    meta: { align: 'left' , width: 'w-[250px]'},
  },
  {
    accessorKey: 'dataAtestado',
    id: 'dataAtestado',
    header: 'Data',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      formatDate(row.original.dataAtestado),
    meta: { align: 'left' , width: 'w-[350px]'},
  },
  {
    accessorKey: 'nomeUtente',
    header: 'Utente',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      row.original.nomeUtente || row.original.utenteId || '—',
    meta: { align: 'left', width: 'w-[350px]' },
  },
  {
    accessorKey: 'nomeMedico',
    header: 'Médico',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      row.original.nomeMedico || row.original.medicoId || '—',
    meta: { align: 'left' , width: 'w-[350px]'},
  },
  {
    accessorKey: 'estadoEnvio',
    header: 'Estado Envio',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) => {
      const v = row.original.estadoEnvio
      if (v === 1 || v === 2) return 'Sim'
      return v === 0 ? 'Não' : '—'
    },
    meta: { align: 'left', width: 'w-[250px]' },
  },
  {
    id: 'actions',
    header: () => <div className='w-full text-center'>Opções</div>,
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: AtestadoTableDTO) => void,
  onOpenEdit?: (data: AtestadoTableDTO) => void,
  onOpenDelete?: (data: AtestadoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): Array<ColumnDef<AtestadoTableDTO> & DataTableColumnDef<AtestadoTableDTO>> {
  const baseColumns = columns.filter((c) => (c as { id?: string }).id !== 'actions')
  return [
    ...baseColumns,
    {
      ...createAreaComumListActionsColumnDef<AtestadoTableDTO>({
        onOpenView,
        onOpenEdit,
        onOpenDelete,
        rowActionPermissions,
      }),
      meta: { align: 'right', width: 'w-[350px]' },
    },
    // Colunas só para filtros (ocultas – não mostram na tabela nem no seletor de colunas)
    {
      id: 'data',
      accessorKey: 'dataAtestado',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'idUtente',
      accessorKey: 'utenteId',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'idMedico',
      accessorKey: 'medicoId',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'intervalo',
      accessorFn: () => '',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'dataFim',
      accessorFn: () => '',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'idUtenteFim',
      accessorFn: () => '',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'idMedicoFim',
      accessorFn: () => '',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
  ]
}
