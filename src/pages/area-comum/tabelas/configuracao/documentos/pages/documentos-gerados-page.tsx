import { useCallback, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Download, RefreshCw } from 'lucide-react'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getRuntimeConfig } from '@/lib/config/runtime-config'
import { MotorDocumentalService } from '@/lib/services/documentos/motor-documental-service'
import { useAuthStore } from '@/stores/auth-store'
import type { InstanciaDocumentoDTO } from '@/types/dtos/documentos/motor-documental.dtos'
import { ConsentimentoService } from '@/lib/services/documentos/consentimento-service'
import { EstadoPedidoConsentimento, type PedidoConsentimentoDTO } from '@/types/dtos/documentos/consentimento.dtos'

export function DocumentosGeradosPage() {
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [assinaturaDialogOpen, setAssinaturaDialogOpen] = useState(false)
  const [assinaturaPedidoId, setAssinaturaPedidoId] = useState<string | null>(null)
  const pageSize = 15
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const utenteIdFiltro = (searchParams.get('utenteId') ?? '').trim()
  const instanciaIdFiltro = (searchParams.get('instanciaId') ?? '').trim()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['motor-documental-instancias'],
    queryFn: async () => {
      const res = await MotorDocumentalService().getInstancias()
      return res.info.data ?? []
    },
  })

  const { data: pedidosData, refetch: refetchPedidos } = useQuery({
    queryKey: ['pedidos-assinatura-documentos'],
    queryFn: async () => {
      const res = await ConsentimentoService().obterPedidos()
      return res.info.data ?? []
    },
    refetchInterval: 5000,
  })

  const handleCriarPedidoAssinatura = useCallback(async (instanciaId: string, utenteId?: string) => {
    try {
      await ConsentimentoService().criarPedido({
        instanciaDocumentoId: instanciaId,
        utenteId,
        tipoConsentimento: 'ASSINATURA_DOCUMENTO',
        canal: 'presencial'
      })
      await refetch()
      await refetchPedidos()
    }
    catch (error) {
      console.error('Erro ao criar pedido de consentimento:', error)
    }
  }, [refetch, refetchPedidos])

  const handleMarcarAssinado = useCallback(async (pedidoId: string) => {
    try {
      const canvas = canvasRef.current
      const assinaturaBase64 = canvas?.toDataURL('image/png')

      await ConsentimentoService().marcarAssinado(pedidoId, {
        assinadoPor: 'Operador',
        observacoes: 'Assinado manualmente',
        assinaturaBase64
      })
      await refetch()
      await refetchPedidos()
      setAssinaturaDialogOpen(false)
      setAssinaturaPedidoId(null)
    }
    catch (error) {
      console.error('Erro ao marcar pedido como assinado:', error)
    }
  }, [refetch, refetchPedidos])

  const openAssinaturaDialog = useCallback((pedidoId: string) => {
    setAssinaturaPedidoId(pedidoId)
    setAssinaturaDialogOpen(true)
  }, [])

  const getCanvasPosition = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }, [])

  const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getCanvasPosition(event)
    ctx.beginPath()
    ctx.moveTo(x, y)
    isDrawingRef.current = true
  }, [getCanvasPosition])

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getCanvasPosition(event)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#111827'
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [getCanvasPosition])

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false
  }, [])

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const handleCancelarPedido = useCallback(async (pedidoId: string) => {
    try {
      await ConsentimentoService().cancelarPedido(pedidoId, 'Cancelado manualmente')
      await refetch()
      await refetchPedidos()
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error)
    }
  }, [refetch, refetchPedidos])

  const handleReenviarPedido = useCallback(async (instanciaId: string, utenteId?: string) => {
    await handleCriarPedidoAssinatura(instanciaId, utenteId)
  }, [handleCriarPedidoAssinatura])

  const { data: modelosData } = useQuery({
    queryKey: ['motor-documental-modelos-lookup'],
    queryFn: async () => {
      const res = await MotorDocumentalService().getModelos()
      return res.info.data ?? []
    },
  })

  const modeloMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of modelosData ?? []) {
      map.set(m.id, m.nome)
    }
    return map
  }, [modelosData])

  const instancias = useMemo(() => {
    let list = data ?? []
    if (utenteIdFiltro) {
      list = list.filter((i) => (i.utenteId ?? '') === utenteIdFiltro)
    }
    if (instanciaIdFiltro) {
      list = list.filter((i) => i.id === instanciaIdFiltro)
    }
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      list = list.filter(
        (i) =>
          i.titulo.toLowerCase().includes(k) ||
          (modeloMap.get(i.modeloDocumentoId) ?? '').toLowerCase().includes(k)
      )
    }
    return list
  }, [data, keyword, modeloMap, utenteIdFiltro, instanciaIdFiltro])

  const totalPages = Math.max(1, Math.ceil(instancias.length / pageSize))
  const paginatedInstancias = useMemo(
    () => instancias.slice((page - 1) * pageSize, page * pageSize),
    [instancias, page]
  )

  const handleDownload = useCallback(async (inst: InstanciaDocumentoDTO) => {
    try {
      const url = MotorDocumentalService().getDownloadInstanciaDocxUrl(inst.id)
      const token = useAuthStore.getState().token
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-API-Key': getRuntimeConfig().apiKey || '',
          tenant: 'root',
        },
      })
      if (!res.ok) return
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${inst.titulo || 'documento'}.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch {
      // silent
    }
  }, [])

  const errorMessage = error instanceof Error ? error.message : 'Falha ao carregar documentos gerados.'

  return (
    <>
      <PageHead title='Pedidos de Assinatura' />
      <DashboardPageContainer>
        <h3 className='mb-4 text-lg font-semibold'>Pedidos de Assinatura</h3>

        <div className='mb-3 flex items-center gap-2'>
          <Input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
            placeholder='Procurar...'
            className='w-[250px]'
          />
          <div className='flex-1' />
          <Button variant='outline' size='sm' onClick={() => refetch()}>
            <RefreshCw className='mr-2 h-3.5 w-3.5' />
            Atualizar
          </Button>
        </div>

        {utenteIdFiltro ? (
          <div className='mb-3 text-xs text-muted-foreground'>
            A mostrar pedidos do utente selecionado.
          </div>
        ) : null}
        {instanciaIdFiltro ? (
          <div className='mb-3 text-xs text-muted-foreground'>
            A mostrar a instância selecionada para assinatura.
          </div>
        ) : null}

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className='w-[200px]'>Modelo</TableHead>
                <TableHead className='w-[160px]'>Data</TableHead>
                <TableHead className='w-[120px] text-center'>Estado assinatura</TableHead>
                <TableHead className='w-[90px] text-center'>Assinado</TableHead>
                <TableHead className='w-[220px] text-center'>Opções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center text-muted-foreground'>
                    A carregar...
                  </TableCell>
                </TableRow>
              ) : null}
              {!isLoading && instancias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center text-muted-foreground'>
                    Nenhum documento com pedido de assinatura.
                  </TableCell>
                </TableRow>
              ) : null}
              {paginatedInstancias.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell className='text-sm'>{inst.titulo}</TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {modeloMap.get(inst.modeloDocumentoId) ?? '—'}
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {inst.createdOn ? new Date(inst.createdOn).toLocaleString('pt-PT') : '—'}
                  </TableCell>
                  <TableCell className='text-center text-xs'>
                    {(() => {
                      const pedidoMaisRecente = (pedidosData ?? [])
                        .filter((p) => p.instanciaDocumentoId === inst.id)
                        .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())[0]

                      if (!pedidoMaisRecente) return 'Sem pedido'

                      if (pedidoMaisRecente.estado === EstadoPedidoConsentimento.Pendente) return 'Pendente'
                      if (pedidoMaisRecente.estado === EstadoPedidoConsentimento.Assinado) return 'Assinado'
                      if (pedidoMaisRecente.estado === EstadoPedidoConsentimento.Cancelado) return 'Cancelado'
                      return '—'
                    })()}
                  </TableCell>
                  <TableCell className='text-center text-sm'>
                    {inst.assinado ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        type='button'
                        className='inline-flex h-8 w-8 items-center justify-center rounded text-primary hover:bg-primary/10'
                        onClick={() => handleDownload(inst)}
                        title='Descarregar .docx'
                      >
                        <Download className='h-4 w-4' />
                      </button>
                      {(() => {
                        const pedidoMaisRecente = (pedidosData ?? [])
                          .filter((p: PedidoConsentimentoDTO) => p.instanciaDocumentoId === inst.id)
                          .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())[0]

                        if (pedidoMaisRecente?.estado === EstadoPedidoConsentimento.Pendente) {
                          return (
                            <div className='flex items-center gap-1'>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='h-8 px-2 text-xs'
                              onClick={() => openAssinaturaDialog(pedidoMaisRecente.id)}
                                title='Marcar pedido pendente como assinado'
                              >
                                Assinar
                              </Button>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='h-8 px-2 text-xs'
                                onClick={() => handleCancelarPedido(pedidoMaisRecente.id)}
                                title='Cancelar pedido pendente'
                              >
                                Cancelar
                              </Button>
                            </div>
                          )
                        }

                        if (pedidoMaisRecente?.estado === EstadoPedidoConsentimento.Assinado) {
                          return (
                            <span className='text-xs text-green-700'>Assinado</span>
                          )
                        }

                        if (pedidoMaisRecente?.estado === EstadoPedidoConsentimento.Cancelado) {
                          return (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-8 px-2 text-xs'
                              onClick={() => handleReenviarPedido(inst.id, inst.utenteId)}
                              title='Reenviar pedido de assinatura para esta instância'
                            >
                              Reenviar pedido
                            </Button>
                          )
                        }

                        return (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='h-8 px-2 text-xs'
                            onClick={() => handleCriarPedidoAssinatura(inst.id, inst.utenteId)}
                            title='Criar pedido de assinatura para esta instância'
                          >
                            Pedir assinatura
                          </Button>
                        )
                      })()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className='mt-3 flex items-center justify-between text-sm text-muted-foreground'>
            <span>{instancias.length} documento(s) — Página {page} de {totalPages}</span>
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                className='h-7 px-2 text-xs'
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='h-7 px-2 text-xs'
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Seguinte
              </Button>
            </div>
          </div>
        )}

        <Dialog open={assinaturaDialogOpen} onOpenChange={setAssinaturaDialogOpen}>
          <DialogContent className='max-w-xl'>
            <DialogHeader>
              <DialogTitle>Assinatura do utente</DialogTitle>
            </DialogHeader>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                Rubrique na área abaixo para concluir a assinatura do consentimento.
              </p>
              <canvas
                ref={canvasRef}
                width={720}
                height={220}
                className='w-full rounded border bg-white'
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <DialogFooter>
              <Button type='button' variant='outline' onClick={clearSignature}>
                Limpar
              </Button>
              <Button
                type='button'
                onClick={() => assinaturaPedidoId && handleMarcarAssinado(assinaturaPedidoId)}
              >
                Confirmar assinatura
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardPageContainer>
    </>
  )
}
