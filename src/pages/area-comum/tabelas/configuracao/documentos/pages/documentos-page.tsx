import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConsentimentoService } from '@/lib/services/documentos/consentimento-service'
import { MotorDocumentalService } from '@/lib/services/documentos/motor-documental-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import { ResponseStatus } from '@/types/api/responses'
import type {
  CriarModeloDocumentoRequest,
  GerarInstanciaDocumentoRequest,
  ModeloDocumentoDTO,
} from '@/types/dtos/documentos/motor-documental.dtos'
import { toast } from '@/utils/toast-utils'
import { openPathInApp } from '@/utils/window-utils'

interface CreateFormState {
  codigo: string
  nome: string
}

function getApiMessage(messages?: Record<string, string[]>): string | undefined {
  if (!messages) return undefined
  const first = Object.values(messages).find((x) => x?.length)?.[0]
  return first
}

export function DocumentosPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)

  const [keyword, setKeyword] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ModeloDocumentoDTO | null>(null)
  const [gerarTarget, setGerarTarget] = useState<ModeloDocumentoDTO | null>(null)
  const [gerarUtenteId, setGerarUtenteId] = useState('')
  const [gerarTitulo, setGerarTitulo] = useState('')
  const [utenteSearch, setUtenteSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  const [createForm, setCreateForm] = useState<CreateFormState>({
    codigo: '',
    nome: '',
  })

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['motor-documental-modelos', keyword],
    queryFn: async () => {
      const res = await MotorDocumentalService().getModelos(keyword)
      return res.info.data ?? []
    },
  })

  const modelos = useMemo(() => data ?? [], [data])
  const totalPages = Math.max(1, Math.ceil(modelos.length / pageSize))
  const paginatedModelos = useMemo(
    () => modelos.slice((page - 1) * pageSize, page * pageSize),
    [modelos, page]
  )


  const createMutation = useMutation({
    mutationFn: async () => {
      if (!createForm.codigo.trim()) throw new Error('Código é obrigatório.')
      if (!createForm.nome.trim()) throw new Error('Nome é obrigatório.')

      const body: CriarModeloDocumentoRequest = {
        codigo: createForm.codigo.trim(),
        nome: createForm.nome.trim(),
        tipo: 1,
        conteudoHtml: '<p></p>',
      }
      return MotorDocumentalService().createModelo(body)
    },
    onSuccess: async (response) => {
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Modelo criado com sucesso.')
        setCreateDialogOpen(false)
        await queryClient.invalidateQueries({ queryKey: ['motor-documental-modelos'] })

        const newId = response.info.data
        if (newId) {
          openPathInApp(
            navigate,
            addWindow,
            `/area-comum/tabelas/configuracao/documentos/editor/${newId}`,
            `Editor - ${createForm.nome.trim()}`
          )
        }
        return
      }
      toast.error(getApiMessage(response.info.messages) ?? 'Não foi possível criar o modelo.')
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao criar o modelo.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => MotorDocumentalService().deleteModelo(id),
    onSuccess: async (response) => {
      if (response.info.status === ResponseStatus.Success) {
        toast.success('Modelo eliminado com sucesso.')
        setDeleteTarget(null)
        await queryClient.invalidateQueries({ queryKey: ['motor-documental-modelos'] })
        return
      }
      toast.error(getApiMessage(response.info.messages) ?? 'Não foi possível eliminar o modelo.')
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao eliminar o modelo.')
    },
  })

  const { data: utentesData, isLoading: utentesLoading } = useQuery({
    queryKey: ['utentes-light', utenteSearch],
    queryFn: async () => {
      const res = await UtentesService('').getUtentesLight(utenteSearch || undefined)
      return res.info.data ?? []
    },
    enabled: !!gerarTarget,
  })

  const utenteItems = useMemo(
    () =>
      (utentesData ?? []).map((u) => ({
        value: u.id,
        label: u.nome,
        secondary: u.numeroUtente ?? u.numeroContribuinte ?? undefined,
      })),
    [utentesData]
  )

  const gerarMutation = useMutation({
    mutationFn: async () => {
      if (!gerarTarget) throw new Error('Nenhum modelo selecionado.')
      const body: GerarInstanciaDocumentoRequest = {
        modeloDocumentoId: gerarTarget.id,
        utenteId: gerarUtenteId || undefined,
        titulo: gerarTitulo.trim() || undefined,
      }
      return MotorDocumentalService().gerarInstancia(body)
    },
    onSuccess: async (response) => {
      if (response.info.status === ResponseStatus.Success && response.info.data) {
        toast.success('Documento gerado com sucesso.')
        setGerarTarget(null)
        await queryClient.invalidateQueries({ queryKey: ['motor-documental-instancias'] })
        return
      }
      toast.error(getApiMessage(response.info.messages) ?? 'Não foi possível gerar o documento.')
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao gerar o documento.')
    },
  })

  const gerarComAssinaturaMutation = useMutation({
    mutationFn: async () => {
      if (!gerarTarget) throw new Error('Nenhum modelo selecionado.')
      if (!gerarUtenteId) throw new Error('Selecione um utente para criar pedido de assinatura.')

      const body: GerarInstanciaDocumentoRequest = {
        modeloDocumentoId: gerarTarget.id,
        utenteId: gerarUtenteId || undefined,
        titulo: gerarTitulo.trim() || undefined,
      }

      const gerarResponse = await MotorDocumentalService().gerarInstancia(body)
      if (
        gerarResponse.info.status !== ResponseStatus.Success
        || !gerarResponse.info.data
      ) {
        throw new Error(getApiMessage(gerarResponse.info.messages) ?? 'Não foi possível gerar o documento.')
      }

      const instancia = gerarResponse.info.data
      const pedidoResponse = await ConsentimentoService().criarPedido({
        instanciaDocumentoId: instancia.id,
        utenteId: gerarUtenteId,
        tipoConsentimento: 'ASSINATURA_DOCUMENTO',
        canal: 'presencial',
      })

      if (pedidoResponse.info.status !== ResponseStatus.Success) {
        throw new Error(getApiMessage(pedidoResponse.info.messages) ?? 'Documento gerado, mas não foi possível criar pedido de assinatura.')
      }

      return instancia
    },
    onSuccess: async (instancia) => {
      toast.success('Documento gerado e pedido de assinatura criado com sucesso.')
      setGerarTarget(null)
      await queryClient.invalidateQueries({ queryKey: ['motor-documental-instancias'] })
      openPathInApp(
        navigate,
        addWindow,
        `/area-comum/posto-assinaturas?utenteId=${encodeURIComponent(gerarUtenteId)}&instanciaId=${encodeURIComponent(instancia.id)}`,
        'Posto de Assinaturas'
      )
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Falha ao gerar documento com pedido de assinatura.')
    },
  })

  const openGerar = (item: ModeloDocumentoDTO) => {
    setGerarUtenteId('')
    setGerarTitulo('')
    setUtenteSearch('')
    setGerarTarget(item)
  }

  const openCreate = () => {
    setCreateForm({ codigo: '', nome: '' })
    setCreateDialogOpen(true)
  }

  const openEditor = (item: ModeloDocumentoDTO) => {
    openPathInApp(
      navigate,
      addWindow,
      `/area-comum/tabelas/configuracao/documentos/editor/${item.id}`,
      `Editor - ${item.nome}`
    )
  }

  const errorMessage = error instanceof Error ? error.message : 'Falha ao carregar modelos.'

  return (
    <>
      <PageHead title='Documentos Modelo' />
      <DashboardPageContainer>
        {/* Page title bar - like legacy "Documentos Modelo" header */}
        <h3 className='mb-4 text-lg font-semibold'>Documentos Modelo</h3>

        {/* Toolbar with search and actions - like legacy filter bar */}
        <div className='mb-3 flex items-center gap-2'>
          <Input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
            placeholder='Procurar...'
            className='w-[250px]'
          />
          <div className='flex-1' />
          <Button size='sm' onClick={openCreate}>
            <Plus className='mr-2 h-3.5 w-3.5' />
            Novo
          </Button>
        </div>

        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {/* Table matching legacy columns: Código, Descrição, Opções */}
        <div className='rounded-md border bg-white/90 backdrop-blur-sm'>
          <Table className='table-fixed'>
            <colgroup>
              <col className='w-[220px]' />
              <col />
              <col className='w-[130px]' />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Código</TableHead>
                <TableHead className='text-center'>Nome</TableHead>
                <TableHead className='w-[130px] text-center'>Opções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center text-muted-foreground'>
                    A carregar...
                  </TableCell>
                </TableRow>
              ) : null}
              {!isLoading && modelos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className='text-center text-muted-foreground'>
                    Sem modelos documentais.
                  </TableCell>
                </TableRow>
              ) : null}
              {paginatedModelos.map((item) => (
                <TableRow key={item.id} className='hover:bg-muted/50'>
                  <TableCell className='font-mono text-sm text-center truncate' title={item.codigo}>
                    {item.codigo}
                  </TableCell>
                  <TableCell className='text-center truncate' title={item.nome}>
                    {item.nome}
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <button
                        type='button'
                        className='inline-flex h-8 w-8 items-center justify-center rounded text-primary hover:bg-primary/10'
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditor(item)
                        }}
                        title='Editar'
                      >
                        <Pencil className='h-4 w-4' />
                      </button>
                      <button
                        type='button'
                        className='inline-flex h-8 w-8 items-center justify-center rounded text-green-600 hover:bg-green-600/10'
                        onClick={(e) => {
                          e.stopPropagation()
                          openGerar(item)
                        }}
                        title='Gerar Documento'
                      >
                        <FileText className='h-4 w-4' />
                      </button>
                      <button
                        type='button'
                        className='inline-flex h-8 w-8 items-center justify-center rounded text-destructive hover:bg-destructive/10'
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(item)
                        }}
                        title='Eliminar'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className='mt-3 flex items-center justify-between text-sm text-muted-foreground'>
            <span>{modelos.length} modelo(s) — Página {page} de {totalPages}</span>
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

      </DashboardPageContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Eliminar Modelo</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende eliminar o modelo &quot;{deleteTarget?.nome}&quot;? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Instance Dialog */}
      <Dialog open={!!gerarTarget} onOpenChange={(open) => { if (!open) setGerarTarget(null) }}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Gerar Documento</DialogTitle>
            <DialogDescription>
              Gerar uma instância do modelo &quot;{gerarTarget?.nome}&quot; com os campos preenchidos automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-2'>
            <div className='grid gap-2'>
              <Label>Título (opcional)</Label>
              <Input
                value={gerarTitulo}
                onChange={(e) => setGerarTitulo(e.target.value)}
                placeholder={`${gerarTarget?.nome ?? 'Documento'} - ${new Date().toLocaleDateString('pt-PT')}`}
              />
            </div>
            <div className='grid gap-2'>
              <Label>Utente (opcional)</Label>
              <AsyncCombobox
                value={gerarUtenteId}
                onChange={setGerarUtenteId}
                items={utenteItems}
                isLoading={utentesLoading}
                placeholder='Selecionar utente...'
                searchPlaceholder='Procurar utente...'
                emptyText='Nenhum utente encontrado.'
                searchValue={utenteSearch}
                onSearchValueChange={setUtenteSearch}
              />
              <p className='text-xs text-muted-foreground'>
                Se selecionado, os campos «UtenteNome», «UtenteContribuinte», etc. serão preenchidos automaticamente.
              </p>
            </div>
          </div>

          <DialogFooter className='flex flex-wrap gap-2 sm:justify-end'>
            <Button variant='outline' className='h-8' onClick={() => setGerarTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant='outline'
              className='h-8'
              onClick={() => gerarMutation.mutate()}
              disabled={gerarMutation.isPending || gerarComAssinaturaMutation.isPending}
            >
              {gerarMutation.isPending ? 'A gerar...' : 'Gerar sem assinatura'}
            </Button>
            <Button
              className='h-8'
              onClick={() => gerarComAssinaturaMutation.mutate()}
              disabled={gerarMutation.isPending || gerarComAssinaturaMutation.isPending}
            >
              {gerarComAssinaturaMutation.isPending ? 'A criar pedido...' : 'Gerar e pedir assinatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Model Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Novo Modelo</DialogTitle>
            <DialogDescription className='sr-only'>
              Criar um novo modelo documental.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-2'>
            <div className='grid gap-2'>
              <Label>Código</Label>
              <Input
                value={createForm.codigo}
                onChange={(e) => setCreateForm((p) => ({ ...p, codigo: e.target.value }))}
                placeholder='Ex: 1'
                maxLength={10}
              />
            </div>
            <div className='grid gap-2'>
              <Label>Descrição</Label>
              <Input
                value={createForm.nome}
                onChange={(e) => setCreateForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder='Ex: Consentimento Informado'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              Criar e Abrir Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
