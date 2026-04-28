import { useEffect, useMemo, useState } from 'react'
import { format, isValid, startOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import { RotateCw } from 'lucide-react'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { DataTable, type DataTableAction } from '@/components/shared/data-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { useGetConsultasEfetuadasPaginated } from '../queries/consultas-efetuadas-queries'
import type { ConsultaTableDTO } from '@/types/dtos/consultas/consulta.dtos'

const DEFAULT_SORTING: Array<{ id: string; desc: boolean }> = [
  { id: 'Data', desc: true },
  { id: 'HoraInicio', desc: false },
]

function normalizeSelectedDate(value: Date | null | undefined): Date | null {
  if (!value || !isValid(value)) return null
  return startOfDay(value)
}

function ConsultasEfetuadasFilterControls(_: {
  table: unknown
  columns: unknown[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  return null
}

const columns: Array<
  ColumnDef<ConsultaTableDTO> & DataTableColumnDef<ConsultaTableDTO>
> = [
  {
    accessorKey: 'data',
    id: 'Data',
    header: 'Data',
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.data
        ? format(new Date(row.original.data), 'dd/MM/yyyy')
        : '—',
    meta: { align: 'left', width: 'w-[110px]' },
  },
  {
    accessorKey: 'horaInic',
    id: 'HoraInicio',
    header: 'Hora',
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.horaInic ?? '—',
    meta: { align: 'left', width: 'w-[90px]' },
  },
  {
    accessorKey: 'utenteNumero',
    id: 'UtenteNumero',
    header: 'Nº Utente',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.utenteNumero?.trim() || '—',
    meta: { align: 'left', width: 'w-[120px]' },
  },
  {
    accessorKey: 'utenteNome',
    header: 'Nome Utente',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.utenteNome ?? '—',
    meta: { align: 'left', width: 'w-[200px]' },
  },
  {
    accessorKey: 'organismoNome',
    header: 'Organismo',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.organismoNome ?? '—',
    meta: { align: 'left', width: 'w-[180px]' },
  },
]

export function ConsultasEfetuadasPage() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()))
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] =
    useState<Array<{ id: string; desc: boolean }>>(DEFAULT_SORTING)

  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const filters = useMemo(
    () => [
      { id: 'efectuado', value: 'true' },
      { id: 'data_de', value: dateStr },
      { id: 'data_ate', value: dateStr },
    ],
    [dateStr]
  )

  useEffect(() => {
    setPage(1)
  }, [dateStr])

  useEffect(() => {
    setIsDatePickerOpen(false)
  }, [location.pathname, location.search])

  const {
    data,
    isFetching,
    isError,
    error,
  } = useGetConsultasEfetuadasPaginated(page, pageSize, filters, sorting)

  const rows = (data?.info?.data ?? []) as ConsultaTableDTO[]
  const totalRows = data?.info?.totalCount ?? 0
  const totalPages = Math.max(1, data?.info?.totalPages ?? 1)

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['consultas-efetuadas-paginated'] })
  }

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Atualizar',
      icon: (
        <RotateCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
      ),
      onClick: refresh,
      variant: 'outline',
      disabled: isFetching,
    },
  ]

  const toolbarEndPrefix = (
    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
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
          onSelect={(date) => {
            const normalizedDate = normalizeSelectedDate(date)
            if (normalizedDate) {
              setSelectedDate(normalizedDate)
            }
            setIsDatePickerOpen(false)
          }}
          locale={pt}
        />
      </PopoverContent>
    </Popover>
  )

  const initialFilters: Array<{ id: string; value: string }> = []

  return (
    <>
      <PageHead title='Consultas Efetuadas | Histórico | Processo Clínico | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Consultas Efetuadas'>
          {isError ? (
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              {error instanceof Error ? error.message : 'Erro ao carregar consultas.'}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              pageCount={totalPages}
              totalRows={totalRows}
              initialPage={page}
              initialPageSize={pageSize}
              initialFilters={initialFilters}
              initialSorting={sorting}
              onPaginationChange={(newPage, newPageSize) => {
                setPage(newPage)
                setPageSize(newPageSize)
              }}
              onFiltersChange={() => {}}
              onSortingChange={(newSorting) => {
                setSorting(newSorting)
                setPage(1)
              }}
              FilterControls={ConsultasEfetuadasFilterControls}
              hideToolbarFilters
              toolbarEndPrefix={toolbarEndPrefix}
              toolbarActions={toolbarActions}
              isLoading={isFetching}
            />
          )}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
