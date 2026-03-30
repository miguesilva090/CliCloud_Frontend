import type { TecnicoTableDTO } from '@/types/dtos/saude/tecnicos.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

export const columns: DataTableColumnDef<TecnicoTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'telefone',
    header: 'Telefone / Telemóvel',
    cell: ({ row }) => row.original.contacto ?? '—',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const status = row.original.status
      if (status == null) return '—'
      return status === 1 ? 'Ativo' : 'Inativo'
    },
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const, width: '90px' },
  },
  {
    accessorKey: 'numeroContribuinte',
    header: 'Nº Contribuinte',
    sortKey: 'numeroContribuinte',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.numeroContribuinte ?? '—',
  },
  {
    id: 'especialidade',
    header: 'Especialidade',
    cell: ({ row }) => row.original.especialidadeNome ?? '—',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'margem',
    header: 'Margem (€)',
    cell: ({ row }) =>
      row.original.margem != null ? String(row.original.margem) : '—',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
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

export function getColumnsWithViewCallback(
  onOpenView: (data: TecnicoTableDTO) => void,
  onOpenEdit?: (data: TecnicoTableDTO) => void,
  onOpenDelete?: (data: TecnicoTableDTO) => void
): DataTableColumnDef<TecnicoTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
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

