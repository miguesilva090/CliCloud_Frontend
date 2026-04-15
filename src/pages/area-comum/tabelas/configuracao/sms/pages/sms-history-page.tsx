import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { SmsService } from '@/lib/services/core/sms-service'
import type { HistoricoSmsTabelaDTO } from '@/types/dtos/core/sms.dtos'

type TipoHistorico = 'enviadas' | 'recebidas'

export function SmsHistoryPage() {
  const [searchParams] = useSearchParams()
  const tipoInicial = searchParams.get('tipo') === 'enviadas' ? 'enviadas' : 'recebidas'
  const [tipo, setTipo] = useState<TipoHistorico>(tipoInicial)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [selected, setSelected] = useState<HistoricoSmsTabelaDTO | null>(null)

  const filtros = (() => {
    const base: Array<{ id: string; value: string }> = []
    if (tipo === 'recebidas') {
      base.push({ id: 'status', value: 'Recebida' })
    }
    return base
  })()

  const historicoQuery = useQuery({
    queryKey: ['sms-historico', tipo, pageNumber, pageSize],
    queryFn: () =>
      SmsService().getHistoricoPaginado({
        pageNumber,
        pageSize,
        filters: filtros,
      }),
  })

  const info = historicoQuery.data?.info
  const rows = (info?.data ?? []) as HistoricoSmsTabelaDTO[]
  const totalPages = info?.totalPages ?? 1
  const tipoLabel = tipo === 'enviadas' ? 'Enviadas' : 'Recebidas'

  return (
    <>
      <PageHead title='Histórico de SMS | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between gap-3'>
              <CardTitle>Histórico de SMS</CardTitle>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant={tipo === 'enviadas' ? 'default' : 'outline'}
                  onClick={() => {
                    if (tipo !== 'enviadas') {
                      setTipo('enviadas')
                      setPageNumber(1)
                    }
                  }}
                >
                  Enviadas
                </Button>
                <Button
                  size='sm'
                  variant={tipo === 'recebidas' ? 'default' : 'outline'}
                  onClick={() => {
                    if (tipo !== 'recebidas') {
                      setTipo('recebidas')
                      setPageNumber(1)
                    }
                  }}
                >
                  Recebidas
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-3'>
            <div className='rounded border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='text-center'>Data</TableHead>
                    <TableHead className='text-center'>Hora</TableHead>
                    <TableHead className='text-center'>Utente</TableHead>
                    <TableHead className='text-center'>Contacto</TableHead>
                    <TableHead className='text-center'>Resultado</TableHead>
                    <TableHead className='text-center'>Mensagem</TableHead>
                    <TableHead className='w-[80px] text-center'>Opções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center text-sm text-muted-foreground'>
                        A carregar histórico...
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {!historicoQuery.isLoading && !rows.length ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center text-sm text-muted-foreground'>
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
                        <TableCell className='text-center'>{r.codigoUtente ?? '-'}</TableCell>
                        <TableCell className='text-center'>{r.numeroDestinatario || '-'}</TableCell>
                        <TableCell className='text-center'>{r.status || '-'}</TableCell>
                        <TableCell className='max-w-[420px] truncate text-center'>{r.textoMensagem || '-'}</TableCell>
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
            <DialogTitle>Histórico de SMS</DialogTitle>
            <DialogDescription className='sr-only'>Detalhe do registo SMS.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
              <div><strong>Data:</strong> {new Date(selected.dataHoraCriacao).toLocaleDateString('pt-PT')}</div>
              <div><strong>Hora:</strong> {new Date(selected.dataHoraCriacao).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className='md:col-span-2'><strong>Contacto:</strong> {selected.numeroDestinatario || '-'}</div>
              <div className='md:col-span-2'><strong>Resultado:</strong> {selected.status || '-'}</div>
              <div className='md:col-span-2'><strong>Mensagem:</strong> {selected.textoMensagem || '-'}</div>
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
