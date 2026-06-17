import { CellAction } from './listagem-distritos-cell-actions'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { DistritoTableDTO } from '@/types/dtos/base/distritos.dtos'

export const columns: DataTableColumnDef<DistritoTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' },
  },
  {
    accessorKey: 'paisId',
    header: 'País',
    sortKey: 'pais.nome',
    enableSorting: true,
    cell: ({ row }) => <span>{row.original.pais?.nome || '-'}</span>,
    meta: { align: 'left' },
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
    meta: { align: 'right' },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: DistritoTableDTO) => void,
  onOpenEdit?: (data: DistritoTableDTO) => void,
  funcionalidadeId?: string
): DataTableColumnDef<DistritoTableDTO>[] {
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
