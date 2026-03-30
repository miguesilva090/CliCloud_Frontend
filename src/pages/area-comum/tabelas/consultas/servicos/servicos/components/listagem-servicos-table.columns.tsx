import type { ServicoTableDTO } from '@/types/dtos/servicos/servico.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

export const servicoColumns: DataTableColumnDef<ServicoTableDTO>[] = [
  {
    accessorKey: 'designacao',
    header: 'Designação',
    sortKey: 'designacao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoServicoDescricao',
    header: 'Tipo Serviço',
    sortKey: 'tipoServicoDescricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'preco',
    header: 'Valor (EUR)',
    sortKey: 'preco',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => {
      const value = row.original.preco ?? 0
      return <span className='tabular-nums'>{value.toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'tratDentario',
    header: 'Serviço Dentário',
    sortKey: 'tratDentario',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'center' as const },
    cell: ({ row }) => (row.original.tratDentario ? 'Sim' : 'Não'),
  },
  {
    accessorKey: 'inativo',
    header: 'Estado',
    sortKey: 'inativo',
    enableSorting: true,
    meta: { align: 'center' as const },
    cell: ({ row }) => (row.original.inativo ? 'Inativo' : 'Ativo'),
  },
  {
    id: 'actions',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
    cell: () => (
      <div className='flex items-center justify-end gap-1'>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Ver'>
          <Eye className='h-4 w-4' />
        </Button>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Editar'>
          <Pencil className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive'
          title='Apagar'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' as const },
  },
]

export function getServicoColumnsWithViewCallback(
  onOpenView: (data: ServicoTableDTO) => void,
  onOpenEdit?: (data: ServicoTableDTO) => void,
  onOpenDelete?: (data: ServicoTableDTO) => void
): DataTableColumnDef<ServicoTableDTO>[] {
  return [
    ...servicoColumns.filter((c) => c.id !== 'actions'),
    {
      id: 'actions',
      header: () => <div className='text-right w-full pr-5'>Opções</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => onOpenView(row.original)}
            title='Ver'
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => onOpenEdit?.(row.original)}
            title='Editar'
          >
            <Pencil className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-destructive hover:text-destructive'
            onClick={() => onOpenDelete?.(row.original)}
            title='Apagar'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
  ]
}


