import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import type { ConsultaTableDTO } from '@/types/dtos/saude/consultas.dtos'
import { ChevronDown, RefreshCw, Eye, CheckCircle } from 'lucide-react'

export interface ConsultasDiaSectionProps {
  utenteId: string
  consultasDia: ConsultaTableDTO[]
  isLoadingDia: boolean
  isErrorDia: boolean
  errorMessageDia: string

  consultasHistorico: ConsultaTableDTO[]
  isLoadingHistorico: boolean
  isErrorHistorico: boolean
  errorMessageHistorico: string
  page: number
  pageCount: number
  pageSize: number
  totalRows: number
  onPaginationChange: (page: number, pageSize: number) => void
  onRefresh: () => void
  onVerConsulta: (consulta: ConsultaTableDTO) => void
  onFinalizarConsulta: (consulta: ConsultaTableDTO) => void

  abrirHistorico: boolean
  onAbrirHistoricoChange: (open: boolean) => void
  abrirAoCarregar: boolean
  onAbrirAoCarregarChange: (checked: boolean) => void
}

export function ConsultasDiaSection({
  utenteId,
  consultasDia,
  isLoadingDia,
  isErrorDia,
  errorMessageDia,
  consultasHistorico,
  isLoadingHistorico,
  isErrorHistorico,
  errorMessageHistorico,
  page,
  pageCount,
  pageSize,
  totalRows,
  onPaginationChange,
  onRefresh,
  onVerConsulta,
  onFinalizarConsulta,
  abrirHistorico,
  onAbrirHistoricoChange,
  abrirAoCarregar,
  onAbrirAoCarregarChange,
}: ConsultasDiaSectionProps) {
  return (
    <Collapsible open={abrirHistorico} onOpenChange={onAbrirHistoricoChange}>
      <div className='rounded-lg border bg-card'>
        {/* Consultas do dia – sempre visíveis */}
        <div className='overflow-x-auto px-2 pt-2'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[110px] text-center'>Data</TableHead>
                <TableHead className='w-[120px] text-center'>Tipo de Consulta</TableHead>
                <TableHead className='w-[90px] text-center'>Hora Marcada</TableHead>
                <TableHead className='w-[90px] text-center'>Hora Saída</TableHead>
                <TableHead className='text-center'>Médico</TableHead>
                <TableHead className='text-center'>Tipo de Admissão / Especialidade</TableHead>
                <TableHead className='w-[120px] text-center'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!utenteId ? (
                <TableRow>
                  <TableCell colSpan={7} className='py-6 text-center text-muted-foreground'>
                    Selecione um utente para ver as consultas do dia.
                  </TableCell>
                </TableRow>
              ) : isErrorDia ? (
                <TableRow>
                  <TableCell colSpan={7} className='py-6 text-center text-destructive'>
                    {errorMessageDia || 'Erro ao carregar consultas.'}
                  </TableCell>
                </TableRow>
              ) : isLoadingDia ? (
                <TableRow>
                  <TableCell colSpan={7} className='py-6 text-center text-muted-foreground'>
                    A carregar...
                  </TableCell>
                </TableRow>
              ) : consultasDia.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='py-6 text-center font-medium text-muted-foreground'>
                    NÃO EXISTEM CONSULTAS HOJE!
                  </TableCell>
                </TableRow>
              ) : (
                consultasDia.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className='text-center'>
                      {row.data ? format(new Date(row.data), 'dd-MM-yyyy') : '-'}
                    </TableCell>
                    <TableCell className='text-center'>{row.tipoConsultaDesignacao ?? '-'}</TableCell>
                    <TableCell className='text-center'>{row.horaInic ?? '-'}</TableCell>
                    <TableCell className='text-center'>{row.horaFim ?? '-'}</TableCell>
                    <TableCell className='text-center'>{row.medicoNome ?? '-'}</TableCell>
                    <TableCell className='text-center'>{row.especialidadeDesignacao ?? '-'}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Trigger do histórico – chevron no canto inferior esquerdo */}
        <div className='flex items-center justify-between gap-2 px-2 pb-2 pt-1'>
          <label className='flex items-center gap-2 text-xs text-muted-foreground select-none'>
            <input
              type='checkbox'
              className='h-4 w-4 accent-primary'
              checked={abrirAoCarregar}
              onChange={(e) => onAbrirAoCarregarChange(e.target.checked)}
            />
            Abrir histórico ao carregar
          </label>
          <CollapsibleTrigger asChild>
            <button
              type='button'
              className='inline-flex h-6 w-6 items-center justify-center rounded-md border border-primary/40 text-primary hover:bg-primary/5 transition-colors'
              aria-label='Mostrar histórico de consultas'
            >
              <ChevronDown className='h-3 w-3' />
            </button>
          </CollapsibleTrigger>
        </div>

        {/* Histórico de consultas – abre por baixo com o mesmo cartão */}
        <CollapsibleContent>
          {!utenteId ? (
            <div className='px-4 py-6 text-center text-sm text-muted-foreground'>
              Selecione um utente para ver o histórico de consultas.
            </div>
          ) : isErrorHistorico ? (
            <div className='px-4 py-3 text-sm text-destructive'>
              {errorMessageHistorico || 'Erro ao carregar consultas.'}
            </div>
          ) : (
            <>
              <div className='overflow-x-auto border-t'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[110px]'>Data</TableHead>
                      <TableHead className='w-[120px]'>Tipo de Consulta</TableHead>
                      <TableHead className='w-[90px]'>Hora Marcada</TableHead>
                      <TableHead className='w-[90px]'>Hora Saída</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Tipo de Admissão / Especialidade</TableHead>
                      <TableHead className='w-[120px] text-center'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingHistorico ? (
                      <TableRow>
                        <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                          A carregar...
                        </TableCell>
                      </TableRow>
                    ) : consultasHistorico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                          Nenhuma consulta efetuada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      consultasHistorico.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className='text-center'>
                            {row.data ? format(new Date(row.data), 'dd-MM-yyyy') : '-'}
                          </TableCell>
                          <TableCell className='text-center'>{row.tipoConsultaDesignacao ?? '-'}</TableCell>
                          <TableCell className='text-center'>{row.horaInic ?? '-'}</TableCell>
                          <TableCell className='text-center'>{row.horaFim ?? '-'}</TableCell>
                          <TableCell className='text-center'>{row.medicoNome ?? '-'}</TableCell>
                          <TableCell className='text-center'>{row.especialidadeDesignacao ?? '-'}</TableCell>
                          <TableCell className='text-center'>
                            <div className='flex items-center justify-center gap-2'>
                              <Button
                                type='button'
                                size='icon'
                                variant='ghost'
                                className='h-8 w-8'
                                title='Ver / editar consulta'
                                onClick={() => onVerConsulta(row)}
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button
                                type='button'
                                size='icon'
                                variant='ghost'
                                className='h-8 w-8'
                                onClick={() => !row.horaFim && onFinalizarConsulta(row)}
                                disabled={!!row.horaFim}
                                title={row.horaFim ? 'Consulta já terminada' : 'Terminar consulta'}
                              >
                                <CheckCircle className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className='flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-sm text-muted-foreground'>
                <span>
                  Página {page} de {pageCount || 1} | Mostrar {pageSize} registos | Encontrados {totalRows} registos
                </span>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page <= 1}
                    onClick={() => onPaginationChange(page - 1, pageSize)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page >= pageCount}
                    onClick={() => onPaginationChange(page + 1, pageSize)}
                  >
                    Seguinte
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={onRefresh}
                    title='Atualizar'
                  >
                    <RefreshCw className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
