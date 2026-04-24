import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Save, ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { toast } from '@/utils/toast-utils'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PatologiaService } from '@/lib/services/patologias/patologia-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { LocalTratamentoService } from '@/lib/services/locais-tratamento/local-tratamento-service'
import { ResponseStatus } from '@/types/api/responses'
import type { PatologiaDTO, CreatePatologiaRequest } from '@/types/dtos/patologias/patologia.dtos'
import type { OrganismoLightDTO } from '@/types/dtos/saude/organismos.dtos'
import type { LocalTratamentoLightDTO } from '@/types/dtos/locais-tratamento/local-tratamento.dtos'
import { PatologiaServicoModal, type PatologiaServicoRow } from '../modals/patologia-servico-modal'
import { PatologiaDoencasModal } from '../modals/patologia-doencas-modal'
import { X } from 'lucide-react'
import { DoencaService } from '@/lib/services/doencas/doenca-service'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp, navigateManagedWindow } from '@/utils/window-utils'

const LISTAGEM_PATH = '/area-comum/tabelas/tratamentos/patologias'

function formatMoney(v?: number | null) {
  if (v == null) return '—'
  return v.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PatologiaEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const addWindow = useWindowsStore((s) => s.addWindow)

  const isNew = !id
  const isView = location.pathname.endsWith('/ver')

  const { data: patologiaResp, isLoading: patologiaLoading } = useQuery({
    queryKey: ['patologia-by-id', id],
    queryFn: () => PatologiaService().getPatologiaById(String(id)),
    enabled: !isNew && !!id,
    staleTime: 30 * 1000,
  })

  const patologia: PatologiaDTO | undefined = patologiaResp?.info?.data

  const { data: organismosResp } = useQuery({
    queryKey: ['organismos-light-for-patologia', { open: true }],
    queryFn: () => OrganismoService().getOrganismoLight(),
    staleTime: 5 * 60 * 1000,
  })

  const { data: locaisResp } = useQuery({
    queryKey: ['locais-tratamento-light-for-patologia', { open: true }],
    queryFn: () => LocalTratamentoService().getLocaisTratamentoLight(),
    staleTime: 5 * 60 * 1000,
  })

  const organismos: OrganismoLightDTO[] = organismosResp?.info?.data ?? []
  const locais: LocalTratamentoLightDTO[] = locaisResp?.info?.data ?? []

  const [designacao, setDesignacao] = useState('')
  const [localTratamentoId, setLocalTratamentoId] = useState<string>('')
  const [organismoId, setOrganismoId] = useState<string>('')
  const [inativo, setInativo] = useState(false)
  const [especificacaoTecnica, setEspecificacaoTecnica] = useState('')
  const [doencasTexto, setDoencasTexto] = useState('')
  const [doencaIds, setDoencaIds] = useState<string[]>([])
  const [doencasSelecionadas, setDoencasSelecionadas] = useState<
    { id: string; title: string; code?: string | null }[]
  >([])

  const [linhas, setLinhas] = useState<PatologiaServicoRow[]>([])
  const [selectedLinhaIds, setSelectedLinhaIds] = useState<Set<string>>(new Set())

  const [servicoModalOpen, setServicoModalOpen] = useState(false)
  const [servicoModalInitial, setServicoModalInitial] = useState<PatologiaServicoRow | null>(null)
  const [doencasModalOpen, setDoencasModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const nextOrdem = useMemo(() => (linhas.length ? Math.max(...linhas.map((l) => l.ordem ?? 0)) + 1 : 1), [linhas])

  useEffect(() => {
    if (isNew) {
      setDesignacao('')
      setLocalTratamentoId('')
      setOrganismoId('')
      setInativo(false)
      setEspecificacaoTecnica('')
      setDoencasTexto('')
      setDoencaIds([])
      setLinhas([])
      setSelectedLinhaIds(new Set())
      return
    }
    if (!patologia) return
    setDesignacao(patologia.designacao ?? '')
    setLocalTratamentoId(patologia.localTratamentoId ?? '')
    setOrganismoId(patologia.organismoId ?? '')
    setInativo(!!patologia.inativo)
    setEspecificacaoTecnica(patologia.especificacaoTecnica ?? '')
    setDoencasTexto(patologia.doencas ?? '')
    const ids = patologia.doencaIds ?? []
    setDoencaIds(ids)

    const linhasDto = patologia.patologiaServicos ?? []
    setLinhas(
      linhasDto.map((ps, idx) => ({
        tempId: ps.id ?? `line-${idx}`,
        subsistemaServicoId: ps.subsistemaServicoId,
        codigoServico: null,
        descricaoServico: ps.descricaoServico ?? null,
        subSistema: null,
        duracao: ps.duracao ?? null,
        ordem: ps.ordem ?? idx + 1,
        fisioterapia: !!ps.fisioterapia,
        auxiliar: !!ps.auxiliar,
        valorUtente: ps.valorUtente ?? 0,
        valorOrganismo: ps.valorOrganismo ?? 0,
        percentagemInstituicao: ps.percentagemInstituicao ?? null,
        precoEur: ps.precoEur ?? null,
        observacoes: ps.observacoes ?? null,
      }))
    )
    setSelectedLinhaIds(new Set())
    if (ids.length > 0) {
      ;(async () => {
        try {
          const results = await Promise.all(
            ids.map(async (did) => {
              const resp = await DoencaService().getDoenca(did)
              const d = resp.info.data
              return d ? { id: d.id, title: d.title, code: d.code ?? null } : null
            })
          )
          const filtered = results.filter(
            (x): x is { id: string; title: string; code: string | null } => x !== null
          )
          setDoencasSelecionadas(filtered)
        } catch {
          // se falhar, mantemos só os ids
        }
      })()
    } else {
      setDoencasSelecionadas([])
    }
  }, [isNew, patologia])

  const toggleLinhaSelection = (tempId: string) => {
    setSelectedLinhaIds((prev) => {
      const next = new Set(prev)
      if (next.has(tempId)) next.delete(tempId)
      else next.add(tempId)
      return next
    })
  }

  const handleInserirLinha = () => {
    if (isView) return
    if (!organismoId) {
      toast.error('Selecione primeiro um Organismo.')
      return
    }
    setServicoModalInitial(null)
    setServicoModalOpen(true)
  }

  const handleEditarLinha = (row: PatologiaServicoRow) => {
    if (isView) return
    setServicoModalInitial(row)
    setServicoModalOpen(true)
  }

  const handleRemoverLinhas = () => {
    if (isView) return
    if (selectedLinhaIds.size === 0) {
      toast.error('Selecione pelo menos uma linha para remover.')
      return
    }
    setLinhas((prev) => prev.filter((l) => !selectedLinhaIds.has(l.tempId)))
    setSelectedLinhaIds(new Set())
  }

  const upsertLinha = (row: PatologiaServicoRow) => {
    setLinhas((prev) => {
      const idx = prev.findIndex((x) => x.tempId === row.tempId)
      if (idx === -1) return [...prev, row]
      const next = [...prev]
      next[idx] = row
      return next
    })
  }

  const handleGuardar = async () => {
    if (isView) return
    if (!designacao.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }
    setIsSaving(true)
    try {
      const body: CreatePatologiaRequest = {
        designacao: designacao.trim(),
        localTratamentoId: localTratamentoId || undefined,
        organismoId: organismoId || undefined,
        especificacaoTecnica: especificacaoTecnica || undefined,
        doencas: doencasTexto || undefined,
        inativo,
        patologiaServicos: linhas.map((l) => ({
          subsistemaServicoId: l.subsistemaServicoId,
          duracao: l.duracao ?? undefined,
          ordem: l.ordem ?? 0,
          fisioterapia: !!l.fisioterapia,
          auxiliar: !!l.auxiliar,
          valorUtente: l.valorUtente ?? 0,
          valorOrganismo: l.valorOrganismo ?? 0,
          percentagemInstituicao: l.percentagemInstituicao ?? undefined,
          precoEur: l.precoEur ?? undefined,
          observacoes: l.observacoes ?? undefined,
        })),
        doencaIds: doencaIds.length ? doencaIds : undefined,
      }

      if (isNew) {
        const resp = await PatologiaService().createPatologia(body)
        if (resp.info.status === ResponseStatus.Success) {
          toast.success('Patologia criada com sucesso.')
          navigateManagedWindow(navigate, LISTAGEM_PATH)
        } else {
          const msg = resp.info.messages?.['$']?.[0] ?? 'Falha ao criar Patologia.'
          toast.error(msg)
        }
      } else if (id) {
        const resp = await PatologiaService().updatePatologia(String(id), body)
        if (resp.info.status === ResponseStatus.Success) {
          toast.success('Patologia atualizada com sucesso.')
          navigateManagedWindow(navigate, LISTAGEM_PATH)
        } else {
          const msg = resp.info.messages?.['$']?.[0] ?? 'Falha ao atualizar Patologia.'
          toast.error(msg)
        }
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar a Patologia.')
    } finally {
      setIsSaving(false)
    }
  }

  const organismoLabel = useMemo(() => {
    const o = organismos.find((x) => x.id === organismoId)
    return o?.nome ?? o?.nomeComercial ?? o?.abreviatura ?? ''
  }, [organismos, organismoId])

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <div className='flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => navigateManagedWindow(navigate, LISTAGEM_PATH)}
              title='Voltar'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <h1 className='text-lg font-semibold'>Patologias</h1>
          </div>
          <div className='flex items-center gap-2'>
            {!isView ? (
              <Button
                type='button'
                onClick={handleGuardar}
                disabled={isSaving}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                <Save className='h-4 w-4 mr-2' />
                Guardar
              </Button>
            ) : null}
            <Button
              type='button'
              variant='outline'
              onClick={() => navigateManagedWindow(navigate, LISTAGEM_PATH)}
            >
              Voltar
            </Button>
          </div>
        </div>

        <div className='border rounded-b-lg bg-background p-4 space-y-4'>
          {patologiaLoading && !isNew ? (
            <div className='text-sm text-muted-foreground'>A carregar…</div>
          ) : null}

          <div className='grid grid-cols-12 gap-4 items-end'>
            <div className='col-span-8'>
              <Label>Designação</Label>
              <Input
                value={designacao}
                onChange={(e) => setDesignacao(e.target.value)}
                readOnly={isView}
              />
            </div>

            <div className='col-span-4 flex items-center gap-2 pt-6'>
              <Checkbox
                id='inativo'
                checked={inativo}
                disabled={isView}
                onCheckedChange={(v) => setInativo(v === true)}
              />
              <Label htmlFor='inativo'>Inativo</Label>
            </div>

            <div className='col-span-6'>
              <Label>Local de Tratamento</Label>
              <Select
                value={localTratamentoId || 'none'}
                onValueChange={(v) => setLocalTratamentoId(v === 'none' ? '' : v)}
                disabled={isView}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecionar…' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>—</SelectItem>
                  {locais.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.designacao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='col-span-6'>
              <Label>Organismo</Label>
              <div className='flex items-center gap-2'>
                <div className='flex-1 min-w-0'>
                  <Select
                    value={organismoId || 'none'}
                    onValueChange={(v) => setOrganismoId(v === 'none' ? '' : v)}
                    disabled={isView}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Selecionar…' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>—</SelectItem>
                      {organismos.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.nome ?? o.nomeComercial ?? o.abreviatura ?? o.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  title='Adicionar/Selecionar'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/entidades/organismos',
                      'Organismos'
                    )
                  }
                  disabled={isView}
                >
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-12'>
              <div className='flex items-center justify-between gap-4'>
                <div className='text-sm font-medium'>Organismo</div>
                <div className='text-sm text-muted-foreground truncate'>
                  {organismoLabel || '—'}
                </div>
              </div>

              <div className='mt-2 flex items-start gap-3'>
                <div className='flex-1 border rounded-md overflow-hidden'>
                  <div className='max-h-[240px] overflow-auto'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted/40 sticky top-0'>
                        <tr>
                          <th className='w-10 p-2' />
                          <th className='p-2 text-left'>Descrição</th>
                          <th className='p-2 text-left w-20'>Duração</th>
                          <th className='p-2 text-left w-16'>Ordem</th>
                          <th className='p-2 text-center w-20'>Fisioter.</th>
                          <th className='p-2 text-center w-20'>Auxiliar</th>
                          <th className='p-2 text-right w-24'>Val. Utente</th>
                          <th className='p-2 text-right w-24'>Val. Org</th>
                          <th className='p-2 text-right w-20'>V. Org</th>
                          <th className='p-2 text-right w-24'>Preço (EUR)</th>
                          <th className='p-2 text-right w-20'>Opções</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linhas.length === 0 ? (
                          <tr>
                            <td colSpan={11} className='p-4 text-center text-muted-foreground'>
                              Sem linhas.
                            </td>
                          </tr>
                        ) : (
                          linhas
                            .slice()
                            .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                            .map((l) => (
                              <tr key={l.tempId} className='border-t hover:bg-muted/30'>
                                <td className='p-2'>
                                  <Checkbox
                                    checked={selectedLinhaIds.has(l.tempId)}
                                    onCheckedChange={() => toggleLinhaSelection(l.tempId)}
                                    disabled={isView}
                                  />
                                </td>
                                <td className='p-2'>{l.descricaoServico ?? '—'}</td>
                                <td className='p-2'>{l.duracao ?? '—'}</td>
                                <td className='p-2'>{l.ordem ?? '—'}</td>
                                <td className='p-2 text-center'>
                                  {l.fisioterapia ? '✓' : ''}
                                </td>
                                <td className='p-2 text-center'>
                                  {l.auxiliar ? '✓' : ''}
                                </td>
                                <td className='p-2 text-right tabular-nums'>
                                  {formatMoney(l.valorUtente)}
                                </td>
                                <td className='p-2 text-right tabular-nums'>
                                  {formatMoney(l.valorOrganismo)}
                                </td>
                                <td className='p-2 text-right tabular-nums'>
                                  {l.percentagemInstituicao != null ? formatMoney(l.percentagemInstituicao) : '—'}
                                </td>
                                <td className='p-2 text-right tabular-nums'>
                                  {formatMoney(l.precoEur)}
                                </td>
                                <td className='p-2'>
                                  <div className='flex items-center justify-end gap-1'>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='icon'
                                      className='h-8 w-8'
                                      title='Editar'
                                      onClick={() => handleEditarLinha(l)}
                                      disabled={isView}
                                    >
                                      <Pencil className='h-4 w-4' />
                                    </Button>
                                    <Button
                                      type='button'
                                      variant='ghost'
                                      size='icon'
                                      className='h-8 w-8 text-destructive hover:text-destructive'
                                      title='Remover'
                                      onClick={() => {
                                        if (isView) return
                                        setLinhas((prev) => prev.filter((x) => x.tempId !== l.tempId))
                                        setSelectedLinhaIds((prev) => {
                                          const next = new Set(prev)
                                          next.delete(l.tempId)
                                          return next
                                        })
                                      }}
                                      disabled={isView}
                                    >
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className='flex flex-col gap-2 pt-2'>
                  <Button type='button' variant='outline' onClick={handleInserirLinha} disabled={isView}>
                    + Inserir
                  </Button>
                  <Button type='button' variant='outline' onClick={handleRemoverLinhas} disabled={isView}>
                    - Remover
                  </Button>
                </div>
              </div>
            </div>

            <div className='col-span-12'>
              <Label>Especificação Técnica</Label>
              <Textarea
                value={especificacaoTecnica}
                onChange={(e) => setEspecificacaoTecnica(e.target.value)}
                readOnly={isView}
                rows={3}
              />
            </div>

            <div className='col-span-12'>
              <div className='flex items-center justify-between gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setDoencasModalOpen(true)}
                  disabled={isView}
                >
                  + Adicionar Doença
                </Button>
                <div className='text-xs text-muted-foreground'>
                  {doencasSelecionadas.length} selecionada(s)
                </div>
              </div>
              {doencasSelecionadas.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-2'>
                  {doencasSelecionadas.map((d) => (
                    <button
                      key={d.id}
                      type='button'
                      className='inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs'
                      disabled={isView}
                      onClick={() => {
                        if (isView) return
                        setDoencasSelecionadas((prev) => prev.filter((x) => x.id !== d.id))
                        setDoencaIds((prev) => prev.filter((x) => x !== d.id))
                      }}
                    >
                      <span className='font-medium'>
                        {d.code ? `${d.code} — ${d.title}` : d.title}
                      </span>
                      {!isView && <X className='h-3 w-3' />}
                    </button>
                  ))}
                </div>
              )}
              <div className='mt-2'>
                <Label>Doenças</Label>
                <Textarea
                  value={doencasTexto}
                  onChange={(e) => setDoencasTexto(e.target.value)}
                  readOnly={isView}
                  rows={5}
                  placeholder='Doenças...'
                />
              </div>
            </div>
          </div>
        </div>

        <PatologiaServicoModal
          open={servicoModalOpen}
          onOpenChange={setServicoModalOpen}
          title='Organismo/Serviço'
          organismoId={organismoId}
          initialValue={servicoModalInitial}
          nextOrdem={nextOrdem}
          onConfirm={(row) => upsertLinha(row)}
        />

        <PatologiaDoencasModal
          open={doencasModalOpen}
          onOpenChange={setDoencasModalOpen}
          initialSelectedIds={doencaIds}
          onConfirm={(items) => {
            setDoencaIds(items.map((i) => i.id))
            setDoencasSelecionadas(items)
          }}
        />
      </DashboardPageContainer>
    </>
  )
}


