import type { ReactNode } from 'react'
import { MessageSquare } from 'lucide-react'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { OrdemEntradaTableDTO } from '@/types/dtos/consultas/ordem-entrada.dtos'
import { Button } from '@/components/ui/button'

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
  onOpenView: (row: OrdemEntradaTableDTO) => void
  onOpenEdit?: (row: OrdemEntradaTableDTO) => void
  onOpenDelete?: (row: OrdemEntradaTableDTO) => void
  onOpenObservacoes: (row: OrdemEntradaTableDTO) => void
  canView: boolean
  canChange: boolean
  canDelete: boolean
  consultasDesmarcadas: boolean
}): DataTableColumnDef<OrdemEntradaTableDTO>[] {
  const {
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
      header: 'Cód. Utente',
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
      accessorKey: 'tipoConsultaDesignacao',
      header: 'Consulta',
      enableSorting: false,
      cell: ({ row }) => row.original.tipoConsultaDesignacao || '—',
    },
    {
      accessorKey: 'createdByNome',
      header: 'Utilizador',
      enableSorting: false,
      cell: ({ row }) => row.original.createdByNome || '—',
    },
    {
      accessorKey: 'dataHoraMarcacao',
      header: 'Registo (Histórico)',
      enableSorting: false,
      cell: ({ row }) => formatDateTime(row.original.dataHoraMarcacao),
    },
  ]

  const actionsColumn: DataTableColumnDef<OrdemEntradaTableDTO> = consultasDesmarcadas
    ? {
        id: 'actions',
        header: () => <div className='w-full pr-5 text-right'>Opções</div>,
        cell: ({ row }) => (
          <div className='flex w-full items-center justify-end gap-1'>
            {renderObs(row.original)}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { align: 'right' as const },
      }
    : createAreaComumListActionsColumnDef<OrdemEntradaTableDTO>({
        onOpenView,
        onOpenEdit,
        onOpenDelete,
        rowActionPermissions: { canView, canChange, canDelete },
        deleteTitle: 'Desmarcar',
        renderExtraActions: renderObs,
      })

  return [...legacyColumns, actionsColumn]
}
