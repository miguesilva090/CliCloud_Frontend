import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { List, RotateCw, Stethoscope } from 'lucide-react'
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
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
import { useConsultasDoDiaAtendimento } from '@/pages/area-clinica/processo-clinico/agenda/queries/consultas-do-dia-queries'
import { ConsultaService } from '@/lib/services/consultas/consulta-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openFichaClinicaAtendimentoInApp } from '@/utils/window-utils'
import { modules } from '@/config/modules'
import type { ConsultaDoDiaDTO } from '@/types/dtos/consultas/consulta.dtos'

export type ConsultaDoDiaRow = ConsultaDoDiaDTO

const STATUS_DESMARCADA = 2
const STATUS_SUSPENSA = 4
const STATUS_CONCLUIDA = 6

const baseColumns: Array<ColumnDef<ConsultaDoDiaRow> & DataTableColumnDef<ConsultaDoDiaRow>> = [
  {
    accessorKey: 'dataLabel',
    header: 'Data',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.dataLabel ?? row.original.data ?? '—',
    meta: { align: 'left', width: 'w-[100px]' },
  },
  {
    accessorKey: 'horaInicio',
    header: 'Hora',
    cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) =>
      row.original.horaInicio ?? row.original.horaChegada ?? '—',
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
      row.original.organismoNome ?? '—',
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

function canAtenderConsulta(row: ConsultaDoDiaRow, mostrarDesmarcadas: boolean) {
  if (mostrarDesmarcadas) return false
  return ![STATUS_DESMARCADA, STATUS_SUSPENSA, STATUS_CONCLUIDA].includes(
    row.statusConsulta ?? -1
  )
}

function ConsultasDoDiaFilterControls(_: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  return null
}

export function ConsultasDoDiaPage() {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [consultasDesmarcadas, setConsultasDesmarcadas] = useState(false)
  const consultasDoDiaPermissionId = modules.areaClinica.permissions.consultasDoDia.id
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const { rows: consultasFiltradas, refetch, isFetching } = useConsultasDoDiaAtendimento(
    selectedDateStr,
    { enabled: true, desmarcadas: consultasDesmarcadas },
  )

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])

  const handleRefresh = () => {
    setPage(1)
    refetch()
  }

  const handleAtender = useCallback(
    async (row: ConsultaDoDiaRow) => {
      if (!row.id || !row.utenteId) return

      const res = await ConsultaService(consultasDoDiaPermissionId).iniciarAtendimento({
        consultaId: row.consultaId ?? null,
        consultaMarcacaoId: row.consultaMarcacaoId ?? null,
        admissaoId: row.admissaoId ?? null,
      })

      if (res.info?.status !== ResponseStatus.Success || !res.info.data?.consultaId) {
        toast.error(
          res.info?.messages?.$?.[0] ??
            res.info?.messages?.['']?.[0] ??
            'Não foi possível iniciar o atendimento.'
        )
        return
      }

      const contexto = res.info.data
      await queryClient.invalidateQueries({ queryKey: ['consultas-do-dia-atendimento'] })
      await queryClient.invalidateQueries({ queryKey: ['consultas-efetuadas-paginated'] })

      if (!contexto.utenteId) {
        toast.error('Não foi possível identificar o utente associado a este atendimento.')
        return
      }

      openFichaClinicaAtendimentoInApp(navigate, addWindow, {
        utenteId: contexto.utenteId,
        consultaId: contexto.consultaId,
        consultaMarcacaoId: contexto.consultaMarcacaoId,
        admissaoId: contexto.admissaoId,
        utenteNome: contexto.utenteNome ?? row.utenteNome,
      })
    },
    [addWindow, consultasDoDiaPermissionId, navigate, queryClient]
  )

  const columns = useMemo(
    (): Array<ColumnDef<ConsultaDoDiaRow> & DataTableColumnDef<ConsultaDoDiaRow>> => [
      ...baseColumns,
      {
        id: 'acoes',
        header: '',
        enableSorting: false,
        cell: ({ row }: CellContext<ConsultaDoDiaRow, unknown>) => {
          const consulta = row.original
          if (!canAtenderConsulta(consulta, consultasDesmarcadas)) {
            return null
          }

          return (
            <div className='flex justify-end'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                title={consulta.consultaId ? 'Abrir ficha clínica' : 'Iniciar atendimento'}
                onClick={() => handleAtender(consulta)}
              >
                <Stethoscope className='h-4 w-4' />
              </Button>
            </div>
          )
        },
        meta: { align: 'right', width: 'w-[72px]' },
      },
    ],
    [consultasDesmarcadas, handleAtender]
  )

  const toolbarActions: DataTableAction[] = [
    {
      label: consultasDesmarcadas ? 'Desmarcadas ✓' : 'Desmarcadas',
      icon: <List className='h-4 w-4' />,
      onClick: () => {
        setPage(1)
        setConsultasDesmarcadas((value) => !value)
      },
      variant: consultasDesmarcadas ? ('emerald' as const) : ('outline' as const),
    },
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
