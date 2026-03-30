import { useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
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
import { useGetConsultasEfetuadasPaginated } from '../queries/consultas-efetuadas-queries'
import type { ConsultaTableDTO } from '@/types/dtos/consultas/consulta.dtos'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ConsultasEfetuadasPage() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const filters = [
    { id: 'efectuado', value: 'true' },
    { id: 'data_de', value: dateStr },
    { id: 'data_ate', value: dateStr },
  ]

  const { data, isLoading, isError, error } = useGetConsultasEfetuadasPaginated(
    1,
    50,
    filters,
    [{ id: 'data', desc: true }, { id: 'horaInic', desc: false }]
  )

  const consultas = (data?.info?.data ?? []) as ConsultaTableDTO[]
  const totalCount = data?.info?.totalCount ?? 0

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['consultas-efetuadas-paginated'] })
  }

  return (
    <>
      <PageHead title='Consultas Efetuadas | Histórico | Processo Clínico | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
            <h1 className='text-lg font-semibold'>Consultas Efetuadas</h1>
            <div className='flex items-center gap-2'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'min-w-[200px] justify-start text-left font-normal'
                    )}
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
              {error instanceof Error ? error.message : 'Erro ao carregar consultas.'}
            </div>
          ) : (
            <div className='rounded-b-lg border border-t-0 bg-card'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[100px]'>Data</TableHead>
                    <TableHead className='w-[80px]'>Hora</TableHead>
                    <TableHead className='w-[100px]'>Cód. Utente</TableHead>
                    <TableHead>Nome Utente</TableHead>
                    <TableHead>Organismo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                        A carregar...
                      </TableCell>
                    </TableRow>
                  ) : consultas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                        Nenhuma consulta efetuada nesta data.
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
                        <TableCell>{row.organismoNome ?? '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {!isLoading && totalCount > 0 && (
                <div className='border-t px-4 py-2 text-sm text-muted-foreground'>
                  Total: {totalCount} consulta(s) efetuada(s)
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardPageContainer>
    </>
  )
}
