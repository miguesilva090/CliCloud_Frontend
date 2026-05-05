import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, FileText, Trash2, Check, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ReferenciasMbService } from '@/lib/services/faturacao/referencias-mb-service'
import { toast } from '@/utils/toast-utils'
import { useState } from 'react'

function formatDate(value?: string | null) {
  if (!value) return '-'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleDateString('pt-PT')
}

export function ReferenciasMbHistoryPage() {
  const navigate = useNavigate()
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()
  const [selectedRow, setSelectedRow] = useState<any | null>(null)
  const [obsModalOpen, setObsModalOpen] = useState(false)
  const [obsMode, setObsMode] = useState<'observacao' | 'anular'>('observacao')
  const [obsTexto, setObsTexto] = useState('')

  const historicoQuery = useQuery({
    queryKey: ['referencias-mb', 'historico'],
    queryFn: () => ReferenciasMbService().getHistorico(),
  })

  const liquidarMutation = useMutation({
    mutationFn: (id: string) => ReferenciasMbService().liquidar(id),
    onSuccess: () => {
      toast.success('Referência liquidada com sucesso.')
      void historicoQuery.refetch()
    },
    onError: () => toast.error('Falha ao liquidar referência.'),
  })

  const anularMutation = useMutation({
    mutationFn: (payload: { id: string; observacao: string }) =>
      ReferenciasMbService().anular(payload.id, { observacao: payload.observacao }),
    onSuccess: () => {
      toast.success('Referência anulada com sucesso.')
      void historicoQuery.refetch()
    },
    onError: () => toast.error('Falha ao anular referência.'),
  })

  const rows = ((historicoQuery.data as any)?.info?.data ?? []) as any[]
  const isBusy = liquidarMutation.isPending || anularMutation.isPending

  const openObs = (item: any, mode: 'observacao' | 'anular') => {
    setSelectedRow(item)
    setObsMode(mode)
    setObsTexto(mode === 'observacao' ? item.mensagem ?? '' : '')
    setObsModalOpen(true)
  }

  const guardarObs = () => {
    if (!selectedRow) return
    const texto = obsTexto.trim()
    if (!texto) {
      toast.warning(obsMode === 'anular' ? 'Motivo de anulação é obrigatório.' : 'Observação é obrigatória.')
      return
    }

    if (obsMode === 'anular') {
      anularMutation.mutate({ id: selectedRow.id, observacao: texto })
      setObsModalOpen(false)
      setSelectedRow(null)
      return
    }

    toast.info('Ação "Observações" no novo fica registada pelo campo de anulação.')
    setObsModalOpen(false)
    setSelectedRow(null)
  }

  return (
    <>
      <PageHead title='Histórico Referências MB | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader className='flex flex-row items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0'
              title='Voltar'
              onClick={closeWindowTab}
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>
            <CardTitle>Histórico de Referências MB</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data Gerada</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Liquidada</TableHead>
                  <TableHead>Anulada</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Obs</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.clienteNome}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{formatDate(item.dataReferenciaGerada)}</TableCell>
                    <TableCell>{Number(item.valor ?? 0).toFixed(2)} EUR</TableCell>
                    <TableCell>{item.liquidada ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>{item.anulada ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>{item.servico ?? '-'}</TableCell>
                    <TableCell>{item.mensagem ?? '-'}</TableCell>
                    <TableCell>
                      <Button
                        size='sm'
                        variant='outline'
                        className='mr-2'
                        onClick={() => setSelectedRow(item)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='mr-2'
                        disabled={item.liquidada || item.anulada || isBusy}
                        onClick={() => liquidarMutation.mutate(item.id)}
                      >
                        <Check className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='mr-2'
                        disabled={isBusy}
                        onClick={() => openObs(item, 'observacao')}
                      >
                        <FileText className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        disabled={item.anulada || isBusy}
                        onClick={() => openObs(item, 'anular')}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center text-sm text-muted-foreground'>
                      Sem referências registadas.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog
          open={obsModalOpen}
          onOpenChange={(open) => {
            setObsModalOpen(open)
            if (!open) setSelectedRow(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{obsMode === 'anular' ? 'Motivo de Anulação' : 'Observações'}</DialogTitle>
            </DialogHeader>
            <div className='space-y-2'>
              <Label htmlFor='obs-texto'>{obsMode === 'anular' ? 'Motivo' : 'Observação'}</Label>
              <Input id='obs-texto' value={obsTexto} onChange={(e) => setObsTexto(e.target.value)} />
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setObsModalOpen(false)
                  setSelectedRow(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={guardarObs}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedRow && !obsModalOpen} onOpenChange={(open) => !open && setSelectedRow(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhe da Referência</DialogTitle>
            </DialogHeader>
            <div className='grid grid-cols-1 gap-2'>
              <Input value={`Cliente: ${selectedRow?.clienteNome ?? '-'}`} readOnly />
              <Input value={`Descrição: ${selectedRow?.descricao ?? '-'}`} readOnly />
              <Input value={`Entidade: ${selectedRow?.entidadeMb ?? '-'}`} readOnly />
              <Input value={`Referência: ${selectedRow?.referenciaCodigo ?? '-'}`} readOnly />
              <Input value={`Data Gerada: ${formatDate(selectedRow?.dataReferenciaGerada)}`} readOnly />
              <Input value={`Data Limite: ${formatDate(selectedRow?.dataLimitePagamento)}`} readOnly />
              <Input value={`Data Pagamento: ${formatDate(selectedRow?.dataPagamento)}`} readOnly />
              <Input value={`Obs: ${selectedRow?.mensagem ?? '-'}`} readOnly />
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedRow(null)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardPageContainer>
    </>
  )
}
