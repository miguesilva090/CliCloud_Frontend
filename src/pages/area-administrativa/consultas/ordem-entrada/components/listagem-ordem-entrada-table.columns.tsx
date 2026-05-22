import type { ReactNode } from 'react'
import { MessageSquare } from 'lucide-react'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { OrdemEntradaTableDTO } from '@/types/dtos/consultas/ordem-entrada.dtos'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-PT')
}

function formatTime(value?: string | null) {
  if (!value) return '—'
  const parts = value.split(':')
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`
  return value
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-PT')
}

function obsActionButton(onOpenObservacoes: (row: OrdemEntradaTableDTO) => void) {
  return function renderObs(row: OrdemEntradaTableDTO): ReactNode {
    return (
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        title='Observações'
        onClick={() => onOpenObservacoes(row)}
      >
        <MessageSquare className='h-4 w-4' />
      </Button>
    )
  }
}

export function getOrdemEntradaColumns(opts: {
  onDefinirOrdem: (row: OrdemEntradaTableDTO) => void
  onAnularOrdem: (row: OrdemEntradaTableDTO) => void
  onTogglePresente: (row: OrdemEntradaTableDTO, value: boolean) => void
  onOpenView: (row: OrdemEntradaTableDTO) => void
  onOpenEdit?: (row: OrdemEntradaTableDTO) => void
  onOpenDelete?: (row: OrdemEntradaTableDTO) => void
  onOpenObservacoes: (row: OrdemEntradaTableDTO) => void
  canView: boolean
  canChange: boolean
  canDelete: boolean
  /** Legado: em modo «Consultas desmarcadas» só observações na linha. */
  consultasDesmarcadas: boolean
}): DataTableColumnDef<OrdemEntradaTableDTO>[] {
  const {
    onDefinirOrdem,
    onAnularOrdem,
    onTogglePresente,
    onOpenView,
    onOpenEdit,
    onOpenDelete,
    onOpenObservacoes,
    canView,
    canChange,
    canDelete,
    consultasDesmarcadas,
  } = opts

  const renderObs = obsActionButton(onOpenObservacoes)

  const legacyColumns: DataTableColumnDef<OrdemEntradaTableDTO>[] = [
    {
      accessorKey: 'data',
      header: 'Data',
      enableSorting: true,
      sortKey: 'data',
      cell: ({ row }) => formatDate(row.original.data),
    },
    {
      accessorKey: 'horaInicio',
      header: 'Hora',
      enableSorting: true,
      sortKey: 'horaInicio',
      cell: ({ row }) => formatTime(row.original.horaInicio),
    },
    {
      accessorKey: 'utenteNumero',
      header: 'Cód. utente',
      enableSorting: false,
      cell: ({ row }) => row.original.utenteNumero || '—',
    },
    {
      accessorKey: 'utenteNome',
      header: 'Utente',
      enableSorting: false,
      cell: ({ row }) => row.original.utenteNome || '—',
    },
    {
      accessorKey: 'medicoNome',
      header: 'Médico',
      enableSorting: false,
      cell: ({ row }) => row.original.medicoNome || '—',
    },
    {
      accessorKey: 'createdByNome',
      header: 'Utilizador',
      enableSorting: false,
      cell: ({ row }) => row.original.createdByNome || '—',
    },
    {
      accessorKey: 'statusConsultaLabel',
      header: 'Consulta',
      enableSorting: false,
      cell: ({ row }) => row.original.statusConsultaLabel || '—',
    },
    {
      accessorKey: 'dataHoraMarcacao',
      header: 'Data/hora marcação',
      enableSorting: false,
      cell: ({ row }) => formatDateTime(row.original.dataHoraMarcacao),
    },
  ]

  const actionsColumn = createAreaComumListActionsColumnDef<OrdemEntradaTableDTO>({
    onOpenView,
    onOpenEdit,
    onOpenDelete,
    rowActionPermissions: { canView, canChange, canDelete },
    deleteTitle: 'Desmarcar',
    renderExtraActions: renderObs,
  })

  const queueColumns: DataTableColumnDef<OrdemEntradaTableDTO>[] = consultasDesmarcadas
    ? []
    : [
        {
          accessorKey: 'confirmado',
          header: 'Presente',
          enableSorting: false,
          meta: { align: 'center' as const },
          cell: ({ row }) => (
            <div className='flex justify-center'>
              <Checkbox
                checked={row.original.confirmado === true}
                disabled={!canChange}
                onCheckedChange={(v) => {
                  if (!canChange) return
                  onTogglePresente(row.original, v === true)
                }}
              />
            </div>
          ),
        },
        {
          accessorKey: 'ordem',
          header: 'Ordem',
          enableSorting: true,
          sortKey: 'ordem',
          cell: ({ row }) => row.original.ordem ?? '—',
        },
        {
          accessorKey: 'horaChegada',
          header: 'Chegada',
          enableSorting: false,
          cell: ({ row }) => formatTime(row.original.horaChegada),
        },
      ]

  const ordemShortcuts: DataTableColumnDef<OrdemEntradaTableDTO> | null =
    consultasDesmarcadas
      ? null
      : {
          id: 'ordemAtalhos',
          header: 'Fila',
          enableSorting: false,
          cell: ({ row }) =>
            canChange ? (
              <div className='flex items-center gap-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-7 px-2 text-xs'
                  onClick={() => onDefinirOrdem(row.original)}
                >
                  Ordem
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 text-xs text-destructive'
                  onClick={() => onAnularOrdem(row.original)}
                  disabled={!row.original.ordem}
                >
                  Anular
                </Button>
              </div>
            ) : (
              '—'
            ),
        }

  return [
    ...queueColumns,
    ...legacyColumns,
    ...(ordemShortcuts ? [ordemShortcuts] : []),
    actionsColumn,
  ]
}
