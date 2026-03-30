import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { usePageData } from '@/utils/page-data-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
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
  usePrefetchAdjacentConsultasEfetuadas,
} from '../queries/consultas-efetuadas-queries'
import type { ConsultaTableDTO } from '@/types/dtos/consultas/consulta.dtos'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const DEFAULT_FILTERS: Array<{ id: string; value: string }> = [
  { id: 'efectuado', value: 'true' },
]

function buildFilters(selectedDate: Date | null): Array<{ id: string; value: string }> {
  const f = [...DEFAULT_FILTERS]
  if (selectedDate) {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    f.push({ id: 'data_de', value: dateStr }, { id: 'data_ate', value: dateStr })
  }
  return f
}

export function ListagemConsultasEfetuadasPage() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    handleFiltersChange,
    handlePaginationChange,
  } = usePageData({
    useGetDataPaginated: useGetConsultasEfetuadasPaginated,
    usePrefetchAdjacentData: usePrefetchAdjacentConsultasEfetuadas,
  })

  useEffect(() => {
    handleFiltersChange(buildFilters(selectedDate))
  }, [selectedDate])

  const consultas = (data?.info?.data ?? []) as ConsultaTableDTO[]
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['consultas-efetuadas-paginated'] })
  }

  const clearDate = () => {
    setSelectedDate(null)
  }

  return (
    <>
      <PageHead title='Listagem Consultas Efetuadas | Histórico | Processo Clínico | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
            <h1 className='text-lg font-semibold'>Listagem Consultas Efetuadas</h1>
            <div className='flex items-center gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'min-w-[200px] justify-start text-left font-normal'
                    )}
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
                    onSelect={(d) => setSelectedDate(d ?? null)}
                    locale={pt}
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && (
                <Button variant='outline' size='sm' onClick={clearDate}>
                  Limpar data
                </Button>
              )}
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={refresh}
                title='Atualizar'
              >
                <RefreshCw className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {isError ? (
            <div className='rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
              {errorMessage || 'Erro ao carregar consultas.'}
            </div>
          ) : (
            <div className='rounded-b-lg border border-t-0 bg-card'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[100px]'>Data</TableHead>
                    <TableHead className='w-[80px]'>Hora</TableHead>
                    <TableHead className='w-[100px]'>Cód. Utente</TableHead>
                    <TableHead>Utente</TableHead>
                    <TableHead className='w-[100px]'>Cód. Organismo</TableHead>
                    <TableHead>Organismo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                        A carregar...
                      </TableCell>
                    </TableRow>
                  ) : consultas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                        {selectedDate
                          ? 'Nenhuma consulta efetuada nesta data.'
                          : 'Nenhuma consulta efetuada.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    consultas.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.data
                            ? format(new Date(row.data), 'dd/MM/yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>{row.horaInic ?? '-'}</TableCell>
                        <TableCell>{row.utenteId ?? '-'}</TableCell>
                        <TableCell>{row.utenteNome ?? '-'}</TableCell>
                        <TableCell>{row.organismoId ?? '-'}</TableCell>
                        <TableCell>{row.organismoNome ?? '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className='flex items-center justify-between border-t px-4 py-2 text-sm text-muted-foreground'>
                <span>
                  Página {page} de {pageCount || 1} | Mostrar {pageSize} registos | Encontrados {totalRows} registos
                </span>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page <= 1}
                    onClick={() => handlePaginationChange(page - 1, pageSize)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page >= pageCount}
                    onClick={() => handlePaginationChange(page + 1, pageSize)}
                  >
                    Seguinte
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}
