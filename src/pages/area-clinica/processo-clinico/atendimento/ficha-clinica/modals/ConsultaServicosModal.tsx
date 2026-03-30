import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useServicoConsultaByConsulta, useServicoConsultaMutations } from '../queries/servico-consulta-queries'
import type { ConsultaTableDTO } from '@/types/dtos/saude/consultas.dtos'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import { ServicoViewCreateModal } from '@/pages/area-comum/tabelas/consultas/servicos/servicos/modals/servico-view-create-modal'

export interface ConsultaServicosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consulta?: ConsultaTableDTO | null
}

export function ConsultaServicosModal({ open, onOpenChange, consulta }: ConsultaServicosModalProps) {
  const consultaId = consulta?.id
  const { data: servicos = [], isLoading } = useServicoConsultaByConsulta(consultaId)
  const { create, remove } = useServicoConsultaMutations()
  const queryClient = useQueryClient()

  const [codigoArtigo, setCodigoArtigo] = useState('')
  const [nomeArtigo, setNomeArtigo] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [valorUtente, setValorUtente] = useState('')
  const [servicoSearch, setServicoSearch] = useState('')
  const [servicoSelecionado, setServicoSelecionado] = useState<ServicoLightDTO | null>(null)
  const [servicoDropdownOpen, setServicoDropdownOpen] = useState(false)
  const [novoServicoModalOpen, setNovoServicoModalOpen] = useState(false)

  const { data: servicosLightData } = useQuery({
    queryKey: ['servicos-light', servicoSearch],
    queryFn: async () => {
      const res = await ServicoService().getServicoLight(servicoSearch)
      return (res.info?.data ?? []) as ServicoLightDTO[]
    },
    staleTime: 5 * 60 * 1000,
  })
  const servicosLight = servicosLightData ?? []


  const handleAdicionar = () => {
    if (!consultaId) return
    if (!codigoArtigo && !nomeArtigo && !servicoSelecionado) {
      toast({
        title: 'Serviço inválido',
        description: 'Indique pelo menos o código ou o nome do artigo/serviço.',
        variant: 'destructive',
      })
      return
    }

    const qtdInput = Number(quantidade || '1')
    const qtd = Number.isNaN(qtdInput) ? 1 : qtdInput
    const valorInput = valorUtente ? Number(valorUtente) : undefined

    const codigoFinal = codigoArtigo || undefined
    const nomeFinal = nomeArtigo || servicoSelecionado?.designacao || undefined

    const novaLinha = (servicos?.length ?? 0) + 1

    create.mutate({
      consultaId,
      servicoId: servicoSelecionado?.id,
      codigoArtigo: codigoFinal,
      nomeArtigo: nomeFinal,
      quantidade: Number.isNaN(qtd) ? 1 : qtd,
      valorUt: valorInput,
      linha: novaLinha,
    })

    setCodigoArtigo('')
    setNomeArtigo('')
    setQuantidade('1')
    setValorUtente('')
    setServicoSearch('')
    setServicoSelecionado(null)
  }

  const handleRemover = (id: string) => {
    if (!consultaId) return
    remove.mutate({ id, consultaId })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Serviços da Consulta</DialogTitle>
        </DialogHeader>
        {!consultaId ? (
          <div className='py-4 text-sm text-muted-foreground'>Selecione uma consulta válida.</div>
        ) : (
          <div className='flex flex-col gap-4'>
            <div className='grid gap-2 text-sm text-muted-foreground'>
              <span>
                <span className='font-semibold'>Data:</span>{' '}
                {consulta?.data ? new Date(consulta.data).toLocaleDateString() : '-'}
              </span>
              <span>
                <span className='font-semibold'>Tipo:</span> {consulta?.tipoConsultaDesignacao ?? '-'}
              </span>
            </div>

            <div className='grid gap-3 rounded-md border bg-muted/50 p-3 sm:grid-cols-4'>
              <div className='grid gap-1 sm:col-span-2'>
                <span className='text-xs font-medium text-muted-foreground'>Serviço existente</span>
                <div className='relative flex items-center gap-2'>
                  <div className='relative w-full max-w-xs'>
                    <Input
                      value={servicoSearch}
                      onChange={(e) => {
                        const value = e.target.value
                        setServicoSearch(value)
                        setServicoSelecionado(null)
                        setServicoDropdownOpen(!!value)
                      }}
                      placeholder='Pesquisar por nome...'
                      className='pr-7'
                    />
                    <button
                      type='button'
                      className='absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted'
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setServicoDropdownOpen((open) => !open)
                      }}
                      aria-label='Abrir lista de serviços'
                    >
                      <ChevronDown className='h-4 w-4' />
                    </button>
                    {servicoDropdownOpen && servicosLight.length > 0 && (
                      <div className='absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border bg-popover text-sm shadow-md'>
                        {servicosLight.map((s) => (
                          <button
                            key={s.id}
                            type='button'
                            className='block w-full px-2 py-1 text-left hover:bg-muted'
                            onClick={async () => {
                              setServicoSelecionado(s)
                              setServicoSearch(s.designacao)
                              setNomeArtigo(s.designacao)
                              setServicoDropdownOpen(false)

                              try {
                                const res = await ServicoService().getServico(s.id)
                                const servico = res.info?.data
                                if (servico && servico.preco != null) {
                                  setValorUtente(String(servico.preco))
                                }
                              } catch {
                                // ignorar erro de preload do preço
                              }
                            }}
                          >
                            {s.designacao}
                          </button>
                        ))}
                      </div>
                    )}
                  {servicoDropdownOpen && servicosLight.length === 0 && (
                      <div className='absolute z-20 mt-1 w-full rounded-md border bg-popover px-2 py-1 text-xs text-muted-foreground shadow-md'>
                        Nenhum serviço encontrado.
                      </div>
                    )}
                  </div>
                  <Button
                    type='button'
                    size='icon'
                    variant='outline'
                    className='h-8 w-8 shrink-0'
                    title='Adicionar novo serviço'
                    onClick={() => setNovoServicoModalOpen(true)}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <div className='grid gap-1 sm:col-span-1'>
                <span className='text-xs font-medium text-muted-foreground'>Cód. Artigo (livre)</span>
                <Input
                  value={codigoArtigo}
                  onChange={(e) => setCodigoArtigo(e.target.value)}
                  placeholder='Código'
                />
              </div>
              <div className='grid gap-1 sm:col-span-1'>
                <span className='text-xs font-medium text-muted-foreground'>Descrição (livre)</span>
                <Input
                  value={nomeArtigo}
                  onChange={(e) => setNomeArtigo(e.target.value)}
                  disabled={!!servicoSelecionado}
                  placeholder='Descrição do serviço/artigo'
                />
              </div>
              <div className='grid gap-1 sm:col-span-1'>
                <span className='text-xs font-medium text-muted-foreground'>Quant.</span>
                <Input
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder='1'
                />
              </div>
              <div className='grid gap-1 sm:col-span-1'>
                <span className='text-xs font-medium text-muted-foreground'>Valor Utente (€)</span>
                <Input
                  value={valorUtente}
                  onChange={(e) => setValorUtente(e.target.value)}
                  disabled={!!servicoSelecionado}
                  placeholder='Opcional'
                />
              </div>
              <div className='flex items-end justify-end sm:col-span-3'>
                <Button
                  type='button'
                  size='sm'
                  onClick={handleAdicionar}
                  disabled={create.isPending || !consultaId}
                >
                  Inserir serviço
                </Button>
              </div>
            </div>

            <div className='max-h-[260px] overflow-y-auto rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[80px]'>Ordem</TableHead>
                    <TableHead className='w-[120px]'>Cód. Artigo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className='w-[80px]'>Quant.</TableHead>
                    <TableHead className='w-[110px]'>Val. Utente</TableHead>
                    <TableHead className='w-[40px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className='py-4 text-center text-sm text-muted-foreground'>
                        A carregar serviços...
                      </TableCell>
                    </TableRow>
                  ) : servicos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='py-4 text-center text-sm text-muted-foreground'>
                        Nenhum serviço associado à consulta.
                      </TableCell>
                    </TableRow>
                  ) : (
                    servicos.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.ordem ?? ''}</TableCell>
                        <TableCell>{s.codigoArtigo ?? ''}</TableCell>
                        <TableCell>{s.nomeArtigo ?? ''}</TableCell>
                        <TableCell>{s.quantidade ?? ''}</TableCell>
                        <TableCell>
                          {s.valorUt !== null && s.valorUt !== undefined ? s.valorUt.toFixed(2) : ''}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7 text-destructive hover:text-destructive'
                            onClick={() => handleRemover(s.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
      <ServicoViewCreateModal
        open={novoServicoModalOpen}
        onOpenChange={setNovoServicoModalOpen}
        mode='create'
        viewData={null}
        onSuccess={async () => {
          setNovoServicoModalOpen(false)
          // Recarregar serviços light para nova seleção
          await queryClient.invalidateQueries({ queryKey: ['servicos-light'] })
          toast({
            title: 'Serviço criado',
            description: 'O serviço foi criado com sucesso. Pode agora selecioná-lo na lista.',
          })
        }}
      />
    </Dialog>
  )
}

