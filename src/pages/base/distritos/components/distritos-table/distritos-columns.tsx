import { CellAction } from '@/pages/base/distritos/components/distritos-table/distritos-cell-actions'
import { DistritoTableDTO } from '@/types/dtos/base/distritos.dtos'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { LazyFlag } from '@/components/shared/lazy-flag'

export const columns: DataTableColumnDef<DistritoTableDTO>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Selecionar todos'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Selecionar linha'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      width: 'w-[4%]',
    },
  },
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'paisId',
    header: 'País',
    sortKey: 'pais.nome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        {row.original.pais?.codigo && (
          <LazyFlag
            code={row.original.pais.codigo}
            height={20}
            width={28}
            fallback={<span>🏳️</span>}
          />
        )}
        <span>{row.original.pais?.nome || '-'}</span>
      </div>
    ),
    meta: {
      align: 'left',
    },
  },
  {
    id: 'actions',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
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

/** Colunas listagem com callbacks "Ver" e "Editar" para abrir modal na página (ex.: área-comum) */
export function getListagemColumnsWithViewCallback(
  onOpenView: (data: DistritoTableDTO) => void,
  onOpenEdit?: (data: DistritoTableDTO) => void
): DataTableColumnDef<DistritoTableDTO>[] {
  return [
    ...listagemColumns.filter((c) => c.id !== 'actions'),
    {
      id: 'actions',
      header: () => <div className='text-right w-full pr-5'>Opções</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-end'>
          <CellAction
            data={row.original}
            onOpenView={onOpenView}
            onOpenEdit={onOpenEdit}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
  ]
}

/** Colunas para listagem área-comum: Nome, País sem bandeira, Opções; sem checkboxes; filtro Nome De/Até (sem Código). */
export const listagemColumns: DataTableColumnDef<DistritoTableDTO>[] = [
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
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
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
