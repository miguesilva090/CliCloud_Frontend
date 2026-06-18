import type { FamiliaArtigoTableDTO } from '@/types/dtos/stocks/familia-artigo.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
import { FolderTree } from 'lucide-react'

const NIVEL_LABELS: Record<number, string> = {
  1: 'Família',
  2: 'Classe',
  3: 'Subclasse',
}

function getDrillDownLabel(nivel: number): string {
  if (nivel === 1) return 'Classes de Artigos'
  if (nivel === 2) return 'Sub-Classes de Artigos'
  return ''
}

export const columns: DataTableColumnDef<FamiliaArtigoTableDTO>[] = [
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
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'nivel',
    header: 'Nível',
    sortKey: 'nivel',
    enableSorting: true,
    enableHiding: true,
    meta: {
      align: 'center' as const,
      width: 'w-[100px] min-w-[100px]',
    },
    cell: ({ row }) => {
      const nivel = row.original.nivel
      const label = NIVEL_LABELS[nivel] ?? String(nivel)
      return `${nivel} — ${label}`
    },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: FamiliaArtigoTableDTO) => void,
  onOpenEdit?: (data: FamiliaArtigoTableDTO) => void,
  onOpenDelete?: (data: FamiliaArtigoTableDTO) => void,
  onOpenChildren?: (data: FamiliaArtigoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<FamiliaArtigoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<FamiliaArtigoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
      renderExtraActions: (row) => {
        if (!onOpenChildren || row.nivel >= 3) return null
        return (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            title={getDrillDownLabel(row.nivel)}
            onClick={() => onOpenChildren(row)}
          >
            <FolderTree className='h-4 w-4' />
          </Button>
        )
      },
    }),
  ]
}