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
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

interface TemplateFormState {
  id?: string
  codigo: string
  nome: string
  descricao?: string
  ordem: number
  ativo: boolean
}

interface CampoFormState {
  tempId?: string
  id?: string
  nome: string
  tipoCampo: string
  numeroLinhas: number
  ordem: number
  ativo: boolean
}

const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const tryExtractGuid = (response: unknown): string | null => {
  const root = response as
    | { info?: { data?: unknown; Data?: unknown } }
    | undefined
  const info = root?.info as
    | { data?: unknown; Data?: unknown }
    | undefined

  const candidates: unknown[] = [
    info?.data,
    info?.Data,
    (info?.data as { data?: unknown } | undefined)?.data,
    (info?.data as { Data?: unknown } | undefined)?.Data,
    (info?.Data as { data?: unknown } | undefined)?.data,
    (info?.Data as { Data?: unknown } | undefined)?.Data,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && GUID_REGEX.test(candidate.trim())) {
      return candidate.trim()
    }
  }

  return null
}

export function FichaClinicaSecoesPage() {
  const queryClient = useQueryClient()
  const updateWindowState = useWindowsStore((s) => s.updateWindowState)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [camposDialogOpen, setCamposDialogOpen] = useState(false)
  const [campoDialogOpen, setCampoDialogOpen] = useState(false)
  const [pendingCampos, setPendingCampos] = useState<CampoFormState[]>([])
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
      updateWindowState(windowId, { title: 'Formulários Personalizados' })
    }
  }, [updateWindowState])

  const { data, isLoading } = useQuery({
    queryKey: ['ficha-clinica-secao-templates'],
    queryFn: async () => {
      const client = FichaClinicaSecoesService()
      const res = await client.getTemplates('')
      const api = res as unknown as { info?: { data?: FichaClinicaSecaoTemplateDTO[] } }
      return (api.info?.data ?? []) as FichaClinicaSecaoTemplateDTO[]
    },
    staleTime: 60_000,
  })

  const templates = useMemo(() => {
    const base = (data ?? []) as FichaClinicaSecaoTemplateDTO[]
    return base.slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
  }, [data])

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
    setDialogMode('create')
    resetForm()
    setTemplateSelecionado(null)
    setPendingCampos([])
    setCamposDialogOpen(true)
    setDialogOpen(true)
  }

  const openEditDialog = (template: FichaClinicaSecaoTemplateDTO) => {
    setDialogMode('edit')
    setFormState({
      id: template.id,
      codigo: template.codigo,
      nome: template.nome,
      descricao: template.descricao ?? '',
      ordem: template.ordem,
      ativo: template.ativo,
    })
    setTemplateSelecionado(template)
    setPendingCampos([])
    setCamposDialogOpen(true)
    setDialogOpen(true)
  }

  const openViewDialog = (template: FichaClinicaSecaoTemplateDTO) => {
    setDialogMode('view')
    setFormState({
      id: template.id,
      codigo: template.codigo,
      nome: template.nome,
      descricao: template.descricao ?? '',
      ordem: template.ordem,
      ativo: template.ativo,
    })
    setTemplateSelecionado(template)
    setPendingCampos([])
    setCamposDialogOpen(true)
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
      tempId: undefined,
      id: undefined,
      nome: '',
      tipoCampo: 'Texto',
      numeroLinhas: 3,
      ordem,
      ativo: true,
    })
  }

  const openEditCampoDialog = (campo: CampoFormState) => {
    setCampoFormState({
      tempId: campo.tempId,
      id: campo.id,
      nome: campo.nome,
      tipoCampo: campo.tipoCampo,
      numeroLinhas: campo.numeroLinhas,
      ordem: campo.ordem,
      ativo: campo.ativo,
    })
    setCampoDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async (input: TemplateFormState) => {
      const client = FichaClinicaSecoesService()
      return client.updateTemplate(input.id!, {
        nome: input.nome,
        descricao: input.descricao ?? '',
        ordem: input.ordem,
        ativo: input.ativo,
      })
    },
    onSuccess: async () => {
      toast.success('Formulário personalizado atualizado com sucesso.')
      setDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['ficha-clinica-secao-templates'] })
    },
    onError: (error: unknown) => {
      console.error('Erro ao guardar formulário personalizado:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao guardar o formulário personalizado.'
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
      toast.success('Formulário(s) eliminado(s) com sucesso.')
      setSelectedIds(new Set())
      await queryClient.invalidateQueries({ queryKey: ['ficha-clinica-secao-templates'] })
    },
    onError: (error: unknown) => {
      console.error('Erro ao eliminar formulários personalizados:', error)
      const message =
        error instanceof Error ? error.message : 'Falha ao eliminar os formulários selecionados.'
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

    if (!nome.trim()) {
      toast.error('Nome é obrigatório.')
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

    if (payload.id) {
      saveMutation.mutate(payload)
      return
    }

    ;(async () => {
      try {
        const client = FichaClinicaSecoesService()
        const beforeRes = await client.getTemplates('')
        const beforeApi = beforeRes as unknown as { info?: { data?: FichaClinicaSecaoTemplateDTO[] } }
        const existingIds = new Set((beforeApi.info?.data ?? []).map((t) => t.id))

        const createRes = await client.createTemplate({
          codigo: '',
          nome: payload.nome,
          descricao: payload.descricao ?? '',
          ordem: payload.ordem,
          ativo: payload.ativo,
        })

        let newTemplateId = tryExtractGuid(createRes)
        if (!newTemplateId) {
          const afterRes = await client.getTemplates('')
          const afterApi = afterRes as unknown as { info?: { data?: FichaClinicaSecaoTemplateDTO[] } }
          const created = (afterApi.info?.data ?? []).find((t) => !existingIds.has(t.id))
          newTemplateId = created?.id ?? null
        }

        if (!newTemplateId) {
          throw new Error('Não foi possível obter o ID do novo formulário.')
        }

        if (pendingCampos.length > 0) {
          await Promise.all(
            pendingCampos.map((c, idx) =>
              client.createCampo({
                separadorId: newTemplateId!,
                nome: c.nome.trim(),
                tipoCampo: c.tipoCampo,
                numeroLinhas: c.numeroLinhas,
                ordem: c.ordem || idx + 1,
                ativo: c.ativo,
              }),
            ),
          )
        }

        toast.success('Formulário personalizado guardado com sucesso.')
        setDialogOpen(false)
        setPendingCampos([])
        await queryClient.invalidateQueries({ queryKey: ['ficha-clinica-secao-templates'] })
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Falha ao guardar o formulário personalizado.'
        toast.error(message)
      }
    })()
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
    const currentCount = !templateSelecionado && !formState.id ? pendingCampos.length : camposOrdenados.length
    resetCampoForm(currentCount + 1)
    setCampoDialogOpen(true)
  }

  const handleSaveCampo = () => {
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

    if (!templateSelecionado && !formState.id) {
      const resolvedTempId = dataToSave.tempId ?? crypto.randomUUID()
      const pendingItem: CampoFormState = {
        ...dataToSave,
        tempId: resolvedTempId,
      }

      setPendingCampos((prev) => {
        const existingIndex = prev.findIndex((p) => p.tempId === resolvedTempId)
        if (existingIndex >= 0) {
          const next = [...prev]
          next[existingIndex] = pendingItem
          return next
        }
        return [...prev, pendingItem]
      })

      setCampoDialogOpen(false)
      toast.success('Campo adicionado ao formulário (pendente).')
      return
    }

    if (!templateSelecionado) {
      toast.error('Nenhum formulário selecionado.')
      return
    }

    saveCampoMutation.mutate({ templateId: templateSelecionado.id, data: dataToSave })
  }

  const camposGridData: CampoFormState[] = useMemo(() => {
    if (!templateSelecionado && !formState.id) {
      return pendingCampos
        .slice()
        .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
    }

    return camposOrdenados.map((c) => ({
      id: c.id,
      nome: c.nome,
      tipoCampo: c.tipoCampo,
      numeroLinhas: c.numeroLinhas,
      ordem: c.ordem,
      ativo: c.ativo,
    }))
  }, [templateSelecionado, formState.id, pendingCampos, camposOrdenados])

  return (
    <>
      <PageHead title='Formulários Personalizados | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h1 className='text-lg font-semibold'>Formulários Personalizados</h1>
            <div className='flex items-center gap-2'>
              <Button size='sm' onClick={openCreateDialog}>
                <Plus className='mr-1 h-3.5 w-3.5' />
                Adicionar
              </Button>
              <Button size='sm' variant='destructive' onClick={handleDeleteSelected}>
                <Trash2 className='mr-1 h-3.5 w-3.5' />
                Excluir
              </Button>
            </div>
          </div>

          <div className='rounded-md border bg-card'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[40px]'></TableHead>
                  <TableHead className='w-[80px] text-center'>ID</TableHead>
                  <TableHead className='text-left'>Nome</TableHead>
                  <TableHead className='w-[80px] text-center'>Ativo</TableHead>
                  <TableHead className='w-[160px] text-center'>Opções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-6 text-center text-muted-foreground'>
                      A carregar formulários...
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-6 text-center text-muted-foreground'>
                      Nenhum formulário encontrado.
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
                      <TableCell className='text-left'>{t.nome}</TableCell>
                      <TableCell className='text-center'>{t.ativo ? 'Sim' : 'Não'}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                          onClick={() => openViewDialog(t)}
                          title='Campos'
                        >
                          <Search className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                          onClick={() => openEditDialog(t)}
                          title='Editar'
                        >
                          <Pencil className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                          onClick={() => deleteMutation.mutate([t.id])}
                          title='Eliminar'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setCamposDialogOpen(false)
            setDialogMode('create')
          }
        }}
      >
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>
              {formState.id ? 'Editar formulário personalizado' : 'Novo formulário personalizado'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end'>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Nome de Formulário</label>
                <Input
                  value={formState.nome}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  disabled={dialogMode === 'view'}
                />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-muted-foreground'>Ativo?</span>
                <Switch
                  checked={formState.ativo}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, ativo: Boolean(checked) }))
                  }
                  disabled={dialogMode === 'view'}
                />
                <span className='text-xs font-medium'>{formState.ativo ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            {camposDialogOpen ? (
              <>
                <div className='mb-1 flex items-center justify-between gap-4'>
                  <div />
                  <Button
                    size='sm'
                    onClick={handleOpenNovoCampo}
                    disabled={dialogMode === 'view' || (!templateSelecionado && !formState.id)}
                  >
                    <Plus className='mr-1 h-3.5 w-3.5' />
                    Inserir
                  </Button>
                </div>

                <div className='max-h-[320px] overflow-auto rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='text-left'>Título</TableHead>
                        <TableHead className='text-left'>Tipo de Campo</TableHead>
                        <TableHead className='w-[80px] text-center'>Tamanho</TableHead>
                        <TableHead className='w-[80px] text-center'>Ativo?</TableHead>
                        <TableHead className='w-[120px] text-center'>Opções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingCampos ? (
                        <TableRow>
                          <TableCell colSpan={5} className='py-4 text-center text-muted-foreground'>
                            A carregar campos...
                          </TableCell>
                        </TableRow>
                      ) : camposGridData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className='py-4 text-center text-muted-foreground'>
                            Não existem dados a apresentar.
                          </TableCell>
                        </TableRow>
                      ) : (
                        camposGridData.map((c) => (
                          <TableRow key={c.id ?? c.tempId}>
                            <TableCell className='text-left'>{c.nome}</TableCell>
                            <TableCell className='text-left'>
                              {c.tipoCampo === 'TextoMultilinha' ? 'Texto Longo' : 'Texto'}
                            </TableCell>
                            <TableCell className='text-center'>{c.numeroLinhas}</TableCell>
                            <TableCell className='text-center'>{c.ativo ? 'Sim' : 'Não'}</TableCell>
                            <TableCell className='text-right'>
                              <div className='flex justify-end gap-2'>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                                  onClick={() => openEditCampoDialog(c)}
                                  title='Editar'
                                  disabled={dialogMode === 'view'}
                                >
                                  <Pencil className='h-3.5 w-3.5' />
                                </Button>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                                  onClick={() => {
                                    if (c.id) {
                                      deleteCampoMutation.mutate(c.id)
                                      return
                                    }
                                    if (c.tempId) {
                                      setPendingCampos((prev) => prev.filter((p) => p.tempId !== c.tempId))
                                    }
                                  }}
                                  title='Eliminar'
                                  disabled={dialogMode === 'view'}
                                >
                                  <Trash2 className='h-3.5 w-3.5' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant='outline' type='button' onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            {dialogMode !== 'view' ? (
              <Button type='button' onClick={handleSave}>
                OK
              </Button>
            ) : null}
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

            <div className='grid grid-cols-[minmax(0,1fr)_80px_80px] gap-3'>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>
                  Tipo de Campo
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
                    <SelectItem value='Texto'>Texto</SelectItem>
                    <SelectItem value='TextoMultilinha'>Texto Longo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Tamanho</label>
                <Input
                  type='number'
                  min={1}
                  value={campoFormState.numeroLinhas}
                  onChange={(e) =>
                    setCampoFormState((prev) => ({
                      ...prev,
                      numeroLinhas: Number(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Ativo</label>
                <div className='h-10 flex items-center -translate-y-1'>
                  <Switch
                    checked={campoFormState.ativo}
                    onCheckedChange={(checked) =>
                      setCampoFormState((prev) => ({ ...prev, ativo: Boolean(checked) }))
                    }
                  />
                </div>
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
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

