import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SeparadoresGestaoService } from '@/lib/services/processo-clinico/separadores-gestao-service'
import { FichaClinicaSecoesService } from '@/lib/services/processo-clinico/ficha-clinica-secoes-service'
import type { FichaClinicaSecaoTemplateDTO } from '@/types/dtos/processo-clinico/ficha-clinica-secoes.dtos'
import type {
  SeparadorPersonalizadoDTO,
  SeparadorPersonalizadoVinculoDTO,
  TipoVinculoSeparador,
} from '@/types/dtos/processo-clinico/separadores-gestao.dtos'
import { toast } from '@/utils/toast-utils'
import { getCurrentWindowId } from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'

interface FormState {
  id?: string
  nomeSeparador: string
  formularioId: string
  ordem: number
  ativo: boolean
}

interface PendingVinculo {
  id: string
  tipo: TipoVinculoSeparador
  entidadeId: string
}

const tryExtractEntityId = (response: unknown): string | null => {
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
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }
  return null
}

const extractApiErrorMessage = (response: unknown): string | null => {
  const root = response as
    | { info?: { status?: number; messages?: Record<string, string[]> } }
    | undefined
  const info = root?.info
  if (!info) return null

  // Backend wrapper: 0=Success, 1=PartialSuccess, 2=Failure
  if (info.status === 2 && info.messages) {
    const allMessages = Object.values(info.messages).flat().filter(Boolean)
    if (allMessages.length > 0) return allMessages[0]
  }
  return null
}

