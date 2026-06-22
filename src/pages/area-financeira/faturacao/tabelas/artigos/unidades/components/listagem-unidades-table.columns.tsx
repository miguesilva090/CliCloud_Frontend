import type { UnidadeMedidaTableDTO } from '@/types/dtos/stocks/unidade-medida.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<UnidadeMedidaTableDTO>[] = [
    {
        accessorKey: 'codigo',
        header: 'Código',
        sortKey: 'codigo',
        enableSorting: true,
        enableHiding: false,
        meta: {
            align: 'left' as const,
            width: 'w-[80px] min-w-[80px]',
        },
    },
    {
        accessorKey: 'descricao',
        header: 'Descrição',
        sortKey: 'descricao',
        enableSorting: true,
        enableHiding: true,
        meta: {
            align: 'left' as const,
        },
    },
]

export function getColumnsWithViewCallback(
    onOpenView: (data: UnidadeMedidaTableDTO) => void,
    onOpenEdit?: (data: UnidadeMedidaTableDTO) => void,
    onOpenDelete?: (data: UnidadeMedidaTableDTO) => void,
    rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<UnidadeMedidaTableDTO>[] {
    return [
        ...columns,
        createAreaComumListActionsColumnDef<UnidadeMedidaTableDTO>({
            onOpenView,
            onOpenEdit,
            onOpenDelete,
            rowActionPermissions,
        }),
    ]
}
