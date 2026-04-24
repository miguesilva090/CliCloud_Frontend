import type { NotificacaoTableDTO } from '@/types/dtos/notificacoes/notificacao.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { mergeRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Trash2, CheckCircle2 } from 'lucide-react'

const baseColumns: DataTableColumnDef<NotificacaoTableDTO>[] = [
  {
    accessorKey: 'titulo',
    header: 'Título',
    sortKey: 'titulo',
    enableSorting: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoDesignacao',
    header: 'Tipo',
    sortKey: 'tipoDesignacao',
    enableSorting: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    enableSorting: true,
    cell: ({ row }) => String(row.original.estado ?? ''),
    meta: { align: 'center' as const },
  },
  {
    accessorKey: 'lida',
    header: 'Lida',
    enableSorting: true,
    cell: ({ row }) => (row.original.lida ? 'Sim' : 'Não'),
    meta: { align: 'center' as const },
  },
  {
    accessorKey: 'createdOn',
    header: 'Criada em',
    sortKey: 'createdOn',
    enableSorting: true,
    meta: { align: 'left' as const },
  },
]

export function getNotificacoesTableColumns(
  listMode: number,
  opts: {
    onOpenView: (data: NotificacaoTableDTO) => void
    onOpenDelete?: (data: NotificacaoTableDTO) => void
    onMarcarLida?: (data: NotificacaoTableDTO) => void
    rowActionPermissions?: AreaComumListRowActionPermissions
  },
): DataTableColumnDef<NotificacaoTableDTO>[] {
  const { canView, canDelete } = mergeRowActionPermissions(opts.rowActionPermissions)
  const showMarcarLida =
    listMode === 0 && typeof opts.onMarcarLida === 'function'
  const showDelete = canDelete && typeof opts.onOpenDelete === 'function'

  const actionsCol: DataTableColumnDef<NotificacaoTableDTO> = {
    id: 'actions',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
    cell: ({ row }) => {
      const data = row.original
      const podeMarcar = showMarcarLida && !data.lida
      return (
        <div className='flex items-center justify-end gap-1'>
          {canView ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => opts.onOpenView(data)}
              title='Ver'
            >
              <Eye className='h-4 w-4' />
            </Button>
          ) : null}
          {podeMarcar ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => opts.onMarcarLida?.(data)}
              title='Marcar como lida'
            >
              <CheckCircle2 className='h-4 w-4 text-emerald-600' />
            </Button>
          ) : null}
          {showDelete ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive'
              onClick={() => opts.onOpenDelete?.(data)}
              title='Eliminar'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          ) : null}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' as const },
  }

  return [...baseColumns, actionsCol]
}
