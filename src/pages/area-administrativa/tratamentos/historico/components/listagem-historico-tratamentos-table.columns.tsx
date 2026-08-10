import { format, parseISO, isValid } from 'date-fns'
import { MessageSquareText, RotateCcw } from 'lucide-react'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { Button } from '@/components/ui/button'
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

export type HistoricoTratamentosColumnHandlers = {
  onOpenView: (row: HistoricoTratamentoTableDTO) => void
  onOpenEdit?: (row: HistoricoTratamentoTableDTO) => void
  onOpenDelete?: (row: HistoricoTratamentoTableDTO) => void
  onReabrir?: (row: HistoricoTratamentoTableDTO) => void
  onObservacoes?: (row: HistoricoTratamentoTableDTO) => void
}

export function buildHistoricoTratamentosColumns(
  handlers: HistoricoTratamentosColumnHandlers,
  rowActionPermissions?: AreaComumListRowActionPermissions
): DataTableColumnDef<HistoricoTratamentoTableDTO>[] {
  const { onOpenView, onOpenEdit, onOpenDelete, onReabrir, onObservacoes } =
    handlers

  return [
    ...baseColumns,
    createAreaComumListActionsColumnDef<HistoricoTratamentoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      omitDelete: !onOpenDelete,
      rowActionPermissions,
      renderExtraActions: (row) => (
        <>
          {onObservacoes ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Observações'
              onClick={() => onObservacoes(row)}
            >
              <MessageSquareText className='h-4 w-4' />
            </Button>
          ) : null}
          {onReabrir ? (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Reabrir'
              onClick={() => onReabrir(row)}
            >
              <RotateCcw className='h-4 w-4' />
            </Button>
          ) : null}
        </>
      ),
    }),
  ]
}
