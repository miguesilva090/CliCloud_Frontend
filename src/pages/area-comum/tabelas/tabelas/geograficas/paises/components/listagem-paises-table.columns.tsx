import { CellAction } from './listagem-paises-cell-actions'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { PaisTableDTO } from '@/types/dtos/base/paises.dtos'

export const columns: DataTableColumnDef<PaisTableDTO>[] = [
    {
        accessorKey: 'codigo',
        header: 'Sigla',
        sortKey: 'codigo',
        enableSorting: true,
        meta: { align: 'left'},
    },
    {
        accessorKey: 'nome',
        header: 'País',
        sortKey: 'nome',
        enableSorting: true,
        enableHiding: true,
        meta: { align: 'left'},
    },
    {
        accessorKey: 'prefixo',
        header: 'Prefixo',
        sortKey: 'prefixo',
        enableSorting: true,
        meta: { align: 'left'},
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
        meta: { align: 'right'},
    },
]

export function getColumnsWithViewCallback(
    onOpenView: (data: PaisTableDTO) => void,
    onOpenEdit?: (data: PaisTableDTO) => void,
    funcionalidadeId?: string
): DataTableColumnDef<PaisTableDTO>[] {
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