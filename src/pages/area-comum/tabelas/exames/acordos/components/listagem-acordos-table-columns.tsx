import type { AcordosTableDTO } from '@/types/dtos/exames/acordos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

const formatDecimal = (value: number | null | undefined) =>
  value == null || Number.isNaN(Number(value))
    ? '—'
    : Number(value).toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

export const columns: DataTableColumnDef<AcordosTableDTO>[] = [
  {
    accessorKey: 'codigoSubsistema',
    header: 'Cód. Subsistema',
    sortKey: 'codigoSubsistema',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => row.original.codigoSubsistema?.trim() ?? '—',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoExameDesignacao',
    header: 'Tipo Exame',
    sortKey: 'tipoExameDesignacao',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => row.original.tipoExameDesignacao ?? '—',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    sortKey: 'organismoNome',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => row.original.organismoNome ?? '—',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'valTipoExame',
    header: 'Val. Tipo Exame (€)',
    sortKey: 'valTipoExame',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => formatDecimal(row.original.valTipoExame),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'valorOrganismo',
    header: 'Valor Org. (€)',
    sortKey: 'valorOrganismo',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => formatDecimal(row.original.valorOrganismo),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'margemOrganismo',
    header: 'Margem Org. (%)',
    sortKey: 'margemOrganismo',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => formatDecimal(row.original.margemOrganismo),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'valorUtente',
    header: 'Val. Utente (€)',
    sortKey: 'valorUtente',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => formatDecimal(row.original.valorUtente),
    meta: { align: 'right' as const },
  },
  {
    accessorKey: 'inactivo',
    header: 'Inactivo',
    sortKey: 'inactivo',
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (row.original.inactivo ? 'Inactivo' : 'Ativo'),
    meta: { align: 'center' as const },
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
  onOpenView: (data: AcordosTableDTO) => void,
  onOpenEdit?: (data: AcordosTableDTO) => void,
  onOpenDelete?: (data: AcordosTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<AcordosTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    createAreaComumListActionsColumnDef<AcordosTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}

