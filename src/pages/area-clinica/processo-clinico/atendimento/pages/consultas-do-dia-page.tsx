import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { RotateCw } from 'lucide-react'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DataTable } from '@/components/shared/data-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ConsultaMarcadaRow } from '@/pages/area-clinica/processo-clinico/agenda/types/consulta-marcada-types'
import { useConsultasDoDiaMarcacoes } from '@/pages/area-clinica/processo-clinico/agenda/queries/consultas-do-dia-queries'

export type ConsultaDoDiaRow = ConsultaMarcadaRow

const columns: Array<ColumnDef<ConsultaDoDiaRow> & DataTableColumnDef<ConsultaDoDiaRow>> = [
  {
    accessorKey: 'dataLabel',
    header: 'Data',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.dataLabel ?? row.original.data ?? '—',
    meta: { align: 'left', width: 'w-[100px]' },
  },
  {
    accessorKey: 'horaMarcacaoLabel',
    header: 'Hora',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.horaMarcacaoLabel ?? '—',
    meta: { align: 'left', width: 'w-[80px]' },
  },
  {
    accessorKey: 'utenteNumero',
    header: 'Nº Utente',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.utenteNumero ?? '—',
    meta: { align: 'left', width: 'w-[100px]' },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Nome Utente',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.utenteNome ?? '—',
    meta: { align: 'left', width: 'w-[200px]' },
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.organismoNome ?? row.original.organismoCodigo ?? '—',
    meta: { align: 'left', width: 'w-[120px]' },
  },
  {
    accessorKey: 'statusConsultaLabel',
    header: 'Estado',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.statusConsultaLabel ?? '—',
    meta: { align: 'left', width: 'w-[120px]' },
  },
]

function ConsultasDoDiaFilterControls(_: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  return null
}

export function ConsultasDoDiaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const { rows: consultasFiltradas, refetch, isFetching } = useConsultasDoDiaMarcacoes(
    selectedDateStr,
    { enabled: true },
  )

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])

  const handleRefresh = () => {
    setPage(1)
    refetch()
  }

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Atualizar',
      icon: <RotateCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />,
      onClick: handleRefresh,
      variant: 'outline',
      disabled: isFetching,
    },
  ]

  const totalRegistos = consultasFiltradas.length
  const totalPages = Math.max(1, Math.ceil(totalRegistos / pageSize))
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return consultasFiltradas.slice(start, start + pageSize)
  }, [consultasFiltradas, page, pageSize])

  const filters: Array<{ id: string; value: string }> = []

  const datePickerTrigger = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          className={cn('min-w-[200px] justify-start text-left font-normal')}
        >
          {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: pt })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
          locale={pt}
        />
      </PopoverContent>
    </Popover>
  )

  return (
    <>
      <PageHead title='Consultas do Dia | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Consultas do Dia'>
          <DataTable
            columns={columns}
            data={paginatedRows}
            pageCount={totalPages}
            totalRows={totalRegistos}
            initialPage={page}
            initialPageSize={pageSize}
            initialFilters={filters}
            initialSorting={sorting}
            onPaginationChange={(newPage, newPageSize) => {
              setPage(newPage)
              setPageSize(newPageSize)
            }}
            onFiltersChange={() => {}}
            onSortingChange={(newSorting) => setSorting(newSorting)}
            FilterControls={ConsultasDoDiaFilterControls}
            hideToolbarFilters
            toolbarEndPrefix={datePickerTrigger}
            toolbarActions={toolbarActions}
            isLoading={isFetching}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
