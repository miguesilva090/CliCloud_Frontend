import type { ArmazemTableDTO } from "@/types/dtos/stocks/armazem.dtos"
import { DataTableColumnDef } from "@/components/shared/data-table-types"
import { createAreaComumListActionsColumnDef } from "@/components/shared/area-comum-list-actions-column"
import type { AreaComumListRowActionPermissions } from "@/hooks/use-area-comum-entity-list-permissions"
import { Check } from 'lucide-react'

export const columns: DataTableColumnDef<ArmazemTableDTO>[] = [
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
        accessorKey: 'nome', 
        header: 'Nome',
        sortKey: 'nome',
        enableSorting: true,
        enableHiding: true,
        meta: {
            align: 'left' as const,
        },
    },
    {
        accessorKey: 'localidade',
        header: 'Localidade',
        sortKey: 'localidade',
        enableSorting: true,
        enableHiding: true,
        meta: {
            align: 'left' as const,
        },
    },
    {
        accessorKey: 'telefone',
        header: 'Telefone',
        sortKey: 'telefone',
        enableSorting: true,
        enableHiding: true, 
        meta : {
            align: 'left' as const,
            width: 'w-[120px] min-w-[120px]',
        },
    },
    {
        accessorKey: 'armazemGeral',
        header: 'Geral',
        sortKey: 'armazemGeral',
        enableSorting: true,
        enableHiding: true,
        meta: {
            align: 'center' as const,
            width: 'w-[80px] min-w-[80px]',
        },
        cell: ({ row }) => 
            row.original.armazemGeral ? (
                <Check className="mx-auto h-4 w-4 text-primary" />
            ): null,
    },
]

export function getColumnsWithViewCallback(
    onOpenView: (data: ArmazemTableDTO) => void,
    onOpenEdit?: (data: ArmazemTableDTO) => void,
    onOpenDelete?: (data: ArmazemTableDTO) => void,
    rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<ArmazemTableDTO>[]
{
    return [
        ...columns,
        createAreaComumListActionsColumnDef<ArmazemTableDTO>({
            onOpenView,
            onOpenEdit,
            onOpenDelete,
            rowActionPermissions,
        }),
    ]
}
