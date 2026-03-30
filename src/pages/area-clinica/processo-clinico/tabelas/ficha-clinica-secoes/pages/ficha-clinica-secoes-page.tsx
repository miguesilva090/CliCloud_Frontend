import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { FichaClinicaSecoesService } from '@/lib/services/processo-clinico/ficha-clinica-secoes-service'
import type {
  FichaClinicaSecaoTemplateDTO,
  FichaClinicaSecaoCampoDTO,
  CreateFichaClinicaSecaoCampoRequest,
  UpdateFichaClinicaSecaoCampoRequest,
} from '@/types/dtos/processo-clinico/ficha-clinica-secoes.dtos'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/utils/toast-utils'
import { getCurrentWindowId } from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'

interface TemplateFormState {
  id?: string
  codigo: string
  nome: string
  descricao?: string
  ordem: number
  ativo: boolean
}

interface CampoFormState {
  id?: string
  nome: string
  tipoCampo: string
  numeroLinhas: number
  ordem: number
  ativo: boolean
}

export function FichaClinicaSecoesPage() {
  const queryClient = useQueryClient()
  const updateWindowState = useWindowsStore((s) => s.updateWindowState)
  const [keyword, setKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [camposDialogOpen, setCamposDialogOpen] = useState(false)
  const [campoDialogOpen, setCampoDialogOpen] = useState(false)
  const [templateSelecionado, setTemplateSelecionado] = useState<FichaClinicaSecaoTemplateDTO | null>(
    null,
  )
  const [formState, setFormState] = useState<TemplateFormState>({
    codigo: '',
    nome: '',
    descricao: '',
    ordem: 1,
    ativo: true,
  })
  const [campoFormState, setCampoFormState] = useState<CampoFormState>({
    nome: '',
    tipoCampo: 'Texto',
    numeroLinhas: 3,
    ordem: 1,
    ativo: true,
  })

  useEffect(() => {
    const windowId = getCurrentWindowId()
    if (windowId) {
      updateWindowState(windowId, { title: 'Separadores Personalizados' })
    }
  }, [updateWindowState])

  const { data, isLoading } = useQuery({
    queryKey: ['ficha-clinica-secao-templates', keyword],
    queryFn: async () => {
      const client = FichaClinicaSecoesService()
      const res = await client.getTemplates(keyword)
      const api = res as unknown as { info?: { data?: FichaClinicaSecaoTemplateDTO[] } }
      return (api.info?.data ?? []) as FichaClinicaSecaoTemplateDTO[]
    },
    staleTime: 60_000,
  })

  const templates = useMemo(() => {
    const base = (data ?? []) as FichaClinicaSecaoTemplateDTO[]
    return base.slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
  }, [data])

  const defaultCodigoSuggestions = useMemo(
    () => ['MEDICINA_DESPORTIVA', 'NUTRICAO', 'PSICOLOGIA', 'FISIOTERAPEUTA', 'FISIOLOGIA_BIOMECANICA', 'TERAPIA_FALA'],
    [],
  )

  const codigosExistentes = useMemo(
    () => {
      const all = [...defaultCodigoSuggestions, ...templates.map((t) => t.codigo)]
      return Array.from(new Set(all))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
    },
    [templates, defaultCodigoSuggestions],
  )

  const generateCodigoFromNome = (nome: string): string => {
    if (!nome) return ''

    // Remover acentos
    const withoutDiacritics = nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    // Substituir tudo o que não for letra ou número por underscore
    const base = withoutDiacritics.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()

    // Evitar underscores duplicados e trims
    return base.replace(/_+/g, '_').replace(/^_+|_+$/g, '')
  }

  const resetForm = () => {
    setFormState({
      id: undefined,
      codigo: '',
      nome: '',
      descricao: '',
      ordem: templates.length + 1,
      ativo: true,
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (template: FichaClinicaSecaoTemplateDTO) => {
    setFormState({
      id: template.id,
      codigo: template.codigo,
      nome: template.nome,
      descricao: template.descricao ?? '',
      ordem: template.ordem,
      ativo: template.ativo,
    })
    setDialogOpen(true)
  }

  const {
    data: camposData,
    isLoading: isLoadingCampos,
    refetch: refetchCampos,
  } = useQuery({
    queryKey: ['ficha-clinica-secao-campos', templateSelecionado?.id],
    enabled: !!templateSelecionado && camposDialogOpen,
    queryFn: async () => {
      if (!templateSelecionado) return []
      const client = FichaClinicaSecoesService()
      const res = await client.getCamposBySeparador(templateSelecionado.id, '')
      const api = res as unknown as { info?: { data?: FichaClinicaSecaoCampoDTO[] } }
      return (api.info?.data ?? []) as FichaClinicaSecaoCampoDTO[]
    },
    staleTime: 60_000,
  })

  const camposOrdenados: FichaClinicaSecaoCampoDTO[] = useMemo(() => {
    const base = (camposData ?? []) as FichaClinicaSecaoCampoDTO[]
    return base.slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
  }, [camposData])

  const resetCampoForm = (ordem = 1) => {
    setCampoFormState({
      id: undefined,
      nome: '',
      tipoCampo: 'Texto',
      numeroLinhas: 3,
      ordem,
      ativo: true,
    })
  }

  const openCamposDialog = (template: FichaClinicaSecaoTemplateDTO) => {
    setTemplateSelecionado(template)
    resetCampoForm(camposOrdenados.length + 1)
    setCamposDialogOpen(true)
  }

  const openEditCampoDialog = (campo: FichaClinicaSecaoCampoDTO) => {
    setCampoFormState({
      id: campo.id,
      nome: campo.nome,
      tipoCampo: campo.tipoCampo,
      numeroLinhas: campo.numeroLinhas,
      ordem: campo.ordem,
      ativo: campo.ativo,
    })
    setCampoDialogOpen(true)
  }

  const handleNomeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const nome = e.target.value
    setFormState((prev) => {
      const next: TemplateFormState = { ...prev, nome }

      // Ao criar novo registo, se o código ainda estiver vazio, gerar automaticamente a partir do nome
      if (!prev.id && !prev.codigo) {
        next.codigo = generateCodigoFromNome(nome)
      }

      return next
    })
  }

  const saveMutation = useMutation({
    mutationFn: async (input: TemplateFormState) => {
      const client = FichaClinicaSecoesService()
      if (input.id) {
        return client.updateTemplate(input.id, {
          nome: input.nome,
          descricao: input.descricao ?? '',
          ordem: input.ordem,
          ativo: input.ativo,
        })
      }
      return client.createTemplate({
        codigo: input.codigo,
        nome: input.nome,
        descricao: input.descricao ?? '',
        ordem: input.ordem,
        ativo: input.ativo,
      })
    },
    onSuccess: async () => {
      toast.success('Template de secção de ficha clínica guardado com sucesso.')
      setDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['ficha-clinica-secao-templates'] })
    },
    onError: (error: unknown) => {
      console.error('Erro ao guardar template de secção:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao guardar o template de secção.'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const client = FichaClinicaSecoesService()
      if (ids.length === 1) {
        return client.deleteTemplate(ids[0])
      }
      return client.deleteMultipleTemplates(ids)
    },
    onSuccess: async () => {
      toast.success('Template(s) eliminado(s) com sucesso.')
      setSelectedIds(new Set())
      await queryClient.invalidateQueries({ queryKey: ['ficha-clinica-secao-templates'] })
    },
    onError: (error: unknown) => {
      console.error('Erro ao eliminar templates de secção:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao eliminar os templates selecionados.'
      toast.error(message)
    },
  })

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const handleSave = () => {
    let { codigo, nome, descricao, ordem, ativo, id } = formState

    // Se o utilizador só preencheu o Nome, gerar Código automaticamente
    if (!codigo.trim() && nome.trim()) {
      codigo = generateCodigoFromNome(nome)
    }

    if (!nome.trim() || !codigo.trim()) {
      toast.error('Código e Nome são obrigatórios.')
      return
    }

    const payload: TemplateFormState = {
      id,
      codigo: codigo.trim(),
      nome: nome.trim(),
      descricao: descricao?.trim() ?? '',
      ordem,
      ativo,
    }

    saveMutation.mutate(payload)
  }

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return
    deleteMutation.mutate(Array.from(selectedIds))
  }

  const saveCampoMutation = useMutation({
    mutationFn: async (input: { templateId: string; data: CampoFormState }) => {
      const client = FichaClinicaSecoesService()
      const { templateId, data } = input

      const bodyBase: Omit<
        CreateFichaClinicaSecaoCampoRequest,
        'separadorId'
      > & { separadorId?: string } = {
        separadorId: templateId,
        nome: data.nome.trim(),
        tipoCampo: data.tipoCampo,
        numeroLinhas: data.numeroLinhas,
        ordem: data.ordem,
        ativo: data.ativo,
      }

      if (data.id) {
        const updateBody: UpdateFichaClinicaSecaoCampoRequest = {
          id: data.id,
          nome: bodyBase.nome,
          tipoCampo: bodyBase.tipoCampo,
          numeroLinhas: bodyBase.numeroLinhas,
          ordem: bodyBase.ordem,
          ativo: bodyBase.ativo,
        }
        return client.updateCampo(data.id, updateBody)
      }

      const createBody: CreateFichaClinicaSecaoCampoRequest = {
        separadorId: templateId,
        nome: bodyBase.nome,
        tipoCampo: bodyBase.tipoCampo,
        numeroLinhas: bodyBase.numeroLinhas,
        ordem: bodyBase.ordem,
        ativo: bodyBase.ativo,
      }
      return client.createCampo(createBody)
    },
    onSuccess: async () => {
      toast.success('Campo guardado com sucesso.')
      setCampoDialogOpen(false)
      await refetchCampos()
    },
    onError: (error: unknown) => {
      console.error('Erro ao guardar campo:', error)
      const message = error instanceof Error ? error.message : 'Falha ao guardar o campo.'
      toast.error(message)
    },
  })

  const deleteCampoMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = FichaClinicaSecoesService()
      return client.deleteCampo(id)
    },
    onSuccess: async () => {
      toast.success('Campo eliminado com sucesso.')
      await refetchCampos()
    },
    onError: (error: unknown) => {
      console.error('Erro ao eliminar campo:', error)
      const message = error instanceof Error ? error.message : 'Falha ao eliminar o campo.'
      toast.error(message)
    },
  })

  const handleOpenNovoCampo = () => {
    resetCampoForm(camposOrdenados.length + 1)
    setCampoDialogOpen(true)
  }

  const handleSaveCampo = () => {
    if (!templateSelecionado) {
      toast.error('Nenhum separador selecionado.')
      return
    }

    const { nome, tipoCampo, ordem } = campoFormState
    if (!nome.trim()) {
      toast.error('O título do campo é obrigatório.')
      return
    }
    if (!tipoCampo) {
      toast.error('O tipo de campo é obrigatório.')
      return
    }
    if (!Number.isFinite(ordem) || ordem < 1) {
      toast.error('A ordem deve ser pelo menos 1.')
      return
    }

    const numeroLinhas = tipoCampo === 'TextoMultilinha' ? 10 : 3

    const dataToSave: CampoFormState = {
      ...campoFormState,
      numeroLinhas,
    }

    saveCampoMutation.mutate({ templateId: templateSelecionado.id, data: dataToSave })
  }

  const toggleTemplateAtivoMutation = useMutation({
    mutationFn: async (tpl: FichaClinicaSecaoTemplateDTO) => {
      const client = FichaClinicaSecoesService()
      return client.updateTemplate(tpl.id, {
        nome: tpl.nome,
        descricao: tpl.descricao ?? '',
        ordem: tpl.ordem,
        ativo: tpl.ativo,
      })
    },
    onSuccess: async (_, tpl) => {
      toast.success(tpl.ativo ? 'Separador ativado.' : 'Separador desativado.')
      setTemplateSelecionado(tpl)
      await queryClient.invalidateQueries({ queryKey: ['ficha-clinica-secao-templates'] })
    },
    onError: (error: unknown) => {
      console.error('Erro ao alterar estado do separador:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao alterar o estado do separador.'
      toast.error(message)
    },
  })

  const handleToggleTemplateAtivo = () => {
    if (!templateSelecionado) return
    const novo = { ...templateSelecionado, ativo: !templateSelecionado.ativo }
    toggleTemplateAtivoMutation.mutate(novo)
  }

  return (
    <>
      <PageHead title='Separadores Personalizados | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
            <h1 className='text-lg font-semibold'>Separadores Personalizados</h1>
            <div className='flex items-center gap-2'>
              <Input
                placeholder='Procurar por código ou nome...'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className='h-8 w-[220px]'
              />
              <Button size='sm' onClick={openCreateDialog}>
                Novo template
              </Button>
              <Button size='sm' variant='destructive' onClick={handleDeleteSelected}>
                Eliminar selecionados
              </Button>
            </div>
          </div>

          <div className='rounded-b-lg border border-t-0 bg-card'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[40px]'></TableHead>
                  <TableHead className='w-[80px] text-center'>Ordem</TableHead>
                  <TableHead className='text-left'>Código</TableHead>
                  <TableHead className='text-left'>Nome</TableHead>
                  <TableHead className='text-left'>Descrição</TableHead>
                  <TableHead className='w-[160px] text-center'>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-6 text-center text-muted-foreground'>
                      A carregar templates...
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-6 text-center text-muted-foreground'>
                      Nenhum template encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(t.id)}
                          onCheckedChange={(checked) =>
                            toggleSelected(t.id, Boolean(checked))
                          }
                        />
                      </TableCell>
                      <TableCell className='text-center'>{t.ordem}</TableCell>
                      <TableCell className='font-mono text-xs text-left'>{t.codigo}</TableCell>
                      <TableCell className='text-left'>{t.nome}</TableCell>
                      <TableCell className='text-xs text-muted-foreground text-left'>
                        {t.descricao ?? ''}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='w-24 justify-center'
                          onClick={() => openEditDialog(t)}
                        >
                          Editar
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                            className='w-24 justify-center'
                          onClick={() => openCamposDialog(t)}
                        >
                          Formulário
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DashboardPageContainer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formState.id ? 'Editar template de separador' : 'Novo template de separador'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            {!formState.id && (
              <div className='space-y-2'>
                <div className='space-y-1'>
                  <label className='block text-xs font-medium text-muted-foreground'>Código</label>
                  <Input
                    value={formState.codigo}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, codigo: e.target.value }))
                    }
                    placeholder='Ex.: MEDICINA_DESPORTIVA, NUTRICAO, PSICOLOGIA'
                  />
                </div>
                {codigosExistentes.length > 0 && (
                  <div className='space-y-1'>
                    <label className='block text-xs font-medium text-muted-foreground'>
                      Códigos existentes
                    </label>
                    <Select
                      onValueChange={(value) =>
                        setFormState((prev) => ({
                          ...prev,
                          codigo: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Escolha um código para reutilizar (opcional)' />
                      </SelectTrigger>
                      <SelectContent>
                        {codigosExistentes.map((codigo) => (
                          <SelectItem key={codigo} value={codigo}>
                            {codigo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            <div className='space-y-1'>
              <label className='block text-xs font-medium text-muted-foreground'>Nome</label>
              <Input value={formState.nome} onChange={handleNomeChange} />
            </div>
            <div className='space-y-1'>
              <label className='block text-xs font-medium text-muted-foreground'>Descrição</label>
              <Input
                value={formState.descricao ?? ''}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, descricao: e.target.value }))
                }
              />
            </div>
            <div className='space-y-1'>
              <label className='block text-xs font-medium text-muted-foreground'>Ordem</label>
              <Input
                type='number'
                min={1}
                value={formState.ordem}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    ordem: Number(e.target.value) || 1,
                  }))
                }
                className='w-24'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' type='button' onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type='button' onClick={handleSave}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulário / Campos do separador */}
      <Dialog open={camposDialogOpen} onOpenChange={setCamposDialogOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>
              Formulário personalizado
            </DialogTitle>
          </DialogHeader>
          <div className='mb-3 flex items-center justify-between gap-4'>
            <div className='space-y-1'>
              <div className='text-xs font-medium text-muted-foreground'>Nome do formulário:</div>
              <div className='text-sm font-semibold'>
                {templateSelecionado?.nome ?? 'Selecione um separador'}
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-muted-foreground'>Ativo?</span>
              <button
                type='button'
                onClick={handleToggleTemplateAtivo}
                disabled={!templateSelecionado || toggleTemplateAtivoMutation.isPending}
                className='flex items-center gap-2 rounded-full border px-2 py-1 text-xs hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70'
              >
                <span
                  className={
                    templateSelecionado?.ativo
                      ? 'inline-flex h-2 w-2 rounded-full bg-emerald-500'
                      : 'inline-flex h-2 w-2 rounded-full bg-slate-400'
                  }
                />
                <span>{templateSelecionado?.ativo ? 'Ativo' : 'Inativo'}</span>
              </button>
            </div>
          </div>

          <div className='flex items-center justify-between mb-2'>
            <div className='text-xs font-medium text-muted-foreground'>
              Campos do formulário
            </div>
            <Button size='sm' onClick={handleOpenNovoCampo} disabled={!templateSelecionado}>
              + Inserir
            </Button>
          </div>

          <div className='max-h-[320px] overflow-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[40px] text-center'>#</TableHead>
                  <TableHead className='text-left'>Título</TableHead>
                  <TableHead className='text-left'>Tipo de campo</TableHead>
                  <TableHead className='w-[80px] text-center'>Ativo?</TableHead>
                  <TableHead className='w-[130px] text-center'>Opções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCampos ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-4 text-center text-muted-foreground'>
                      A carregar campos...
                    </TableCell>
                  </TableRow>
                ) : camposOrdenados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-4 text-center text-muted-foreground'>
                      Não existem dados a apresentar.
                    </TableCell>
                  </TableRow>
                ) : (
                  camposOrdenados.map((c, index) => (
                    <TableRow key={c.id}>
                      <TableCell className='text-center'>{c.ordem ?? index + 1}</TableCell>
                      <TableCell className='text-left'>{c.nome}</TableCell>
                      <TableCell className='text-left'>
                        {c.tipoCampo === 'TextoMultilinha' ? 'Texto longo' : 'Texto curto'}
                      </TableCell>
                      <TableCell className='text-center'>{c.ativo ? 'Sim' : 'Não'}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='w-24 justify-center'
                            onClick={() => openEditCampoDialog(c)}
                          >
                            Editar
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            className='w-24 justify-center'
                            onClick={() => deleteCampoMutation.mutate(c.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant='outline' type='button' onClick={() => setCamposDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campo personalizado */}
      <Dialog open={campoDialogOpen} onOpenChange={setCampoDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {campoFormState.id ? 'Editar campo personalizado' : 'Novo campo personalizado'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-3'>
            <div className='space-y-1'>
              <label className='block text-xs font-medium text-muted-foreground'>Título</label>
              <Input
                value={campoFormState.nome}
                onChange={(e) =>
                  setCampoFormState((prev) => ({ ...prev, nome: e.target.value }))
                }
                placeholder='Ex.: História Clínica Atual'
              />
            </div>

            <div className='grid grid-cols-1 gap-3'>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>
                  Tipo de campo
                </label>
                <Select
                  value={campoFormState.tipoCampo}
                  onValueChange={(value) =>
                    setCampoFormState((prev) => ({ ...prev, tipoCampo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione o tipo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Texto'>Texto curto</SelectItem>
                    <SelectItem value='TextoMultilinha'>Texto longo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3'>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Ordem</label>
                <Input
                  type='number'
                  min={1}
                  value={campoFormState.ordem}
                  onChange={(e) =>
                    setCampoFormState((prev) => ({
                      ...prev,
                      ordem: Number(e.target.value) || 1,
                    }))
                  }
                  className='w-24'
                />
              </div>
              <div className='flex items-center gap-2 pt-6'>
                <span className='text-xs text-muted-foreground'>Ativo?</span>
                <Switch
                  checked={campoFormState.ativo}
                  onCheckedChange={(checked) =>
                    setCampoFormState((prev) => ({ ...prev, ativo: Boolean(checked) }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              type='button'
              onClick={() => setCampoDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type='button' onClick={handleSaveCampo}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

