import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { mergeRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export type AreaComumListActionsColumnOptions<T> = {
  onOpenView: (data: T) => void
  onOpenEdit?: (data: T) => void
  onOpenDelete?: (data: T) => void
  rowActionPermissions?: AreaComumListRowActionPermissions
  /** Listagens só com ver/editar (sem coluna de eliminar). */
  omitDelete?: boolean
  /** Ex.: registo reservado ao sistema — não mostrar editar nem apagar. */
  isRowActionsLocked?: (data: T) => boolean
}

/** Coluna «Opções»: AuthVer, AuthChg, AuthDel (se existir handler e não omitDelete). */
export function createAreaComumListActionsColumnDef<T>(
  opts: AreaComumListActionsColumnOptions<T>
): DataTableColumnDef<T> {
  const {
    onOpenView,
    onOpenEdit,
    onOpenDelete,
    rowActionPermissions,
    omitDelete,
    isRowActionsLocked,
  } = opts
  const { canView, canChange, canDelete } =
    mergeRowActionPermissions(rowActionPermissions)

  /** AuthDel → `canDelete` em `rowActionPermissions` (ex.: hook `useAreaComumEntityListPermissions`). */
  const showDelete =
    !omitDelete && canDelete && typeof onOpenDelete === 'function'

  return {
    id: 'actions',
    header: () => (
      <div className='w-full pr-5 text-right'>Opções</div>
    ),
    cell: ({ row }) => {
      const data = row.original
      const locked = isRowActionsLocked?.(data) ?? false
      return (
        <div className='flex w-full items-center justify-end gap-1'>
          {canView ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onOpenView(data)}
              title='Ver'
            >
              <Eye className='h-4 w-4' />
            </Button>
          ) : null}
          {canChange && !locked ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => onOpenEdit?.(data)}
              title='Editar'
            >
              <Pencil className='h-4 w-4' />
            </Button>
          ) : null}
          {showDelete && !locked ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive'
              onClick={() => onOpenDelete?.(data)}
              title='Apagar'
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
}
