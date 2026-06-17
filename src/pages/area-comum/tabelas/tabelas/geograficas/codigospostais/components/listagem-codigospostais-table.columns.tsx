import { CellAction } from './listagem-codigospostais-cell-actions'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { CodigoPostalTableDTO } from '@/types/dtos/base/codigospostais.dtos'

export const columns: DataTableColumnDef<CodigoPostalTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'localidade',
    header: 'Localidade',
    sortKey: 'localidade',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => <span>{row.original.localidade || '-'}</span>,
    meta: { align: 'left' as const },
  },
  {
    id: 'codigoFim',
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
  onOpenView: (data: CodigoPostalTableDTO) => void,
  onOpenEdit?: (data: CodigoPostalTableDTO) => void,
  funcionalidadeId?: string
): DataTableColumnDef<CodigoPostalTableDTO>[] {
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
