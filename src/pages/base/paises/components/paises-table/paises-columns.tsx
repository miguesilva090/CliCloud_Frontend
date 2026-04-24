import { CellAction } from '@/pages/base/paises/components/paises-table/paises-cell-actions'
import { PaisTableDTO } from '@/types/dtos/base/paises.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'

export const columns: DataTableColumnDef<PaisTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Sigla',
    sortKey: 'codigo',
    enableSorting: true,
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'nome',
    header: 'País',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'prefixo',
    header: 'Prefixo',
    sortKey: 'prefixo',
    enableSorting: true,
    meta: {
      align: 'left',
    },
  },
  /* Coluna oculta só para filtro Nome "Até" (intervalo) */
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
    meta: {
      align: 'right',
    },
  },
]

/** Colunas com callbacks "Ver" e "Editar" para abrir modal na página (ex.: listagem área-comum) */
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
