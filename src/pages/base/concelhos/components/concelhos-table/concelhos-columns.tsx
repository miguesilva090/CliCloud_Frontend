import { CellAction } from '@/pages/base/concelhos/components/concelhos-table/concelhos-cell-actions'
import { ConcelhoTableDTO } from '@/types/dtos/base/concelhos.dtos'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { LazyFlag } from '@/components/shared/lazy-flag'

export const columns: DataTableColumnDef<ConcelhoTableDTO>[] = [
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
    accessorKey: 'distrito.nome',
    id: 'distrito.nome',
    header: 'Distrito',
    sortKey: 'distrito.nome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span>{row.original.distrito?.nome || '-'}</span>
      </div>
    ),
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'distrito.pais.nome',
    id: 'distrito.pais.nome',
    header: 'País',
    sortKey: 'distrito.pais.nome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        {row.original.distrito?.pais?.codigo && (
          <LazyFlag
            code={row.original.distrito.pais.codigo}
            height={20}
            width={28}
            fallback={<span>🏳️</span>}
          />
        )}
        <span>{row.original.distrito?.pais?.nome || '-'}</span>
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
    meta: { align: 'right' as const },
  },
]

/** Colunas para listagem área-comum: Nome, Distrito, Opções; sem checkboxes; filtro Nome De/Até. */
export const listagemColumns: DataTableColumnDef<ConcelhoTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'distritoId',
    header: 'Distrito',
    sortKey: 'distrito.nome',
    enableSorting: true,
    cell: ({ row }) => (
      <span>{row.original.distrito?.nome || '-'}</span>
    ),
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
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
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

/** Colunas listagem com callbacks "Ver" e "Editar" para abrir modal na página (ex.: área-comum) */
export function getListagemColumnsWithViewCallback(
  onOpenView: (data: ConcelhoTableDTO) => void,
  onOpenEdit?: (data: ConcelhoTableDTO) => void
): DataTableColumnDef<ConcelhoTableDTO>[] {
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
