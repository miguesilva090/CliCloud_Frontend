import type { ClinicaTableDTO } from '@/types/dtos/core/clinica.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Pencil } from 'lucide-react'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT')
}

export const columns: DataTableColumnDef<ClinicaTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'nomeComercial',
    header: 'Nome Comercial',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.nomeComercial ?? '—',
  },
  {
    accessorKey: 'abreviatura',
    header: 'Abreviatura',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.abreviatura ?? '—',
  },
  {
    accessorKey: 'createdOn',
    header: 'Criado em',
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => formatDate(row.original.createdOn),
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: ClinicaTableDTO) => void,
  onOpenEdit?: (data: ClinicaTableDTO) => void,
  onSetDefault?: (id: string, porDefeito: boolean) => void
): DataTableColumnDef<ClinicaTableDTO>[] {
  return [
    ...columns,
    {
      accessorKey: 'porDefeito',
      header: 'Por Defeito',
      enableSorting: false,
      enableHiding: true,
      meta: { align: 'center' as const },
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Checkbox
            checked={!!row.original.porDefeito}
            disabled={!onSetDefault}
            onCheckedChange={(v) => {
              if (!onSetDefault) return
              onSetDefault(row.original.id, v === true)
            }}
          />
        </div>
      ),
    },
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
            title='Ver'
            onClick={() => onOpenView(row.original)}
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            title='Editar'
            onClick={() => onOpenEdit?.(row.original)}
          >
            <Pencil className='h-4 w-4' />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
  ]
}

