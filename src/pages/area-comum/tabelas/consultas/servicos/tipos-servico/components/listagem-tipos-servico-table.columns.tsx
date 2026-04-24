import type { TipoServicoTableDTO } from '@/types/dtos/servicos/tipo-servico.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

export const tiposServicoColumns: DataTableColumnDef<TipoServicoTableDTO>[] = [
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    sortKey: 'descricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'taxaModeradoraSns',
    header: 'Taxa Moderadora (S.N.S)',
    sortKey: 'taxaModeradoraSns',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'right' as const },
    cell: ({ row }) => {
      const value = row.original.taxaModeradoraSns ?? 0
      return <span className='tabular-nums'>{value.toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'partilhaSemRequisicao',
    header: 'Partilha Sem Requisição',
    sortKey: 'partilhaSemRequisicao',
    enableSorting: true,
    meta: { align: 'center' as const },
    cell: ({ row }) => (row.original.partilhaSemRequisicao ? 'Sim' : 'Não'),
  },
  {
    accessorKey: 'servicosCount',
    header: 'N.º Serviços',
    sortKey: 'servicosCount',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'right' as const },
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

export function getTiposServicoColumnsWithViewCallback(
  onOpenView: (data: TipoServicoTableDTO) => void,
  onOpenEdit?: (data: TipoServicoTableDTO) => void,
  onOpenDelete?: (data: TipoServicoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<TipoServicoTableDTO>[] {
  return [
    ...tiposServicoColumns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<TipoServicoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}


