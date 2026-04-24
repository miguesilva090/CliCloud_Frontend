import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { navigateManagedWindow } from '@/utils/window-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmailService } from '@/lib/services/core/email-service'
import type { HistoricoEmailTabelaDTO } from '@/types/dtos/core/email.dtos'

export function EmailHistoryPage() {
  const navigate = useNavigate()
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [selected, setSelected] = useState<HistoricoEmailTabelaDTO | null>(null)

  const historicoQuery = useQuery({
    queryKey: ['email-historico', pageNumber, pageSize],
    queryFn: () =>
      EmailService().getHistoricoPaginado({
        pageNumber,
        pageSize,
        filters: [],
      }),
  })

  const info = historicoQuery.data?.info
  const rows = (info?.data ?? []) as HistoricoEmailTabelaDTO[]
  const totalPages = info?.totalPages ?? 1

  return (
    <>
      <PageHead title='Histórico de Emails | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader className='pb-3 flex flex-row items-center justify-between'>
            <CardTitle>Histórico de Emails</CardTitle>
            <Button
              variant='outline'
              size='sm'
              title='Voltar'
              onClick={() =>
                navigateManagedWindow(
                  navigate,
                  '/area-comum/tabelas/configuracao/email'
                )
              }
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Voltar
            </Button>
          </CardHeader>

          <CardContent className='space-y-3'>
            <div className='rounded border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-center'>Data</TableHead>
                    <TableHead className='text-center'>Hora</TableHead>
                    <TableHead className='text-center'>Destino</TableHead>
                    <TableHead className='text-center'>Assunto</TableHead>
                    <TableHead className='text-center'>Resultado</TableHead>
                    <TableHead className='w-[80px] text-center'>Opções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center text-sm text-muted-foreground'>
                        A carregar histórico...
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!historicoQuery.isLoading && !rows.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center text-sm text-muted-foreground'>
                        Sem registos para apresentar.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {rows.map((r) => {
                    const data = r.dataHoraCriacao ? new Date(r.dataHoraCriacao) : null
                    const dataTxt = data ? data.toLocaleDateString('pt-PT') : '-'
                    const horaTxt = data ? data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '-'
                    return (
                      <TableRow key={r.id}>
                        <TableCell className='text-center'>{dataTxt}</TableCell>
                        <TableCell className='text-center'>{horaTxt}</TableCell>
                        <TableCell className='text-center'>{r.emailDestino || '-'}</TableCell>
                        <TableCell className='text-center max-w-[300px] truncate'>{r.assuntoEmail || '-'}</TableCell>
                        <TableCell className='text-center'>{r.status || '-'}</TableCell>
                        <TableCell className='text-center'>
                          <Button size='icon' variant='ghost' onClick={() => setSelected(r)} aria-label='Ver detalhe'>
                            <Search className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className='text-sm text-muted-foreground'>
                Página {pageNumber} de {Math.max(1, totalPages)}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                Seguinte
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardPageContainer>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Histórico de Emails</DialogTitle>
            <DialogDescription className='sr-only'>Detalhe do registo de email.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
              <div><strong>Data:</strong> {new Date(selected.dataHoraCriacao).toLocaleDateString('pt-PT')}</div>
              <div><strong>Hora:</strong> {new Date(selected.dataHoraCriacao).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className='md:col-span-2'><strong>Destino:</strong> {selected.emailDestino || '-'}</div>
              <div className='md:col-span-2'><strong>Assunto:</strong> {selected.assuntoEmail || '-'}</div>
              <div className='md:col-span-2'><strong>Resultado:</strong> {selected.status || '-'}</div>
              <div className='md:col-span-2'><strong>Mensagem:</strong> {selected.corpoEmail || '-'}</div>
              <div className='md:col-span-2'><strong>Erro:</strong> {selected.mensagemErro || '-'}</div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setSelected(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
