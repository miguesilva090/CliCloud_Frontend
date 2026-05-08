import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { SinistradoTableDTO } from '@/types/dtos/sinistrados/sinistrado.dtos'
import type { ReactNode } from 'react'

const baseColumns: DataTableColumnDef<SinistradoTableDTO>[] = [
  {
    accessorKey: 'codigoSinistro',
    header: 'Código',
    sortKey: 'codigoSinistro',
    enableSorting: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'utenteId',
    header: 'Cód. Utente',
    sortKey: 'utenteId',
    enableSorting: true,
    meta: { align: 'left' as const },
  },
  {
    id: 'tipoAcidente',
    header: 'Tipo de Acidente',
    enableSorting: false,
    cell: () => '-',
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'dataAcidente',
    header: 'Data Acidente',
    sortKey: 'dataAcidente',
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.original.dataAcidente
      if (!value) return '-'
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-PT')
    },
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'estadoSinistroDesignacao',
    header: 'Estado',
    sortKey: 'estadoSinistroDesignacao',
    enableSorting: false,
    cell: ({ row }) => row.original.estadoSinistroDesignacao || '-',
    meta: { align: 'left' as const },
  },
]

export function getSinistradosColumns(
  onOpenView: (data: SinistradoTableDTO) => void,
  onOpenEdit?: (data: SinistradoTableDTO) => void,
  onOpenDelete?: (data: SinistradoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
  renderExtraActions?: (data: SinistradoTableDTO) => ReactNode
): DataTableColumnDef<SinistradoTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<SinistradoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      renderExtraActions,
    }),
  ]
}
