import { Volume2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { AdmissaoTratamentoTableDTO } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

type ToggleFn = (
  row: AdmissaoTratamentoTableDTO,
  campo: 'confirmado' | 'efetuado' | 'faltou',
  valor: 0 | 1
) => void

export function buildAdmissoesTratamentoColumns(opts: {
  canChange: boolean
  showConfirmado: boolean
  showFaltou: boolean
  onToggle: ToggleFn
  onDesmarcar: (row: AdmissaoTratamentoTableDTO) => void
  onRemoverDesmarcacao: (row: AdmissaoTratamentoTableDTO) => void
  onChamar: (row: AdmissaoTratamentoTableDTO) => void
  onOpenView: (row: AdmissaoTratamentoTableDTO) => void
  onOpenEdit?: (row: AdmissaoTratamentoTableDTO) => void
  rowActionPermissions?: AreaComumListRowActionPermissions
}): ColumnDef<AdmissaoTratamentoTableDTO>[] {
  const cols: ColumnDef<AdmissaoTratamentoTableDTO>[] = [
    {
      accessorKey: 'data',
      header: 'Data',
      cell: ({ row }) =>
        row.original.data
          ? new Date(row.original.data).toLocaleDateString('pt-PT')
          : '—',
    },
    {
      id: 'hora',
      header: 'Hora',
      cell: ({ row }) =>
        row.original.horaFisio || row.original.horaInic || '—',
    },
    {
      accessorKey: 'utenteNome',
      header: 'Utente',
      cell: ({ row }) => {
        const num = row.original.numeroUtente
        const nome = row.original.utenteNome
        if (!num && !nome) return '—'
        return [num, nome].filter(Boolean).join(' — ')
      },
    },
    {
      accessorKey: 'fisioterapeutaNome',
      header: 'Fisioterapeuta',
      cell: ({ row }) => row.original.fisioterapeutaNome ?? '—',
    },
    {
      accessorKey: 'auxiliarNome',
      header: 'Auxiliar',
      cell: ({ row }) => row.original.auxiliarNome ?? '—',
    },
    {
      accessorKey: 'outroTecnicoNome',
      header: 'Terap. Ocup./Fala',
      cell: ({ row }) => row.original.outroTecnicoNome ?? '—',
    },
    {
      accessorKey: 'localTratamentoNome',
      header: 'Local',
      cell: ({ row }) => row.original.localTratamentoNome ?? '—',
    },
  ]

  if (opts.showConfirmado) {
    cols.push({
      id: 'confirmado',
      header: 'Confirmado',
      enableSorting: false,
      cell: ({ row }) => {
        const desmarcado = row.original.desmarcado === 1
        return (
          <Checkbox
            checked={row.original.confirmado === 1}
            disabled={!opts.canChange || desmarcado}
            onCheckedChange={(c) =>
              opts.onToggle(row.original, 'confirmado', c ? 1 : 0)
            }
          />
        )
      },
    })
  }

  cols.push({
    id: 'efetuado',
    header: 'Efectuado',
    enableSorting: false,
    cell: ({ row }) => {
      const desmarcado = row.original.desmarcado === 1
      return (
        <Checkbox
          checked={row.original.efetuado === 1}
          disabled={!opts.canChange || desmarcado}
          onCheckedChange={(c) =>
            opts.onToggle(row.original, 'efetuado', c ? 1 : 0)
          }
        />
      )
    },
  })

  if (opts.showFaltou) {
    cols.push({
      id: 'faltou',
      header: 'Faltou',
      enableSorting: false,
      cell: ({ row }) => {
        const desmarcado = row.original.desmarcado === 1
        return (
          <Checkbox
            checked={row.original.faltou === 1}
            disabled={!opts.canChange || desmarcado}
            onCheckedChange={(c) =>
              opts.onToggle(row.original, 'faltou', c ? 1 : 0)
            }
          />
        )
      },
    })
  }

  cols.push({
    id: 'desmarcado',
    header: 'Desmarcado',
    enableSorting: false,
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.desmarcado === 1}
        disabled={!opts.canChange}
        onCheckedChange={(c) => {
          if (c) opts.onDesmarcar(row.original)
          else if (row.original.desmarcado === 1) {
            opts.onRemoverDesmarcacao(row.original)
          }
        }}
      />
    ),
  })

  cols.push({
    id: 'chamar',
    header: '',
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        title='Chamar utente'
        disabled={!opts.canChange}
        onClick={() => opts.onChamar(row.original)}
      >
        <Volume2 className='h-4 w-4' />
      </Button>
    ),
  })

  cols.push({
    id: 'sessoes',
    header: 'Sessões',
    enableSorting: false,
    cell: ({ row }) => {
      const n = row.original.numSessao
      const total = row.original.numSessaoTratamento
      if (n == null && total == null) return '—'
      return `${n ?? '—'}/${total ?? '—'}`
    },
  })

  cols.push({
    id: 'nFalta',
    header: 'Faltas',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.nFalta != null ? String(row.original.nFalta) : '—',
  })

  cols.push(
    createAreaComumListActionsColumnDef<AdmissaoTratamentoTableDTO>({
      onOpenView: opts.onOpenView,
      onOpenEdit: opts.onOpenEdit,
      omitDelete: true,
      rowActionPermissions: opts.rowActionPermissions,
    })
  )

  return cols
}