import { CellAction } from './listagem-ruas-cell-actions'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { RuaTableDTO } from '@/types/dtos/base/ruas.dtos'

export const columns: DataTableColumnDef<RuaTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'freguesiaId',
    header: 'Freguesia',
    sortKey: 'freguesia.nome',
    enableSorting: true,
    cell: ({ row }) => <span>{row.original.freguesia?.nome || '-'}</span>,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'codigoPostalId',
    header: 'Código Postal',
    sortKey: 'codigoPostal.codigo',
    enableSorting: true,
    cell: ({ row }) => <span>{row.original.codigoPostal?.codigo || '-'}</span>,
    meta: { align: 'left' as const },
  },
  {
    id: 'nomeFim',
    accessorFn: () => '',
    header: '',
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
    meta: { hidden: true },
  },
  {
    id: 'actions',
    header: () => <div className='w-full pr-5 text-right'>Ações</div>,
    cell: ({ row }) => (
      <div className='flex items-center justify-end'>
        <CellAction data={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: RuaTableDTO) => void,
  onOpenEdit?: (data: RuaTableDTO) => void,
  funcionalidadeId?: string
): DataTableColumnDef<RuaTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    {
      id: 'actions',
      header: () => <div className='w-full pr-5 text-right'>Ações</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-end'>
          <CellAction
            data={row.original}
            onOpenView={onOpenView}
            onOpenEdit={onOpenEdit}
            funcionalidadeId={funcionalidadeId}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
  ]
}
