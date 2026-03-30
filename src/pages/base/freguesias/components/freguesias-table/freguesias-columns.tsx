import { CellAction } from '@/pages/base/freguesias/components/freguesias-table/freguesias-cell-actions'
import { FreguesiaTableDTO } from '@/types/dtos/base/freguesias.dtos'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { LazyFlag } from '@/components/shared/lazy-flag'

export const columns: DataTableColumnDef<FreguesiaTableDTO>[] = [
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
    accessorKey: 'concelho.nome',
    id: 'concelho.nome',
    header: 'Concelho',
    sortKey: 'concelho.nome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span>{row.original.concelho?.nome || '-'}</span>
      </div>
    ),
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'concelho.distrito.nome',
    id: 'concelho.distrito.nome',
    header: 'Distrito',
    sortKey: 'concelho.distrito.nome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span>{row.original.concelho?.distrito?.nome || '-'}</span>
      </div>
    ),
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'concelho.distrito.pais.nome',
    id: 'concelho.distrito.pais.nome',
    header: 'País',
    sortKey: 'concelho.distrito.pais.nome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        {row.original.concelho?.distrito?.pais?.codigo && (
          <LazyFlag
            code={row.original.concelho.distrito.pais.codigo}
            height={20}
            width={28}
            fallback={<span>🏳️</span>}
          />
        )}
        <span>{row.original.concelho?.distrito?.pais?.nome || '-'}</span>
      </div>
    ),
    meta: {
      align: 'left',
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className='flex items-center justify-end'>
        <CellAction data={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]

/** Colunas para listagem área-comum: Nome, Concelho, Opções; sem checkboxes; filtro Nome De/Até. */
export const listagemColumns: DataTableColumnDef<FreguesiaTableDTO>[] = [
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
    cell: ({ row }) => (
      <span>{row.original.concelho?.nome || '-'}</span>
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
  onOpenView: (data: FreguesiaTableDTO) => void,
  onOpenEdit?: (data: FreguesiaTableDTO) => void
): DataTableColumnDef<FreguesiaTableDTO>[] {
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
