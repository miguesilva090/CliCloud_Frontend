import type { TipoConsultaTableDTO } from '@/types/dtos/tipos-consulta/tipo-consulta.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil } from 'lucide-react'

export const columns: DataTableColumnDef<TipoConsultaTableDTO>[] = [
  {
    accessorKey: 'designacao',
    header: 'Designação',
    sortKey: 'designacao',
    enableSorting: true,
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
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: TipoConsultaTableDTO) => void,
  onOpenEdit?: (data: TipoConsultaTableDTO) => void,
  onOpenDelete?: (data: TipoConsultaTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<TipoConsultaTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<TipoConsultaTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      omitDelete: true,
    }),
  ]
}

