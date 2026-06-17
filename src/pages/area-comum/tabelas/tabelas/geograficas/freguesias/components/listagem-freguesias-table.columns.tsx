import { CellAction } from './listagem-freguesias-cell-actions'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { FreguesiaTableDTO } from '@/types/dtos/base/freguesias.dtos'

export const columns: DataTableColumnDef<FreguesiaTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'concelhoId',
    header: 'Concelho',
    sortKey: 'concelho.nome',
    enableSorting: true,
    cell: ({ row }) => <span>{row.original.concelho?.nome || '-'}</span>,
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
  onOpenView: (data: FreguesiaTableDTO) => void,
  onOpenEdit?: (data: FreguesiaTableDTO) => void,
  funcionalidadeId?: string
): DataTableColumnDef<FreguesiaTableDTO>[] {
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
