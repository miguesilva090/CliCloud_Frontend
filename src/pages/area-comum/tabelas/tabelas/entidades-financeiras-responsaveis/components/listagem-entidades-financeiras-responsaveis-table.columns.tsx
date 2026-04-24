import type { EntidadeFinanceiraTableDTO } from '@/types/dtos/utility/entidade-financeira.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { CondicaoSns } from '@/types/enums/condicao-sns.enum'

export const columns: DataTableColumnDef<EntidadeFinanceiraTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Designação',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'abreviatura',
    header: 'Abreviatura',
    sortKey: 'abreviatura',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'paisPrefixo',
    header: 'País',
    sortKey: 'paisPrefixo',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoEntidadeFinanceiraDesignacao',
    header: 'Tipo Entidade',
    sortKey: 'tipoEntidadeFinanceiraDesignacao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'condicaoSns',
    header: 'Condição Sns',
    sortKey: 'condicaoSns',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => {
      const value = row.original.condicaoSns
      if (value === CondicaoSns.CondicaoSns) return 'Condição Sns'
      if (value === CondicaoSns.TerceiroPagador) return 'Condição Terceiro Pagador'
      if (value === CondicaoSns.NaoEspecificado || value === null)
        return 'Não especificado'
      return String(value ?? '')
    },
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
    cell: () => (
      <div className='flex items-center justify-end gap-1'>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8'>
          <Eye className='h-4 w-4' />
        </Button>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8'>
          <Pencil className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive'
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
  onOpenView: (data: EntidadeFinanceiraTableDTO) => void,
  onOpenEdit?: (data: EntidadeFinanceiraTableDTO) => void,
  onOpenDelete?: (data: EntidadeFinanceiraTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<EntidadeFinanceiraTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<EntidadeFinanceiraTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}

