import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RotateCw } from 'lucide-react'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import type { DataTableAction } from '@/components/shared/data-table'
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
import { ListagemDocumentosModeloFilterControls } from '@/pages/area-comum/tabelas/configuracao/documentos/components/listagem-documentos-modelo-filter-controls'
import { ListagemDocumentosModeloTable } from '@/pages/area-comum/tabelas/configuracao/documentos/components/listagem-documentos-modelo-table'

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

  const [filters, setFilters] = useState<Array<{ id: string; value: string }>>([])
  const [sorting, setSorting] = useState<Array<{ id: string; desc: boolean }>>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ModeloDocumentoDTO | null>(null)
  const [gerarTarget, setGerarTarget] = useState<ModeloDocumentoDTO | null>(null)
  const [gerarUtenteId, setGerarUtenteId] = useState('')
  const [gerarTitulo, setGerarTitulo] = useState('')
  const [utenteSearch, setUtenteSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  const keyword =
    (filters.find((f) => f.id === 'nome')?.value as string | undefined) ?? ''

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
    [modelos, page, pageSize]
  )

  const handleFiltersChange = (
    next: Array<{ id: string; value: string }>
  ) => {
    setFilters(next)
    setPage(1)
  }

  const handlePaginationChange = (p: number, ps: number) => {
    setPage(p)
    setPageSize(ps)
  }

  const handleSortingChange = (
    next: Array<{ id: string; desc: boolean }>
  ) => {
    setSorting(next)
  }

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

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Adicionar',
      icon: <Plus className='h-4 w-4' />,
      onClick: openCreate,
      variant: 'destructive',
      className:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        void queryClient.invalidateQueries({
          queryKey: ['motor-documental-modelos'],
        })
      },
      variant: 'outline',
    },
  ]

  const errorMessage = error instanceof Error ? error.message : 'Falha ao carregar modelos.'

  return (
    <>
      <PageHead title='Documentos Modelo' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Documentos Modelo'>
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <ListagemDocumentosModeloTable
            data={paginatedModelos}
            isLoading={isLoading}
            pageCount={totalPages}
            totalRows={modelos.length}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            toolbarActions={toolbarActions}
            globalSearchPlaceholder='Procurar por nome...'
            FilterControls={ListagemDocumentosModeloFilterControls}
            onEdit={openEditor}
            onGerar={openGerar}
            onDelete={(row) => setDeleteTarget(row)}
          />
        </AreaComumListagemPageShell>
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
              disabled={gerarMutation.isPending}
            >
              {gerarMutation.isPending ? 'A gerar...' : 'Gerar'}
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
