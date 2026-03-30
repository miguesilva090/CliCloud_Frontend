import { RuaTableDTO } from '@/types/dtos/base/ruas.dtos'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { LazyFlag } from '@/components/shared/lazy-flag'
import { CellAction } from './ruas-cell-actions'

export const columns: DataTableColumnDef<RuaTableDTO>[] = [
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
    accessorKey: 'freguesia.nome',
    id: 'freguesia.nome',
    header: 'Freguesia',
    sortKey: 'freguesia.nome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => {
      const freguesia = row.original.freguesia
      return (
        <div className='flex items-center gap-2'>
          <span>{freguesia?.nome || '-'}</span>
        </div>
      )
    },
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'codigoPostal.codigo',
    id: 'codigoPostal.codigo',
    header: 'Código Postal',
    sortKey: 'codigoPostal.codigo',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => {
      const codigoPostal = row.original.codigoPostal
      return (
        <div className='flex items-center gap-2'>
          <span>{codigoPostal?.codigo || '-'}</span>
        </div>
      )
    },
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'freguesia.concelho.distrito.pais.nome',
    id: 'freguesia.concelho.distrito.pais.nome',
    header: 'País',
    sortKey: 'freguesia.concelho.distrito.pais.nome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => {
      const pais = row.original.freguesia?.concelho?.distrito?.pais
      return (
        <div className='flex items-center gap-2'>
          {pais?.codigo && (
            <LazyFlag
              code={pais.codigo}
              height={20}
              width={28}
              fallback={<span>🏳️</span>}
            />
          )}
          <span>{pais?.nome || '-'}</span>
        </div>
      )
    },
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
