import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { ReceitaMedicaTableDTO } from '@/types/dtos/prescricao/receita-medica.dtos'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT')
}

export const columns: Array<
  ColumnDef<ReceitaMedicaTableDTO> & DataTableColumnDef<ReceitaMedicaTableDTO>
> = [
  {
    accessorKey: 'numeroReceitaLocal',
    header: 'Nº Local',
    cell: ({ row }: CellContext<ReceitaMedicaTableDTO, unknown>) =>
      row.original.numeroReceitaLocal || row.original.numeroReceita || '—',
    meta: { align: 'left', width: 'w-[180px]' },
  },
  {
    accessorKey: 'dataPrescricao',
    header: 'Data',
    cell: ({ row }: CellContext<ReceitaMedicaTableDTO, unknown>) =>
      formatDate(row.original.dataPrescricao),
    meta: { align: 'left', width: 'w-[120px]' },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Utente',
    cell: ({ row }: CellContext<ReceitaMedicaTableDTO, unknown>) =>
      row.original.utenteNome || '—',
    meta: { align: 'left', width: 'w-[220px]' },
  },
  {
    accessorKey: 'medicoNome',
    header: 'Médico',
    cell: ({ row }: CellContext<ReceitaMedicaTableDTO, unknown>) =>
      row.original.medicoNome || '—',
    meta: { align: 'left', width: 'w-[220px]' },
  },
  {
    accessorKey: 'anulada',
    header: 'Estado',
    cell: ({ row }: CellContext<ReceitaMedicaTableDTO, unknown>) => {
      if (row.original.anulada === 1) return 'Anulada'
      if (row.original.enviada === 1) return 'Enviada'
      return 'Local'
    },
    meta: { align: 'left', width: 'w-[100px]' },
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

export function getReceitasColumns(
  onOpenView: (data: ReceitaMedicaTableDTO) => void,
  onOpenEdit?: (data: ReceitaMedicaTableDTO) => void,
  onOpenAnular?: (data: ReceitaMedicaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: ReceitaMedicaTableDTO) => ReactNode
): Array<
  ColumnDef<ReceitaMedicaTableDTO> & DataTableColumnDef<ReceitaMedicaTableDTO>
> {
  const baseColumns = columns.filter(
    (c) => (c as { id?: string }).id !== 'actions'
  )
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<ReceitaMedicaTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete: onOpenAnular,
      rowActionPermissions,
      renderExtraActions,
      deleteTitle: 'Anular',
      isRowActionsLocked: (row) => row.anulada === 1 || row.enviada === 1,
    }),
  ]
}
