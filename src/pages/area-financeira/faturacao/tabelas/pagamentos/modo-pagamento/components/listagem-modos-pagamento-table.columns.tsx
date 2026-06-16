import type { ModoPagamentoTableDTO } from '@/types/dtos/pagamentos/modo-pagamento.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Archive, ArchiveRestore } from 'lucide-react'

export const columns: DataTableColumnDef<ModoPagamentoTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    enableHiding: false,
    meta: {
      align: 'center' as const,
      width: 'w-[80px] min-w-[80px]',
    },
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    sortKey: 'descricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'abreviatura',
    header: 'Tipo (SAFT)',
    sortKey: 'abreviatura',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'center' as const,
      width: 'w-[100px] min-w-[100px]',
    },
  },
  {
    accessorKey: 'historico',
    header: 'Estado',
    sortKey: 'historico',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'center' as const,
      width: 'w-[100px] min-w-[100px]',
    },
    cell: ({ row }) => (row.original.historico ? 'Histórico' : 'Ativo'),
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: ModoPagamentoTableDTO) => void,
  onOpenEdit?: (data: ModoPagamentoTableDTO) => void,
  onOpenDelete?: (data: ModoPagamentoTableDTO) => void,
  onPassarHistorico?: (data: ModoPagamentoTableDTO) => void,
  onRetirarHistorico?: (data: ModoPagamentoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<ModoPagamentoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<ModoPagamentoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      isRowActionsLocked: (row) => row.historico,
      renderExtraActions: (row) => {
        if (!rowActionPermissions?.canChange) return null
        if (row.historico && onRetirarHistorico) {
          return (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Retirar do histórico'
              onClick={() => onRetirarHistorico(row)}
            >
              <ArchiveRestore className='h-4 w-4' />
            </Button>
          )
        }
        if (!row.historico && onPassarHistorico) {
          return (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Passar a histórico'
              onClick={() => onPassarHistorico(row)}
            >
              <Archive className='h-4 w-4' />
            </Button>
          )
        }
        return null
      },
    }),
  ]
}
