import type { NaturezaDocumentoTableDTO } from '@/types/dtos/faturacao/natureza-documento.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<NaturezaDocumentoTableDTO>[] = [
  {
    accessorKey: 'sigla',
    header: 'Sigla',
    sortKey: 'sigla',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    sortKey: 'descricao',
    enableSorting: true,
    enableHiding: true,
    meta: { align: 'left' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: NaturezaDocumentoTableDTO) => void,
  onOpenEdit?: (data: NaturezaDocumentoTableDTO) => void,
  onOpenDelete?: (data: NaturezaDocumentoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<NaturezaDocumentoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<NaturezaDocumentoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
