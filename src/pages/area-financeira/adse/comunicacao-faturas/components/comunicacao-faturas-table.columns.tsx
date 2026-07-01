import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { ComunicacaoFaturasRowDTO } from '@/types/dtos/faturacao/comunicacao-faturas.dtos'
import { AlertCircle, FileText, FileBarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'

function formatCurrency(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '0,00'
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const baseColumns: Array<
  ColumnDef<ComunicacaoFaturasRowDTO> &
    DataTableColumnDef<ComunicacaoFaturasRowDTO>
> = [
  {
    id: 'select',
    header: ({ table }: { table: any }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
        aria-label='Selecionar todos'
      />
    ),
    cell: ({ row }: CellContext<ComunicacaoFaturasRowDTO, unknown>) => (
      <div className='flex justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label={`Selecionar ${row.original.numero ?? row.id}`}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { align: 'center', width: 'w-10 min-w-[2.5rem]' },
  },
  {
    accessorKey: 'tratamento',
    header: 'Trat.',
    cell: ({ row }) => (
      <span className='block truncate' title={row.original.tratamento ?? ''}>
        {row.original.tratamento || '-'}
      </span>
    ),
    meta: { align: 'center', width: 'w-[52px] min-w-[52px]' },
  },
  {
    accessorKey: 'dataInicio',
    header: 'Data Ini.',
    cell: ({ row }) => (
      <span className='block whitespace-nowrap'>
        {row.original.dataInicio || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[92px] min-w-[92px]' },
  },
  {
    accessorKey: 'dataFim',
    header: 'Data Fim',
    cell: ({ row }) => (
      <span className='block whitespace-nowrap'>
        {row.original.dataFim || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[92px] min-w-[92px]' },
  },
  {
    accessorKey: 'numero',
    header: 'Nº',
    cell: ({ row }) => (
      <span className='block truncate' title={row.original.numero ?? ''}>
        {row.original.numero || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[72px] min-w-[72px]' },
  },
  {
    accessorKey: 'utente',
    header: 'Utente',
    cell: ({ row }) => (
      <span className='block truncate' title={row.original.utente ?? ''}>
        {row.original.utente || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[160px] min-w-[160px]' },
  },
  {
    accessorKey: 'numeroFr',
    header: 'Nº FR',
    cell: ({ row }) => (
      <span className='block truncate' title={row.original.numeroFr ?? ''}>
        {row.original.numeroFr || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[80px] min-w-[80px]' },
  },
  {
    accessorKey: 'dataFr',
    header: 'Data FR',
    cell: ({ row }) => (
      <span className='block whitespace-nowrap'>
        {row.original.dataFr || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[92px] min-w-[92px]' },
  },
  {
    accessorKey: 'valorFr',
    header: 'Val. FR',
    cell: ({ row }) => (
      <span className='block text-right tabular-nums'>
        {formatCurrency(row.original.valorFr)}
      </span>
    ),
    meta: { align: 'right', width: 'w-[88px] min-w-[88px]' },
  },
  {
    accessorKey: 'valorAdse',
    header: 'Val.ADSE',
    cell: ({ row }) => (
      <span className='block text-right tabular-nums'>
        {formatCurrency(row.original.valorAdse)}
      </span>
    ),
    meta: { align: 'right', width: 'w-[88px] min-w-[88px]' },
  },
  {
    accessorKey: 'preFatura',
    header: 'Pré-Fatura',
    cell: ({ row }) => (
      <span className='block truncate' title={row.original.preFatura ?? ''}>
        {row.original.preFatura || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[96px] min-w-[96px]' },
  },
  {
    accessorKey: 'ftAdse',
    header: 'FT ADSE',
    cell: ({ row }) => (
      <span className='block truncate' title={row.original.ftAdse ?? ''}>
        {row.original.ftAdse || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[88px] min-w-[88px]' },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => (
      <span className='block truncate' title={row.original.estado ?? ''}>
        {row.original.estado || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[100px] min-w-[100px]' },
  },
  {
    accessorKey: 'comunicacao',
    header: 'Comunicação',
    cell: ({ row }) => (
      <span className='block truncate' title={row.original.comunicacao ?? ''}>
        {row.original.comunicacao || '-'}
      </span>
    ),
    meta: { align: 'left', width: 'w-[110px] min-w-[110px]' },
  },
]

const pdfColumn: ColumnDef<ComunicacaoFaturasRowDTO> &
  DataTableColumnDef<ComunicacaoFaturasRowDTO> = {
  id: 'pdf',
  header: 'Pdf',
  cell: ({ row }) => (
    <div className='flex justify-center'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        title='Pdf'
        disabled={!row.original.temPdf}
      >
        <FileText className='h-4 w-4' />
      </Button>
    </div>
  ),
  enableSorting: false,
  meta: { align: 'center', width: 'w-[52px] min-w-[52px]' },
}

const relatorioColumn: ColumnDef<ComunicacaoFaturasRowDTO> &
  DataTableColumnDef<ComunicacaoFaturasRowDTO> = {
  id: 'relatorio',
  header: 'Relat.',
  cell: ({ row }) => (
    <div className='flex justify-center'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        title='Relatório'
        disabled={!row.original.temRelatorio}
      >
        <FileBarChart className='h-4 w-4' />
      </Button>
    </div>
  ),
  enableSorting: false,
  meta: { align: 'center', width: 'w-[60px] min-w-[60px]' },
}

const errosColumn: ColumnDef<ComunicacaoFaturasRowDTO> &
  DataTableColumnDef<ComunicacaoFaturasRowDTO> = {
  accessorKey: 'erros',
  header: 'Erros',
  cell: ({ row }) =>
    row.original.erros ? (
      <div className='flex justify-center' title={row.original.erros}>
        <AlertCircle className='h-4 w-4 text-amber-600' />
      </div>
    ) : (
      <span className='block text-center text-muted-foreground'>-</span>
    ),
  enableSorting: false,
  meta: { align: 'center', width: 'w-[56px] min-w-[56px]' },
}

export function getComunicacaoFaturasColumns(options?: {
  incluirColunaRelatorio?: boolean
}): Array<
  ColumnDef<ComunicacaoFaturasRowDTO> &
    DataTableColumnDef<ComunicacaoFaturasRowDTO>
> {
  const incluirRelatorio = options?.incluirColunaRelatorio ?? true
  return [
    ...baseColumns,
    pdfColumn,
    ...(incluirRelatorio ? [relatorioColumn] : []),
    errosColumn,
  ]
}

/** @deprecated Use getComunicacaoFaturasColumns({ incluirColunaRelatorio: true }) */
export const comunicacaoFaturasColumns = getComunicacaoFaturasColumns({
  incluirColunaRelatorio: true,
})
