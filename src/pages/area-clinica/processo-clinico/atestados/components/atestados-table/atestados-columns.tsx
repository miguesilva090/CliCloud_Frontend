import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { AtestadoTableDTO } from '@/types/dtos/saude/atestados.dtos'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('pt-PT')
}

export const columns: Array<ColumnDef<AtestadoTableDTO> & DataTableColumnDef<AtestadoTableDTO>> = [
  {
    accessorKey: 'id',
    header: 'Id',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      row.original.id || '—',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'numeroSNS',
    header: 'Nº SNS',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      row.original.numeroSNS || '—',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'dataAtestado',
    id: 'dataAtestado',
    header: 'Data',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      formatDate(row.original.dataAtestado),
    meta: { align: 'left' },
  },
  {
    accessorKey: 'nomeUtente',
    header: 'Utente',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      row.original.nomeUtente || row.original.utenteId || '—',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'nomeMedico',
    header: 'Médico',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) =>
      row.original.nomeMedico || row.original.medicoId || '—',
    meta: { align: 'left' },
  },
  {
    accessorKey: 'estadoEnvio',
    header: 'Estado Envio',
    cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) => {
      const v = row.original.estadoEnvio
      if (v === 1 || v === 2) return 'Sim'
      return v === 0 ? 'Não' : '—'
    },
    meta: { align: 'left' },
  },
  {
    id: 'actions',
    header: () => <div className='text-right w-full pr-5'>Opções</div>,
    cell: () => (
      <div className='flex items-center justify-end gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          title='Ver'
        >
          <Eye className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          title='Editar'
        >
          <Pencil className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive'
          title='Apagar'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'right' as const },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: AtestadoTableDTO) => void,
  onOpenEdit?: (data: AtestadoTableDTO) => void,
  onOpenDelete?: (data: AtestadoTableDTO) => void
): Array<ColumnDef<AtestadoTableDTO> & DataTableColumnDef<AtestadoTableDTO>> {
  const baseColumns = columns.filter((c) => (c as { id?: string }).id !== 'actions')
  return [
    ...baseColumns,
    {
      id: 'actions',
      header: () => <div className='text-right w-full pr-5'>Opções</div>,
      cell: ({ row }: CellContext<AtestadoTableDTO, unknown>) => (
        <div className='flex items-center justify-end gap-1'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => onOpenView(row.original)}
            title='Ver'
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => onOpenEdit?.(row.original)}
            title='Editar'
          >
            <Pencil className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-destructive hover:text-destructive'
            onClick={() => onOpenDelete?.(row.original)}
            title='Apagar'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      meta: { align: 'right' as const },
    },
    // Colunas só para filtros (ocultas – não mostram na tabela nem no seletor de colunas)
    {
      id: 'data',
      accessorKey: 'dataAtestado',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'idUtente',
      accessorKey: 'utenteId',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'idMedico',
      accessorKey: 'medicoId',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'intervalo',
      accessorFn: () => '',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'dataFim',
      accessorFn: () => '',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'idUtenteFim',
      accessorFn: () => '',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
    {
      id: 'idMedicoFim',
      accessorFn: () => '',
      header: '',
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
      meta: { hidden: true },
    },
  ]
}
