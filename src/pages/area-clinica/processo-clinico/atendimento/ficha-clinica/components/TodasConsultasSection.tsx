import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import type { ConsultaTableDTO } from '@/types/dtos/saude/consultas.dtos'
import { ChevronDown, ChevronRight, RefreshCw, Eye, CheckCircle } from 'lucide-react'

export interface TodasConsultasSectionProps {
  utenteId: string
  consultas: ConsultaTableDTO[]
  isLoading: boolean
  isError: boolean
  errorMessage: string
  page: number
  pageCount: number
  pageSize: number
  totalRows: number
  onPaginationChange: (page: number, pageSize: number) => void
  onRefresh: () => void
  onVerConsulta: (consulta: ConsultaTableDTO) => void
  onFinalizarConsulta: (consulta: ConsultaTableDTO) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  abrirAoCarregar: boolean
  onAbrirAoCarregarChange: (checked: boolean) => void
}

export function TodasConsultasSection({
  utenteId,
  consultas,
  isLoading,
  isError,
  errorMessage,
  page,
  pageCount,
  pageSize,
  totalRows,
  onPaginationChange,
  onRefresh,
  onVerConsulta,
  onFinalizarConsulta,
  open,
  onOpenChange,
  abrirAoCarregar,
  onAbrirAoCarregarChange,
}: TodasConsultasSectionProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className='rounded-lg border bg-card'>
        <div className='flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3'>
          <CollapsibleTrigger className='-m-2 flex flex-1 items-center gap-2 rounded p-2 text-left hover:bg-muted/40'>
            {open ? <ChevronDown className='h-4 w-4 shrink-0' /> : <ChevronRight className='h-4 w-4 shrink-0' />}
            <span className='text-sm font-semibold'>Todas as Consultas</span>
          </CollapsibleTrigger>
          <label className='flex cursor-pointer items-center gap-2 text-sm text-muted-foreground'>
            <Checkbox
              checked={abrirAoCarregar}
              onCheckedChange={(c) => onAbrirAoCarregarChange(c === true)}
            />
            Abrir consultas utente ao carregar a página.
          </label>
        </div>
        <CollapsibleContent>
          {!utenteId ? (
            <div className='px-4 py-6 text-center text-sm text-muted-foreground'>
              Selecione um utente para ver o histórico de consultas.
            </div>
          ) : isError ? (
            <div className='px-4 py-3 text-sm text-destructive'>
              {errorMessage || 'Erro ao carregar consultas.'}
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                          A carregar...
                        </TableCell>
                      </TableRow>
                    ) : consultas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
                          Nenhuma consulta efetuada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      consultas.map((row) => (
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
                  Página {page} de {pageCount || 1} | Mostrar {pageSize} registos | Encontrados {totalRows}{' '}
                  registos
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
                  <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onRefresh} title='Atualizar'>
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
