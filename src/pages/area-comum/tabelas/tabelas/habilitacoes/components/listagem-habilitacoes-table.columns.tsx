import type { HabilitacaoTableDTO } from '@/types/dtos/habilitacoes/habilitacao.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

export const columns: DataTableColumnDef<HabilitacaoTableDTO>[] = [
  {
    accessorKey: 'descricao',
    header: 'Designação',
    sortKey: 'descricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'actions',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
    cell: () => (
      <div className='flex items-center justify-end gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          title='Ver'
        >
          <Eye className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          title='Editar'
        >
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
  onOpenView: (data: HabilitacaoTableDTO) => void,
  onOpenEdit?: (data: HabilitacaoTableDTO) => void,
  onOpenDelete?: (data: HabilitacaoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<HabilitacaoTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<HabilitacaoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}

