import type { MapaBodyChartTableDTO } from '@/types/dtos/processo-clinico/body-chart.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import {
  createAreaComumListActionsColumnDef,
} from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<MapaBodyChartTableDTO>[] = [
  {
    accessorKey: 'nome',
    header: 'Título',
    sortKey: 'nome',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'caminhoImagem',
    header: 'Imagem',
    sortKey: 'caminhoImagem',
    enableSorting: false,
    enableHiding: true,
    cell: ({ row }) => {
      const value = row.original.caminhoImagem ?? ''
      return <span className='truncate max-w-[260px]' title={value}>{value}</span>
    },
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
  onOpenView: (data: MapaBodyChartTableDTO) => void,
  onOpenEdit?: (data: MapaBodyChartTableDTO) => void,
  onOpenDelete?: (data: MapaBodyChartTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<MapaBodyChartTableDTO>[] {
  return [
    ...columns.filter((c) => c.id !== 'actions'),
    {
      ...createAreaComumListActionsColumnDef<MapaBodyChartTableDTO>({
        onOpenView,
        onOpenEdit,
        onOpenDelete,
        rowActionPermissions,
      }),
      meta: { align: 'right' as const },
    },
  ]
}

