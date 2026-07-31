import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { TratamentoMarcadosTableDTO } from '@/types/dtos/tratamentos/tratamento-marcados-administrativo.dtos'

function bitCell(v: number | undefined | null) {
  return v === 1 ? 'Sim' : 'Não'
}

function rowTone(row: TratamentoMarcadosTableDTO): string {
  if (row.provisorio === 1) return 'text-yellow-700'
  if (row.suspenso === 1) return 'text-red-700'
  if (row.terminado === 1) return 'text-blue-700'
  if (row.iniciado === 1) return 'text-green-700'
  return ''
}

const baseColumns: DataTableColumnDef<TratamentoMarcadosTableDTO>[] = [
  {
    accessorKey: "designacao",
    header: "Designação",
    cell: ({ row }) => (
      <span className={rowTone(row.original)}>
        {row.original.designacao ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "nomePatologia",
    header: "Patologia",
    cell: ({ row }) => row.original.nomePatologia ?? "-",
  },
  {
    accessorKey: "utenteNome",
    header: "Utente",
    cell: ({ row }) => {
      const num = row.original.numeroUtente 
      const nome = row.original.utenteNome
      if (!num && !nome) return "-"
      return [num, nome].filter(Boolean).join(" - ")
    },
  },
  {
    accessorKey: "organismoNome",
    header: "Organismo",
    cell: ({ row }) => row.original.organismoNome ?? "-",
  },
  {
    accessorKey: "lotes",
    header: "Lotes",
    cell: ({ row }) => bitCell(row.original.lotes),
  },
  {
    accessorKey: "dataFim",
    header: "Data fim",
    cell: ({ row }) => 
        row.original.dataFim
        ? new Date(row.original.dataFim).toLocaleDateString("pt-PT")
        : "-",
  },
  {
    accessorKey: "iniciado",
    header: "Iniciado",
    cell: ({ row }) => bitCell(row.original.iniciado),
  },
  {
    accessorKey: "suspenso",
    header: "Suspenso",
    cell: ({ row }) => bitCell(row.original.suspenso),
  },
  {
    accessorKey: "terminado",
    header: "Terminado",
    cell: ({ row }) => bitCell(row.original.terminado),
  },
  {
    accessorKey: "debito",
    header: "Débito",
    cell: ({ row }) => row.original.debito != null
      ? row.original.debito.toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "-",
  },
]

export function buildTratamentosMarcadosColumns(
  onOpenView: (row: TratamentoMarcadosTableDTO) => void,
  onOpenDelete?: (row: TratamentoMarcadosTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<TratamentoMarcadosTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<TratamentoMarcadosTableDTO>({
      onOpenView,
      onOpenDelete,
      rowActionPermissions,
      omitDelete: !onOpenDelete,
    }),
  ]
}