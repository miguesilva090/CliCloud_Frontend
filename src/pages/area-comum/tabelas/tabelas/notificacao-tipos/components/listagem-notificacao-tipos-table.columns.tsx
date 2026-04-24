import type { NotificacaoTipoTableDTO } from '@/types/dtos/notificacoes/notificacao-tipo.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<NotificacaoTipoTableDTO>[] = [
  {
    accessorKey: 'designacaoTipo',
    header: 'Designação',
    sortKey: 'designacaoTipo',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'reservadoSistema',
    header: 'Reservado sistema',
    sortKey: 'reservadoSistema',
    enableSorting: true,
    cell: ({ row }) => (row.original.reservadoSistema ? 'Sim' : 'Não'),
    meta: { align: 'left' as const },
  },
  {
    id: 'actions',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: NotificacaoTipoTableDTO) => void,
  onOpenEdit?: (data: NotificacaoTipoTableDTO) => void,
  onOpenDelete?: (data: NotificacaoTipoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<NotificacaoTipoTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<NotificacaoTipoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      isRowActionsLocked: (row) => !!row.reservadoSistema,
    }),
  ]
}
