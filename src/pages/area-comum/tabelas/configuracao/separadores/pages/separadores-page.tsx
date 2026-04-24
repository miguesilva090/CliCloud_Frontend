import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SeparadoresGestaoService } from '@/lib/services/processo-clinico/separadores-gestao-service'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { EspecialidadeService } from '@/lib/services/especialidades/especialidade-service'
import type { SeparadorDTO, SeparadorVinculoDTO, TipoVinculoSeparador } from '@/types/dtos/processo-clinico/separadores-gestao.dtos'
import type { MedicoLightDTO } from '@/types/dtos/saude/medicos.dtos'
import type { EspecialidadeLightItem } from '@/lib/services/especialidades/especialidade-service/especialidade-client'
import { toast } from '@/utils/toast-utils'
import { getCurrentWindowId } from '@/utils/window-utils'
import { useWindowsStore } from '@/stores/use-windows-store'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

interface SeparadorFormState {
  id?: string
  nome: string
  ordem: number
  ativo: boolean
}

export function SeparadoresPage() {
  const queryClient = useQueryClient()
  const updateWindowState = useWindowsStore((s) => s.updateWindowState)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SeparadorDTO | null>(null)
  const [formState, setFormState] = useState<SeparadorFormState>({
    nome: '',
    ordem: 1,
    ativo: true,
  })

  const [medicoPickerOpen, setMedicoPickerOpen] = useState(false)
  const [especialidadePickerOpen, setEspecialidadePickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')

  useEffect(() => {
    const windowId = getCurrentWindowId()
    if (windowId) {
      updateWindowState(windowId, { title: 'Separadores' })
    }
  }, [updateWindowState])

  const { data, isLoading } = useQuery({
    queryKey: ['separadores'],
    queryFn: async () => {
      const client = SeparadoresGestaoService()
      const res = await client.getSeparadores('')
      const api = res as unknown as { info?: { data?: SeparadorDTO[] } }
      return (api.info?.data ?? []) as SeparadorDTO[]
    },
  })

  const separadores = useMemo(() => {
    const base = (data ?? []) as SeparadorDTO[]
    return base.slice().sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome))
  }, [data])

  const openEditDialog = (item: SeparadorDTO) => {
    setDialogMode('edit')
    setSelectedItem(item)
    setFormState({
      id: item.id,
      nome: item.nome,
      ordem: item.ordem,
      ativo: item.ativo,
    })
    setDialogOpen(true)
  }

  const openViewDialog = (item: SeparadorDTO) => {
    setDialogMode('view')
    setSelectedItem(item)
    setFormState({
      id: item.id,
      nome: item.nome,
      ordem: item.ordem,
      ativo: item.ativo,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async (input: SeparadorFormState) => {
      const client = SeparadoresGestaoService()
      return client.updateSeparador(input.id!, {
        nome: input.nome,
        ordem: input.ordem,
        ativo: input.ativo,
      })
    },
    onSuccess: async () => {
      toast.success('Separador guardado com sucesso.')
      setDialogOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['separadores'] })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Falha ao guardar separador.'
      toast.error(message)
    },
  })

  const { data: vinculosData, refetch: refetchVinculos } = useQuery({
    queryKey: ['separador-vinculos', selectedItem?.id],
    enabled: !!selectedItem?.id && dialogOpen,
    queryFn: async () => {
      const client = SeparadoresGestaoService()
      const res = await client.getSeparadorVinculos(selectedItem!.id)
      const api = res as unknown as { info?: { data?: SeparadorVinculoDTO[] } }
      return (api.info?.data ?? []) as SeparadorVinculoDTO[]
    },
  })

  const medicosQuery = useQuery({
    queryKey: ['separadores', 'medicos-light'],
    queryFn: async () => {
      const res = await MedicosService('separadores').getMedicosLight('')
      const api = res as unknown as { info?: { data?: MedicoLightDTO[] } }
      return (api.info?.data ?? []) as MedicoLightDTO[]
    },
    enabled: medicoPickerOpen,
  })

  const especialidadesQuery = useQuery({
    queryKey: ['separadores', 'especialidades-light'],
    queryFn: async () => {
      const res = await EspecialidadeService('separadores').getEspecialidadesLight('')
      const api = res as unknown as { info?: { data?: EspecialidadeLightItem[] } }
      return (api.info?.data ?? []) as EspecialidadeLightItem[]
    },
    enabled: especialidadePickerOpen,
  })

  const medicosMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of medicosQuery.data ?? []) map.set(m.id, m.nome)
    return map
  }, [medicosQuery.data])

  const especialidadesMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of especialidadesQuery.data ?? []) map.set(e.id, e.nome)
    return map
  }, [especialidadesQuery.data])

  const filteredMedicos = useMemo(() => {
    const list = medicosQuery.data ?? []
    if (!pickerSearch.trim()) return list
    const term = pickerSearch.toLowerCase()
    return list.filter((m) => m.nome.toLowerCase().includes(term))
  }, [medicosQuery.data, pickerSearch])

  const filteredEspecialidades = useMemo(() => {
    const list = especialidadesQuery.data ?? []
    if (!pickerSearch.trim()) return list
    const term = pickerSearch.toLowerCase()
    return list.filter((e) => e.nome.toLowerCase().includes(term))
  }, [especialidadesQuery.data, pickerSearch])

  const addVinculoMutation = useMutation({
    mutationFn: async ({ tipo, entidadeId }: { tipo: TipoVinculoSeparador; entidadeId: string }) => {
      if (!selectedItem?.id) throw new Error('Separador inválido.')
      const client = SeparadoresGestaoService()
      return client.createSeparadorVinculo({
        separadorId: selectedItem.id,
        tipo,
        entidadeId,
      })
    },
    onSuccess: async () => {
      toast.success('Vínculo adicionado com sucesso.')
      setMedicoPickerOpen(false)
      setEspecialidadePickerOpen(false)
      setPickerSearch('')
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
      return client.deleteSeparadorVinculo(id)
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

  const handleSave = () => {
    if (!formState.nome.trim()) {
      toast.error('O nome do separador é obrigatório.')
      return
    }
    if (!Number.isFinite(formState.ordem) || formState.ordem < 1) {
      toast.error('A ordem deve ser pelo menos 1.')
      return
    }

    saveMutation.mutate({
      id: formState.id,
      nome: formState.nome.trim(),
      ordem: formState.ordem,
      ativo: formState.ativo,
    })
  }

  const handleSelectMedico = (medico: MedicoLightDTO) => {
    addVinculoMutation.mutate({ tipo: 1, entidadeId: medico.id })
  }

  const handleSelectEspecialidade = (esp: EspecialidadeLightItem) => {
    addVinculoMutation.mutate({ tipo: 2, entidadeId: esp.id })
  }

  const resolveVinculoName = (v: SeparadorVinculoDTO): { especialidade: string; medico: string } => {
    if (v.tipo === 1) return { especialidade: '', medico: medicosMap.get(v.entidadeId) ?? v.entidadeId }
    if (v.tipo === 2) return { especialidade: especialidadesMap.get(v.entidadeId) ?? v.entidadeId, medico: '' }
    return { especialidade: '', medico: '' }
  }

  const allMedicosLoaded = medicosQuery.isFetched
  const allEspecialidadesLoaded = especialidadesQuery.isFetched

  useQuery({
    queryKey: ['separadores', 'resolve-names', selectedItem?.id, vinculosData?.length],
    enabled: !!vinculosData && vinculosData.length > 0 && dialogOpen,
    queryFn: async () => {
      const promises: Promise<unknown>[] = []
      const hasMedico = vinculosData!.some((v) => v.tipo === 1)
      const hasEspecialidade = vinculosData!.some((v) => v.tipo === 2)
      if (hasMedico && !allMedicosLoaded) {
        promises.push(queryClient.prefetchQuery({
          queryKey: ['separadores', 'medicos-light'],
          queryFn: async () => {
            const res = await MedicosService('separadores').getMedicosLight('')
            const api = res as unknown as { info?: { data?: MedicoLightDTO[] } }
            return (api.info?.data ?? []) as MedicoLightDTO[]
          },
        }))
      }
      if (hasEspecialidade && !allEspecialidadesLoaded) {
        promises.push(queryClient.prefetchQuery({
          queryKey: ['separadores', 'especialidades-light'],
          queryFn: async () => {
            const res = await EspecialidadeService('separadores').getEspecialidadesLight('')
            const api = res as unknown as { info?: { data?: EspecialidadeLightItem[] } }
            return (api.info?.data ?? []) as EspecialidadeLightItem[]
          },
        }))
      }
      await Promise.all(promises)
      return true
    },
  })

  return (
    <>
      <PageHead title='Separadores | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h1 className='text-lg font-semibold'>Separadores</h1>
            <div />
          </div>

          <div className='rounded-md border bg-card'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[80px] text-center'>Código</TableHead>
                  <TableHead className='text-left'>Nome</TableHead>
                  <TableHead className='w-[80px] text-center'>Ativo</TableHead>
                  <TableHead className='w-[120px] text-center'>Opções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className='py-6 text-center text-muted-foreground'>
                      A carregar separadores...
                    </TableCell>
                  </TableRow>
                ) : separadores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='py-6 text-center text-muted-foreground'>
                      Não existem dados a apresentar.
                    </TableCell>
                  </TableRow>
                ) : (
                  separadores.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className='text-center'>{item.ordem}</TableCell>
                      <TableCell className='text-left'>{item.nome}</TableCell>
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

      {/* Modal principal do Separador */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Separadores</DialogTitle>
          </DialogHeader>

          <div className='space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3'>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Código</label>
                <Input value={formState.ordem} disabled />
              </div>
              <div className='space-y-1'>
                <label className='block text-xs font-medium text-muted-foreground'>Nome</label>
                <Input
                  value={formState.nome}
                  onChange={(e) => setFormState((prev) => ({ ...prev, nome: e.target.value }))}
                  disabled={dialogMode === 'view'}
                />
              </div>
            </div>

            <div className='space-y-1'>
              <label className='block text-xs font-medium text-muted-foreground'>Ativo</label>
              <div className='h-10 flex items-center gap-3'>
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

            <div className='flex items-center justify-end gap-2 pt-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  setPickerSearch('')
                  setMedicoPickerOpen(true)
                }}
                disabled={dialogMode === 'view'}
              >
                <Plus className='mr-1 h-3.5 w-3.5' />
                Inserir Médico
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  setPickerSearch('')
                  setEspecialidadePickerOpen(true)
                }}
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
                    <TableHead className='w-[80px]'>Cód.</TableHead>
                    <TableHead className='w-[140px]'>Especialidade</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead className='w-[80px] text-right'>Opções</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(vinculosData ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className='py-4 text-center text-muted-foreground'>
                        Sem vínculos.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (vinculosData ?? []).map((v) => {
                      const names = resolveVinculoName(v)
                      return (
                        <TableRow key={v.id}>
                          <TableCell>{v.id.slice(0, 4)}</TableCell>
                          <TableCell>{names.especialidade}</TableCell>
                          <TableCell>{names.medico}</TableCell>
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

      {/* Dialog de seleção de Médico */}
      <Dialog open={medicoPickerOpen} onOpenChange={setMedicoPickerOpen}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Selecionar Médico</DialogTitle>
            <DialogDescription className='sr-only'>Escolha um médico da lista.</DialogDescription>
          </DialogHeader>

          <div className='space-y-3'>
            <Input
              placeholder='Pesquisar médico...'
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              autoFocus
            />
            <div className='max-h-[350px] overflow-auto rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className='w-[100px] text-right'>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicosQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className='py-4 text-center text-muted-foreground'>
                        A carregar médicos...
                      </TableCell>
                    </TableRow>
                  ) : filteredMedicos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className='py-4 text-center text-muted-foreground'>
                        Sem resultados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMedicos.map((m) => (
                      <TableRow key={m.id} className='cursor-pointer hover:bg-muted/50'>
                        <TableCell>{m.nome}</TableCell>
                        <TableCell className='text-right'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleSelectMedico(m)}
                            disabled={addVinculoMutation.isPending}
                          >
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

          <DialogFooter>
            <Button variant='outline' onClick={() => setMedicoPickerOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de seleção de Especialidade */}
      <Dialog open={especialidadePickerOpen} onOpenChange={setEspecialidadePickerOpen}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Selecionar Especialidade</DialogTitle>
            <DialogDescription className='sr-only'>Escolha uma especialidade da lista.</DialogDescription>
          </DialogHeader>

          <div className='space-y-3'>
            <Input
              placeholder='Pesquisar especialidade...'
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              autoFocus
            />
            <div className='max-h-[350px] overflow-auto rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className='w-[100px] text-right'>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {especialidadesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className='py-4 text-center text-muted-foreground'>
                        A carregar especialidades...
                      </TableCell>
                    </TableRow>
                  ) : filteredEspecialidades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className='py-4 text-center text-muted-foreground'>
                        Sem resultados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEspecialidades.map((e) => (
                      <TableRow key={e.id} className='cursor-pointer hover:bg-muted/50'>
                        <TableCell>{e.nome}</TableCell>
                        <TableCell className='text-right'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleSelectEspecialidade(e)}
                            disabled={addVinculoMutation.isPending}
                          >
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

          <DialogFooter>
            <Button variant='outline' onClick={() => setEspecialidadePickerOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}