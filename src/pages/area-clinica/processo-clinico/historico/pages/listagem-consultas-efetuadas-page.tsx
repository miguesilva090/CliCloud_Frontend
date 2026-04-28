import { useEffect, useMemo, useState } from 'react'
import { format, isValid, startOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import { RefreshCw } from 'lucide-react'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
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
import {
  useGetConsultasEfetuadasPaginated,
} from '../queries/consultas-efetuadas-queries'
import type { ConsultaTableDTO } from '@/types/dtos/consultas/consulta.dtos'

const DEFAULT_FILTERS: Array<{ id: string; value: string }> = [
  { id: 'efectuado', value: 'true' },
]

function buildFilters(
  selectedDate: Date | null
): Array<{ id: string; value: string }> {
  const f = [...DEFAULT_FILTERS]
  if (selectedDate) {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    f.push({ id: 'data_de', value: dateStr }, { id: 'data_ate', value: dateStr })
  }
  return f
}

function normalizeSelectedDate(value: Date | null | undefined): Date | null {
  if (!value || !isValid(value)) return null
  return startOfDay(value)
}

function ListagemConsultasEfetuadasFilterControls(_: {
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
    id: 'data',
    header: 'Data',
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.data ? format(new Date(row.original.data), 'dd/MM/yyyy') : '—',
    meta: { align: 'left' as const, width: 'w-[110px]' },
  },
  {
    accessorKey: 'horaInic',
    id: 'horaInic',
    header: 'Hora',
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.horaInic ?? '—',
    meta: { align: 'left' as const, width: 'w-[90px]' },
  },
  {
    accessorKey: 'utenteNumero',
    id: 'utenteNumero',
    header: 'Nº Utente',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.utenteNumero?.trim() || '—',
    meta: { align: 'left' as const, width: 'w-[120px]' },
  },
  {
    accessorKey: 'utenteNome',
    id: 'utenteNome',
    header: 'Utente',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.utenteNome ?? '—',
    meta: { align: 'left' as const, width: 'w-[220px]' },
  },
  {
    accessorKey: 'organismoCodigo',
    id: 'organismoCodigo',
    header: 'Cód. Organismo',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.organismoId ?? '—',
    meta: { align: 'left' as const, width: 'w-[130px]' },
  },
  {
    accessorKey: 'organismoNome',
    id: 'organismoNome',
    header: 'Organismo',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.organismoNome ?? '—',
    meta: { align: 'left' as const, width: 'w-[220px]' },
  },
]

export function ListagemConsultasEfetuadasPage() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const filters = useMemo(() => buildFilters(selectedDate), [selectedDate])

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetConsultasEfetuadasPaginated(page, pageSize, filters, sorting)

  useEffect(() => {
    setPage(1)
  }, [selectedDate])

  useEffect(() => {
    setIsDatePickerOpen(false)
  }, [location.pathname, location.search])

  const consultas = (data?.info?.data ?? []) as ConsultaTableDTO[]
  const pageCount = Math.max(1, data?.info?.totalPages ?? 1)
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['consultas-efetuadas-paginated'] })
  }

  const clearDate = () => {
    setSelectedDate(null)
  }

  const toolbarActions: DataTableAction[] = useMemo(
    () => [
      {
        label: 'Atualizar',
        icon: <RefreshCw className='h-4 w-4' />,
        onClick: refresh,
        variant: 'outline',
      },
    ],
    []
  )

  const toolbarEndPrefix = (
    <>
      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn('min-w-[200px] justify-start text-left font-normal')}
          >
            {selectedDate
              ? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: pt })
              : 'Todas as datas'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selectedDate ?? undefined}
            onSelect={(d) => {
              setSelectedDate(normalizeSelectedDate(d))
              setIsDatePickerOpen(false)
            }}
            locale={pt}
          />
        </PopoverContent>
      </Popover>
      {selectedDate ? (
        <Button variant='outline' size='sm' onClick={clearDate}>
          Limpar data
        </Button>
      ) : null}
    </>
  )

  return (
    <>
      <PageHead title='Listagem Consultas Efetuadas | Histórico | Processo Clínico | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Listagem Consultas Efetuadas'>
          {isError ? (
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              {errorMessage || 'Erro ao carregar consultas.'}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={consultas}
              pageCount={pageCount}
              totalRows={totalRows}
              onPaginationChange={(newPage, newPageSize) => {
                setPage(newPage)
                setPageSize(newPageSize)
              }}
              onFiltersChange={() => {}}
              onSortingChange={(newSorting) => {
                setSorting(newSorting)
                setPage(1)
              }}
              FilterControls={ListagemConsultasEfetuadasFilterControls}
              initialPage={page}
              initialPageSize={pageSize}
              initialSorting={sorting}
              initialFilters={[]}
              isLoading={isLoading}
              hideToolbarFilters
              toolbarEndPrefix={toolbarEndPrefix}
              toolbarActions={toolbarActions}
            />
          )}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
