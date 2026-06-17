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
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  useGetConsultasEfetuadasPaginated,
} from '../queries/listagem-consultas-efetuadas-queries'
import type { ConsultaTableDTO } from '@/types/dtos/consultas/consulta.dtos'

const DEFAULT_FILTERS: Array<{ id: string; value: string }> = [
  { id: 'efectuado', value: 'true' },
  { id: 'medico_logado', value: 'true' },
]

function buildFilters(
  selectedDate: Date | null,
  utenteNumeroDe: string,
  utenteNumeroAte: string
): Array<{ id: string; value: string }> {
  const f = [...DEFAULT_FILTERS]
  const numeroDe = utenteNumeroDe.trim()
  const numeroAte = utenteNumeroAte.trim()
  if (numeroDe) {
    f.push({ id: 'utente_numero_de', value: numeroDe })
  }
  if (numeroAte) {
    f.push({ id: 'utente_numero_ate', value: numeroAte })
  }
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
    header: 'Hora Início',
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.horaInic ?? '—',
    meta: { align: 'left' as const, width: 'w-[90px]' },
  },
  {
    accessorKey: 'horaFim',
    id: 'horaFim',
    header: 'Hora Fim',
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.horaFim ?? '—',
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
    accessorKey: 'organismoNome',
    id: 'organismoNome',
    header: 'Organismo',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.organismoNome ?? '—',
    meta: { align: 'left' as const, width: 'w-[220px]' },
  },
  {
    accessorKey: 'medicoNome',
    id: 'medicoNome',
    header: 'Médico',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.medicoNome ?? '—',
    meta: { align: 'left' as const, width: 'w-[180px]' },
  },
  {
    accessorKey: 'tipoConsultaDesignacao',
    id: 'tipoConsultaDesignacao',
    header: 'Tipo',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.tipoConsultaDesignacao ?? '—',
    meta: { align: 'left' as const, width: 'w-[160px]' },
  },
  {
    accessorKey: 'diagnostico',
    id: 'diagnostico',
    header: 'Diagnóstico',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.diagnostico ?? '—',
    meta: { align: 'left' as const, width: 'w-[240px]' },
  },
  {
    accessorKey: 'statusConsultaLabel',
    id: 'statusConsultaLabel',
    header: 'Estado',
    enableSorting: false,
    cell: ({ row }: CellContext<ConsultaTableDTO, unknown>) =>
      row.original.statusConsultaLabel ?? '—',
    meta: { align: 'left' as const, width: 'w-[130px]' },
  },
]

export function ListagemConsultasEfetuadasPage() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([
    { id: 'data', desc: false },
  ])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [utenteNumeroDe, setUtenteNumeroDe] = useState('')
  const [utenteNumeroAte, setUtenteNumeroAte] = useState('')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const filters = useMemo(
    () => buildFilters(selectedDate, utenteNumeroDe, utenteNumeroAte),
    [selectedDate, utenteNumeroAte, utenteNumeroDe]
  )

  const {
    data,
    isLoading,
    isError,
    error,
  } = useGetConsultasEfetuadasPaginated(page, pageSize, filters, sorting)

  useEffect(() => {
    setPage(1)
  }, [selectedDate, utenteNumeroAte, utenteNumeroDe])

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

  const clearFilters = () => {
    setSelectedDate(null)
    setUtenteNumeroDe('')
    setUtenteNumeroAte('')
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
    <div className='flex flex-wrap items-center gap-2'>
      <Input
        type='number'
        inputMode='numeric'
        min={0}
        className='h-9 w-[130px]'
        placeholder='Nº utente de'
        value={utenteNumeroDe}
        onChange={(e) => setUtenteNumeroDe(e.target.value)}
      />
      <Input
        type='number'
        inputMode='numeric'
        min={0}
        className='h-9 w-[130px]'
        placeholder='Nº utente até'
        value={utenteNumeroAte}
        onChange={(e) => setUtenteNumeroAte(e.target.value)}
      />
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
      {selectedDate || utenteNumeroDe || utenteNumeroAte ? (
        <Button variant='outline' size='sm' onClick={clearFilters}>
          Limpar filtros
        </Button>
      ) : null}
    </div>
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
