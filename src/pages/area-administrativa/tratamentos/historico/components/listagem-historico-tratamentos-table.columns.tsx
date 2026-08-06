import { format, parseISO, isValid } from 'date-fns'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { HistoricoTratamentoTableDTO } from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'

function fmtDate(v?: string | null) {
  if (!v) return '—'
  const d = parseISO(v)
  return isValid(d) ? format(d, 'dd/MM/yyyy') : '—'
}

function isencaoLabel(v?: number | null) {
  switch (v) {
    case 1:
      return 'Isento'
    case 2:
      return 'N.Isento'
    case 3:
      return 'E11'
    case 4:
      return 'H'
    default:
      return '—'
  }
}

const baseColumns: DataTableColumnDef<HistoricoTratamentoTableDTO>[] = [
  {
    accessorKey: 'numeroUtente',
    header: 'Utente',
    cell: ({ row }) => {
      const n = row.original.numeroUtente
      const nome = row.original.utenteNome
      if (n && nome) return `${n} - ${nome}`
      return nome ?? n ?? '—'
    },
  },
  {
    accessorKey: 'dataInic',
    header: 'Início',
    cell: ({ getValue }) => fmtDate(getValue() as string),
  },
  {
    accessorKey: 'dataFim',
    header: 'Conclusão',
    cell: ({ getValue }) => fmtDate(getValue() as string),
  },
  {
    accessorKey: 'numSessao',
    header: 'Nº sessões',
    cell: ({ getValue }) => getValue() ?? '—',
  },
  {
    accessorKey: 'pago',
    header: 'Pago',
    cell: ({ getValue }) => ((getValue() as number) === 1 ? 'Sim' : 'Não'),
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    cell: ({ getValue }) => (getValue() as string) || '—',
  },
  {
    accessorKey: 'credencial',
    header: 'Credencial',
    cell: ({ getValue }) => (getValue() as string) || '—',
  },
  {
    accessorKey: 'confDfim',
    header: 'Alta',
    cell: ({ getValue }) => ((getValue() as number) === 1 ? 'Sim' : 'Não'),
  },
  {
    accessorKey: 'isencao',
    header: 'Isenção',
    cell: ({ getValue }) => isencaoLabel(getValue() as number),
  },
  {
    accessorKey: 'medicoNome',
    header: 'Médico',
    cell: ({ getValue }) => (getValue() as string) || '—',
  },
  {
    accessorKey: 'faturado',
    header: 'Faturado',
    cell: ({ getValue }) => ((getValue() as number) === 1 ? 'Sim' : 'Não'),
  },
]

export function buildHistoricoTratamentosColumns(
  onOpenView: (row: HistoricoTratamentoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<HistoricoTratamentoTableDTO>[] {
  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<HistoricoTratamentoTableDTO>({
      onOpenView,
      omitDelete: true,
      rowActionPermissions,
    }),
  ]
}