export function SeparadoresPersonalizadosPage() {
  const queryClient = useQueryClient()
  const updateWindowState = useWindowsStore((s) => s.updateWindowState)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedItem, setSelectedItem] = useState<SeparadorPersonalizadoDTO | null>(null)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectorTipo, setSelectorTipo] = useState<TipoVinculoSeparador | null>(null)
  const [selectorKeyword, setSelectorKeyword] = useState('')
  const [pendingVinculos, setPendingVinculos] = useState<PendingVinculo[]>([])
  const [formState, setFormState] = useState<FormState>({
    nomeSeparador: '',
    formularioId: '',
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
    queryKey: ['separadores-personalizados'],
    queryFn: async () => {
      const client = SeparadoresGestaoService()
      const res = await client.getSeparadoresPersonalizados('')
      const api = res as unknown as { info?: { data?: SeparadorPersonalizadoDTO[] } }
      return (api.info?.data ?? []) as SeparadorPersonalizadoDTO[]
    },
  })

  const { data: formulariosData } = useQuery({
    queryKey: ['ficha-clinica-secao-templates-select'],
    queryFn: async () => {
      const client = FichaClinicaSecoesService()
      const res = await client.getTemplates('')
      const api = res as unknown as { info?: { data?: FichaClinicaSecaoTemplateDTO[] } }
      return (api.info?.data ?? []) as FichaClinicaSecaoTemplateDTO[]
    },
  })

  const { data: vinculosData, refetch: refetchVinculos } = useQuery({
    queryKey: ['separador-personalizado-vinculos', selectedItem?.id],
    enabled: !!selectedItem?.id && dialogOpen,
    queryFn: async () => {
      if (!selectedItem?.id) return []
      const client = SeparadoresGestaoService()
      const res = await client.getVinculos(selectedItem.id)
      const api = res as unknown as { info?: { data?: SeparadorPersonalizadoVinculoDTO[] } }
      return (api.info?.data ?? []) as SeparadorPersonalizadoVinculoDTO[]
    },
  })

  const { data: medicosLight = [] } = useQuery({
    queryKey: ['separadores-personalizados-medicos-light', selectorKeyword],
    enabled: dialogOpen,
    queryFn: async () => {
      const res = await MedicosService('processo-clinico').getMedicosLight(selectorKeyword.trim())
      const api = res as unknown as { info?: { data?: Array<{ id: string; nome: string }> } }
      return api.info?.data ?? []
    },
  })

  const { data: especialidadesLight = [] } = useQuery({
    queryKey: ['separadores-personalizados-especialidades-light', selectorKeyword],
    enabled: dialogOpen,
    queryFn: async () => {
      const res = await EspecialidadeService('processo-clinico').getEspecialidadesLight(
        selectorKeyword.trim(),
      )
      const api = res as unknown as { info?: { data?: Array<{ id: string; nome: string }> } }
      return api.info?.data ?? []
    },
  })

  const separadores = useMemo(() => {
    const base = (data ?? []) as SeparadorPersonalizadoDTO[]
    return base.slice().sort((a, b) => a.ordem - b.ordem || a.nomeSeparador.localeCompare(b.nomeSeparador))
  }, [data])

  const formularios = useMemo(() => {
    const base = (formulariosData ?? []) as FichaClinicaSecaoTemplateDTO[]
    return base.slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
  }, [formulariosData])

  const getFormularioNome = (id: string) => formularios.find((f) => f.id === id)?.nome ?? id

  const resetForm = () => {
    setFormState({
      nomeSeparador: '',
      formularioId: '',
      ordem: separadores.length + 1,
      ativo: true,
    })
    setSelectedItem(null)
    setPendingVinculos([])
  }

  const openCreateDialog = () => {
    setDialogMode('create')
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (item: SeparadorPersonalizadoDTO) => {
    setDialogMode('edit')
    setSelectedItem(item)
    setFormState({
      id: item.id,
      nomeSeparador: item.nomeSeparador,
      formularioId: item.formularioId,
      ordem: item.ordem,
      ativo: item.ativo,
    })
    setPendingVinculos([])
    setDialogOpen(true)
  }

  const openViewDialog = (item: SeparadorPersonalizadoDTO) => {
    setDialogMode('view')
    setSelectedItem(item)
    setFormState({
      id: item.id,
      nomeSeparador: item.nomeSeparador,
      formularioId: item.formularioId,
      ordem: item.ordem,
      ativo: item.ativo,
    })
    setPendingVinculos([])
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async (input: FormState) => {
      const client = SeparadoresGestaoService()
      if (input.id) {
        return client.updateSeparadorPersonalizado(input.id, {
          nomeSeparador: input.nomeSeparador,
          formularioId: input.formularioId,
          ordem: input.ordem,
          ativo: input.ativo,
        })
      }
      return client.createSeparadorPersonalizado({
        nomeSeparador: input.nomeSeparador,
        formularioId: input.formularioId,
        ordem: input.ordem,
        ativo: input.ativo,
      })
    },
    onSuccess: async () => {
      toast.success('Separador personalizado guardado com sucesso.')
      setDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['separadores-personalizados'] })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Falha ao guardar separador personalizado.'
      toast.error(message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const client = SeparadoresGestaoService()
      if (ids.length === 1) {
        return client.deleteSeparadorPersonalizado(ids[0])
      }
      return client.deleteMultipleSeparadoresPersonalizados(ids)
    },
    onSuccess: async () => {
      toast.success('Separador(es) personalizado(s) eliminado(s) com sucesso.')
      setSelectedIds(new Set())
      await queryClient.invalidateQueries({ queryKey: ['separadores-personalizados'] })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Falha ao eliminar separador(es) personalizado(s).'
      toast.error(message)
    },
  })

  const addVinculoMutation = useMutation({
    mutationFn: async (input: { tipo: TipoVinculoSeparador; entidadeId: string }) => {
      if (!selectedItem?.id) throw new Error('Separador personalizado inválido.')
      const entidadeId = input.entidadeId.trim()
      if (!entidadeId) throw new Error('Indique o ID da entidade.')
      const client = SeparadoresGestaoService()
      return client.createVinculo({
        separadorPersonalizadoId: selectedItem.id,
        tipo: input.tipo,
        entidadeId,
      })
    },
    onSuccess: async () => {
      toast.success('Vínculo adicionado com sucesso.')
      await refetchVinculos()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Falha ao adicionar vínculo.'
      toast.error(message)
    },
  })

  const deleteVinculoMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = SeparadoresGestaoService()
      return client.deleteVinculo(id)
    },
    onSuccess: async () => {
      toast.success('Vínculo removido com sucesso.')
      await refetchVinculos()
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Falha ao remover vínculo.'
      toast.error(message)
    },
  })

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSave = async () => {
    const nomeNormalizado = formState.nomeSeparador.trim()
    if (!nomeNormalizado) {
      toast.error('O nome do separador é obrigatório.')
      return
    }
    if (!formState.formularioId) {
      toast.error('É obrigatório associar um formulário.')
      return
    }

    if (formState.id) {
      saveMutation.mutate({
        id: formState.id,
        nomeSeparador: nomeNormalizado,
        formularioId: formState.formularioId,
        ordem: formState.ordem,
        ativo: formState.ativo,
      })
      return
    }

    try {
      const client = SeparadoresGestaoService()
      const existingIds = new Set(separadores.map((s) => s.id))
      const res = await client.createSeparadorPersonalizado({
        nomeSeparador: nomeNormalizado,
        formularioId: formState.formularioId,
        ordem: formState.ordem,
        ativo: formState.ativo,
      })
      const apiErrorMessage = extractApiErrorMessage(res)
      if (apiErrorMessage) {
        toast.error(apiErrorMessage)
        return
      }
      let newId = tryExtractEntityId(res)
      if (!newId) {
        const listRes = await client.getSeparadoresPersonalizados('')
        const listApi = listRes as unknown as { info?: { data?: SeparadorPersonalizadoDTO[] } }
        const list = (listApi.info?.data ?? []) as SeparadorPersonalizadoDTO[]
        const created = list.find((s) => !existingIds.has(s.id))
        newId = created?.id ?? null
      }

      if (!newId && pendingVinculos.length > 0) {
        throw new Error('Não foi possível obter o ID válido do novo separador.')
      }

      if (pendingVinculos.length > 0) {
        if (!newId) throw new Error('Não foi possível obter o ID válido do novo separador.')
        await Promise.all(
          pendingVinculos.map((v) =>
            client.createVinculo({
              separadorPersonalizadoId: newId,
              tipo: v.tipo,
              entidadeId: v.entidadeId,
            }),
          ),
        )
      }

      toast.success('Separador personalizado guardado com sucesso.')
      setDialogOpen(false)
      setPendingVinculos([])
      await queryClient.invalidateQueries({ queryKey: ['separadores-personalizados'] })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Falha ao guardar separador personalizado.'
      toast.error(message)
    }
  }

  const openSelector = (tipo: TipoVinculoSeparador) => {
    setSelectorTipo(tipo)
    setSelectorKeyword('')
    setSelectorOpen(true)
  }

  const handleSelectEntidade = (entidadeId: string) => {
    if (!selectorTipo) return
    if (selectedItem?.id) {
      addVinculoMutation.mutate({ tipo: selectorTipo, entidadeId })
    } else {
      const exists = pendingVinculos.some((v) => v.tipo === selectorTipo && v.entidadeId === entidadeId)
      if (!exists) {
        setPendingVinculos((prev) => [
          ...prev,
          { id: crypto.randomUUID(), tipo: selectorTipo, entidadeId },
        ])
      }
    }
    setSelectorOpen(false)
  }

  const codigoModal = String(formState.ordem)
  const canManageVinculos = !!selectedItem?.id && dialogMode !== 'create'
  const resolveVinculoName = (v: SeparadorPersonalizadoVinculoDTO): { especialidade: string; medico: string } => {
    const medicoNome = medicosLight.find((m) => m.id === v.entidadeId)?.nome
    const especialidadeNome = especialidadesLight.find((e) => e.id === v.entidadeId)?.nome

    // Prioriza correspondência real da entidade para evitar desalinhamento visual
    if (medicoNome && !especialidadeNome) return { especialidade: '', medico: medicoNome }
    if (especialidadeNome && !medicoNome) return { especialidade: especialidadeNome, medico: '' }

    if (v.tipo === 1) return { especialidade: '', medico: medicoNome ?? v.entidadeId }
    if (v.tipo === 2) return { especialidade: especialidadeNome ?? v.entidadeId, medico: '' }
    return { especialidade: '', medico: '' }
  }

  return (
    <>
      <PageHead title='Separadores Personalizados | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h1 className='text-lg font-semibold'>Separadores Personalizados</h1>
            <div className='flex items-center gap-2'>
              <Button size='sm' onClick={openCreateDialog}>
                <Plus className='mr-1 h-3.5 w-3.5' />
                Adicionar
              </Button>
              <Button size='sm' variant='destructive' onClick={() => deleteMutation.mutate(Array.from(selectedIds))}>
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
                  <TableHead className='w-[80px] text-center'>Ordem</TableHead>
                  <TableHead className='text-left'>Nome</TableHead>
                  <TableHead className='text-left'>Formulário</TableHead>
                  <TableHead className='w-[80px] text-center'>Ativo</TableHead>
                  <TableHead className='w-[160px] text-center'>Opções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-6 text-center text-muted-foreground'>
                      A carregar separadores personalizados...
                    </TableCell>
                  </TableRow>
                ) : separadores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-6 text-center text-muted-foreground'>
                      Não existem dados a apresentar.
                    </TableCell>
                  </TableRow>
                ) : (
                  separadores.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={(checked) => toggleSelected(item.id, Boolean(checked))}
                        />
                      </TableCell>
                      <TableCell className='text-center'>{item.ordem}</TableCell>
                      <TableCell className='text-left'>{item.nomeSeparador}</TableCell>
                      <TableCell className='text-left'>{getFormularioNome(item.formularioId)}</TableCell>
                      <TableCell className='text-center'>{item.ativo ? 'Sim' : 'Não'}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                            onClick={() => openViewDialog(item)}
                            title='Ver'
                          >
                            <Search className='h-3.5 w-3.5' />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                            onClick={() => openEditDialog(item)}
                            title='Editar'
                          >
                            <Pencil className='h-3.5 w-3.5' />
                          </Button>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                            onClick={() => deleteMutation.mutate([item.id])}
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
            setDialogMode('create')
            setSelectedItem(null)
          }
        }}
      >
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle className='text-base'>
              {dialogMode === 'create'
                ? 'Separadores'
                : dialogMode === 'edit'
                  ? 'Separadores'
                  : 'Separadores'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3'>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Cód.</label>
                <Input value={codigoModal} disabled />
              </div>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Nome</label>
                <Input
                  value={formState.nomeSeparador}
                  onChange={(e) => setFormState((prev) => ({ ...prev, nomeSeparador: e.target.value }))}
                  disabled={dialogMode === 'view'}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-end'>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Formulário</label>
                <Select
                  value={formState.formularioId}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, formularioId: value }))}
                  disabled={dialogMode === 'view'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecionar formulário' />
                  </SelectTrigger>
                  <SelectContent>
                    {formularios.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type='button' size='icon' variant='outline' className='h-10 w-10' disabled={dialogMode === 'view'}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>

            <div className='space-y-1'>
              <label className='block text-xs font-medium text-muted-foreground'>Ativo?</label>
              <div className='h-10 flex items-center gap-2'>
                <Switch
                  checked={formState.ativo}
                  onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, ativo: Boolean(checked) }))}
                  disabled={dialogMode === 'view'}
                />
                <span className='text-xs font-medium'>{formState.ativo ? 'Sim' : 'Não'}</span>
              </div>
            </div>

            <div className='flex items-center justify-end gap-2 pt-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => openSelector(1)}
                disabled={dialogMode === 'view'}
              >
                <Plus className='mr-1 h-3.5 w-3.5' />
                Inserir Médico
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => openSelector(2)}
                disabled={dialogMode === 'view'}
              >
                <Plus className='mr-1 h-3.5 w-3.5' />
                Inserir Especialidade
              </Button>
            </div>

            <div className='max-h-[220px] overflow-auto rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[80px] text-left'>Cód.</TableHead>
                    <TableHead className='w-[280px] text-left'>Especialidade</TableHead>
                    <TableHead className='w-[280px] text-left'>Médico</TableHead>
                    <TableHead className='w-[80px] text-right'>Opções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!canManageVinculos && pendingVinculos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='py-4 text-center text-muted-foreground'>
                        Sem vínculos.
                      </TableCell>
                    </TableRow>
                  ) : canManageVinculos && (vinculosData ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='py-4 text-center text-muted-foreground'>
                        Sem vínculos.
                      </TableCell>
                    </TableRow>
                  ) : !canManageVinculos ? (
                    pendingVinculos.map((v, idx) => {
                      const nome =
                        v.tipo === 1
                          ? medicosLight.find((m) => m.id === v.entidadeId)?.nome ?? v.entidadeId
                          : especialidadesLight.find((e) => e.id === v.entidadeId)?.nome ?? v.entidadeId

                      return (
                        <TableRow key={v.id}>
                          <TableCell className='text-left'>{idx + 1}</TableCell>
                          <TableCell className='text-left'>{v.tipo === 2 ? nome : '—'}</TableCell>
                          <TableCell className='text-left'>{v.tipo === 1 ? nome : '—'}</TableCell>
                          <TableCell className='text-right'>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                              onClick={() => setPendingVinculos((prev) => prev.filter((x) => x.id !== v.id))}
                              disabled={dialogMode === 'view'}
                              title='Eliminar'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    (vinculosData ?? []).map((v, idx) => {
                      const names = resolveVinculoName(v)
                      return (
                        <TableRow key={v.id}>
                          <TableCell className='text-left'>{idx + 1}</TableCell>
                          <TableCell className='text-left'>{names.especialidade || '—'}</TableCell>
                          <TableCell className='text-left'>{names.medico || '—'}</TableCell>
                          <TableCell className='text-right'>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-7 w-7 border-0 bg-transparent p-0 shadow-none hover:bg-transparent'
                              onClick={() => deleteVinculoMutation.mutate(v.id)}
                              disabled={dialogMode === 'view'}
                              title='Eliminar'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
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

      <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle>
              {selectorTipo === 1 ? 'Selecionar médico' : 'Selecionar especialidade'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <Input
              value={selectorKeyword}
              onChange={(e) => setSelectorKeyword(e.target.value)}
              placeholder='Pesquisar...'
            />
            <div className='max-h-[320px] overflow-auto rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className='w-[120px] text-right'>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectorTipo === 1 ? medicosLight : especialidadesLight).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className='py-4 text-center text-muted-foreground'>
                        Sem resultados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (selectorTipo === 1 ? medicosLight : especialidadesLight).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell className='text-right'>
                          <Button size='sm' variant='outline' onClick={() => handleSelectEntidade(item.id)}>
                            Selecionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

