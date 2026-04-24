import type { CentroSaudeTableDTO } from '@/types/dtos/saude/centro-saude.dtos'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import {
  mergeRowActionPermissions,
  type AreaComumListRowActionPermissions,
} from '@/hooks/use-area-comum-entity-list-permissions'

function getRuaDisplay(row: CentroSaudeTableDTO): string {
  const rua = row.rua?.nome ?? (row.rua as { nome?: string })?.nome
  if (rua) return rua
  return '—'
}

export const columns: DataTableColumnDef<CentroSaudeTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'rua',
    header: 'Rua',
    cell: ({ row }) => getRuaDisplay(row.original),
    enableSorting: false,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'codigoLocalCS',
    header: 'Código Local',
    sortKey: 'codigoLocalCS',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
    cell: ({ row }) => row.original.codigoLocalCS ?? '—',
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
  onOpenView: (data: CentroSaudeTableDTO) => void,
  onOpenEdit?: (data: CentroSaudeTableDTO) => void,
  onOpenDelete?: (data: CentroSaudeTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<CentroSaudeTableDTO>[] {
  const { canView, canChange, canDelete } =
    mergeRowActionPermissions(rowActionPermissions)

  return [
    ...columns.filter((c) => c.id !== 'actions'),
    {
      id: 'actions',
      header: () => <div className='text-right w-full pr-5'>Opções</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-end gap-1'>
          {canView ? (
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
          ) : null}
          {canChange ? (
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
          ) : null}
          {canDelete ? (
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
          ) : null}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
  ]
}
