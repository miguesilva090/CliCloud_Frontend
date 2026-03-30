import { CellAction } from '@/pages/base/codigospostais/components/codigospostais-table/codigospostais-cell-actions'
import { CodigoPostalTableDTO } from '@/types/dtos/base/codigospostais.dtos'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnDef } from '@/components/shared/data-table-types'

// Colunas principais da tabela de Códigos Postais (utilitários/base)
export const columns: DataTableColumnDef<CodigoPostalTableDTO>[] = [
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
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'left',
    },
  },
  {
    accessorKey: 'localidade',
    header: 'Localidade',
    sortKey: 'localidade',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span>{row.original.localidade}</span>
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

/**
 * Colunas para listagem área-comum:
 * - Código
 * - Localidade
 * - Campo oculto "codigoFim" para pesquisa De/Até
 * - Opções
 */
export const listagemColumns: DataTableColumnDef<CodigoPostalTableDTO>[] = [
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

/**
 * Colunas listagem com callbacks "Ver" e "Editar" para abrir modal na página
 * (ex.: área-comum/tabelas/tabelas/geograficas/listagem-codigospostais)
 */
export function getListagemColumnsWithViewCallback(
  onOpenView: (data: CodigoPostalTableDTO) => void,
  onOpenEdit?: (data: CodigoPostalTableDTO) => void
): DataTableColumnDef<CodigoPostalTableDTO>[] {
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
