import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import type {
  TipoExameTableDTO,
  CreateTipoExameRequest,
  UpdateTipoExameRequest,
} from '@/types/dtos/exames/tipo-exame'
import type {
  GrupoAnaliseLinhaDTO,
  CreateGrupoAnaliseLinhaRequest,
  UpdateGrupoAnaliseLinhaRequest,
} from '@/types/dtos/exames/grupo-analise-linha'
import type { AnaliseLightDTO } from '@/types/dtos/exames/analises'
import type { CategoriaProcedimentoLightDTO } from '@/types/dtos/exames/categoria-procedimento'
import type { TaxaIvaLightDTO } from '@/types/dtos/taxas-iva/taxa-iva.dtos'
import type { MotivoIsencaoLightDTO } from '@/types/dtos/taxas-iva/motivo-isencao.dtos'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { TipoExameService } from '@/lib/services/exames/tipo-exame-service'
import { CategoriaProcedimentoService } from '@/lib/services/exames/categoria-procedimento-service'
import { AnalisesService } from '@/lib/services/exames/analises-service'
import { TaxaIvaService } from '@/lib/services/taxas-iva/taxa-iva-service'
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'
import { ResponseStatus } from '@/types/api/responses'
import { CategoriaProcedimentoViewCreateModal } from '@/pages/area-comum/tabelas/exames/categoria-procedimento/modals/categoria-procedimento-view-create-modal'
import { TaxaIvaViewCreateModal } from '@/pages/area-comum/tabelas/tabelas/taxas-iva/modals/taxa-iva-view-create-modal'
import { MotivoIsencaoViewCreateModal } from '@/pages/area-comum/tabelas/tabelas/motivo-isencao/modals/motivo-isencao-view-create-modal'

type ModalMode = 'view' | 'create' | 'edit'

interface TipoExameViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: TipoExameTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  codigo: string
  designacao: string
  preco: string
  ean: string
  recomendacoesVariaveis: string
  laboratorio: string
  inativo: boolean
  categoriaProcedimentoId: string
  taxaIvaId: string
  motivoIsencaoId: string
}

type GrupoLinhaRow = {
  tempId: string
  id?: string | null
  analiseId: string
  analiseNome: string
  ordem: number
  descricao?: string | null
  unidadeMedida?: string | null
  valoresReferencia?: string | null
}

function toGrupoLinhaRow(
  item: GrupoAnaliseLinhaDTO,
  index: number
): GrupoLinhaRow {
  return {
    tempId: item.id ?? `row-${index}`,
    id: item.id,
    analiseId: item.analiseId,
    analiseNome: item.analiseNome ?? '',
    ordem: item.ordem,
    descricao: item.descricao,
    unidadeMedida: item.unidadeMedida,
    valoresReferencia: item.valoresReferencia,
  }
}

export function TipoExameViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: TipoExameViewCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState<FormValues>({
    codigo: '',
    designacao: '',
    preco: '',
    ean: '',
    recomendacoesVariaveis: '',
    laboratorio: '',
    inativo: false,
    categoriaProcedimentoId: '',
    taxaIvaId: '',
    motivoIsencaoId: '',
  })
  const [grupoLinhas, setGrupoLinhas] = useState<GrupoLinhaRow[]>([])
  const [analisePickerOpen, setAnalisePickerOpen] = useState(false)
  const [addCategoriaOpen, setAddCategoriaOpen] = useState(false)
  const [addTaxaOpen, setAddTaxaOpen] = useState(false)
  const [addMotivoOpen, setAddMotivoOpen] = useState(false)

  const queryClient = useQueryClient()
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const tipoExameId = viewData?.id ?? (viewData as { Id?: string } | null)?.Id
  const idStr = tipoExameId != null ? String(tipoExameId) : ''

  useEffect(() => {
    if (!open) return
    if (mode === 'create') {
      setValues({
        codigo: '—',
        designacao: '',
        preco: '',
        ean: '',
        recomendacoesVariaveis: '',
        laboratorio: '',
        inativo: false,
        categoriaProcedimentoId: '',
        taxaIvaId: '',
        motivoIsencaoId: '',
      })
      setGrupoLinhas([])
      return
    }
    if (!idStr) return
    setLoading(true)
    TipoExameService()
      .getTipoExameById(idStr)
      .then((res) => {
        if (res.info?.data) {
          const d = res.info.data
          setValues({
            codigo: d.id ? d.id.slice(0, 8) : '—',
            designacao: d.designacao ?? '',
            preco: String(d.preco ?? ''),
            ean: d.ean ?? '',
            recomendacoesVariaveis: d.recomendacoesVariaveis ?? '',
            laboratorio: d.laboratorio != null ? String(d.laboratorio) : '',
            inativo: d.inativo ?? false,
            categoriaProcedimentoId: d.categoriaProcedimentoId ?? '',
            taxaIvaId: d.taxaIvaId ?? '',
            motivoIsencaoId: d.motivoIsencaoId ?? '',
          })
          setGrupoLinhas(
            (d.grupoAnaliseLinhas ?? []).map((g, i) => toGrupoLinhaRow(g, i))
          )
        }
      })
      .finally(() => setLoading(false))
  }, [open, mode, idStr])

  const { data: categoriasRes } = useQuery({
    queryKey: ['categoria-procedimento-light', { open }],
    queryFn: () => CategoriaProcedimentoService().getCategoriaProcedimentosLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })
  const { data: taxasRes } = useQuery({
    queryKey: ['taxas-iva-light', { open }],
    queryFn: () => TaxaIvaService().getTaxasIvaLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })
  const { data: motivosRes } = useQuery({
    queryKey: ['motivo-isencao-light', { open }],
    queryFn: () => MotivoIsencaoService().getMotivosIsencaoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })
  const { data: analisesRes } = useQuery({
    queryKey: ['analises-light', { analisePickerOpen }],
    queryFn: () => AnalisesService().getAnalisesLight(),
    enabled: analisePickerOpen,
    staleTime: 2 * 60 * 1000,
  })

  const categorias: CategoriaProcedimentoLightDTO[] =
    categoriasRes?.info?.data ?? []
  const taxasIva: TaxaIvaLightDTO[] = useMemo(
    () => (taxasRes?.info?.data ?? []).slice().sort((a, b) => a.taxa - b.taxa),
    [taxasRes]
  )
  const motivosIsencao: MotivoIsencaoLightDTO[] =
    motivosRes?.info?.data ?? []
  const analisesLight: AnaliseLightDTO[] = analisesRes?.info?.data ?? []

  const selectedTaxaIva = useMemo(
    () => taxasIva.find((t) => t.id === values.taxaIvaId),
    [taxasIva, values.taxaIvaId]
  )
  const isTaxaIsento =
    selectedTaxaIva?.descricao?.toLowerCase().includes('isento') ?? false

  const addAnaliseToGrupo = useCallback(
    (a: AnaliseLightDTO) => {
      const nextOrdem =
        grupoLinhas.length === 0
          ? 0
          : Math.max(...grupoLinhas.map((r) => r.ordem), -1) + 1
      setGrupoLinhas((prev) => [
        ...prev,
        {
          tempId: `new-${a.id}-${Date.now()}`,
          analiseId: a.id,
          analiseNome: a.nome ?? '',
          ordem: nextOrdem,
          unidadeMedida: a.unidadeMedida ?? null,
          valoresReferencia: null,
        },
      ])
      setAnalisePickerOpen(false)
    },
    [grupoLinhas.length]
  )

  const removeGrupoLinha = useCallback((tempId: string) => {
    setGrupoLinhas((prev) => prev.filter((r) => r.tempId !== tempId))
  }, [])

  const handleGuardar = async () => {
    if (isView) return
    if (!values.designacao?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }
    const precoNumber = values.preco
      ? Number(values.preco.replace(',', '.'))
      : 0
    if (Number.isNaN(precoNumber) || precoNumber < 0) {
      toast.error('Preço inválido.')
      return
    }
    const labNumber = values.laboratorio
      ? Number(values.laboratorio.replace(',', '.'))
      : undefined

    if (isTaxaIsento && !values.motivoIsencaoId?.trim()) {
      toast.error(
        'Quando a Taxa de IVA é Isento, deve indicar o Motivo de Isenção.'
      )
      return
    }

    const grupoCreate: CreateGrupoAnaliseLinhaRequest[] = grupoLinhas.map(
      (r) => ({
        analiseId: r.analiseId,
        ordem: r.ordem,
        descricao: r.descricao ?? null,
        unidadeMedida: r.unidadeMedida ?? null,
        valoresReferencia: r.valoresReferencia ?? null,
      })
    )
    const grupoUpdate: UpdateGrupoAnaliseLinhaRequest[] = grupoLinhas.map(
      (r) => ({
        id: r.id ?? null,
        analiseId: r.analiseId,
        ordem: r.ordem,
        descricao: r.descricao ?? null,
        unidadeMedida: r.unidadeMedida ?? null,
        valoresReferencia: r.valoresReferencia ?? null,
      })
    )

    const bodyCreate: CreateTipoExameRequest = {
      designacao: values.designacao.trim(),
      preco: precoNumber,
      ean: values.ean.trim() || null,
      categoriaProcedimentoId: values.categoriaProcedimentoId || null,
      taxaIvaId: values.taxaIvaId || null,
      motivoIsencaoId: values.motivoIsencaoId || null,
      recomendacoesVariaveis:
        values.recomendacoesVariaveis.trim() || null,
      laboratorio:
        labNumber != null && !Number.isNaN(labNumber) ? labNumber : null,
      inativo: values.inativo,
      grupoAnaliseLinhas: grupoCreate,
    }
    const bodyUpdate: UpdateTipoExameRequest = {
      ...bodyCreate,
      grupoAnaliseLinhas: grupoUpdate,
    }

    try {
      const client = TipoExameService()
      if (isEdit && idStr) {
        const response = await client.updateTipoExame(idStr, bodyUpdate)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Tipo de exame atualizado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao atualizar Tipo de exame.'
          toast.error(msg)
        }
      } else {
        const response = await client.createTipoExame(bodyCreate)
        if (response.info.status === ResponseStatus.Success) {
          toast.success('Tipo de exame criado com sucesso.')
          onOpenChange(false)
          onSuccess?.()
        } else {
          const msg =
            response.info.messages?.['$']?.[0] ??
            'Falha ao criar Tipo de exame.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Tipo de exame.'
      )
    }
  }

  const title =
    mode === 'create'
      ? 'Novo Tipo de Exame'
      : mode === 'edit'
        ? 'Editar Tipo de Exame'
        : 'Tipos de Exames'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {mode === 'view'
                ? 'Visualizar detalhes do Tipo de exame.'
                : 'Preencha os campos obrigatórios e guarde as alterações.'}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className='py-4'>A carregar...</p>
          ) : (
            <div className='space-y-4 py-2'>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-[auto_auto_1fr]'>
                <div className='space-y-2 w-full max-w-[11rem]'>
                  <Label>Código</Label>
                  <Input
                    readOnly
                    value={values.codigo}
                    className='bg-muted h-8'
                  />
                </div>
                <div className='space-y-2 w-full max-w-[11rem]'>
                  <Label>EAN</Label>
                  <Input
                    value={values.ean}
                    onChange={(e) =>
                      setValues((p) => ({ ...p, ean: e.target.value }))
                    }
                    disabled={isView}
                    placeholder='0000000000000'
                    className='h-8'
                  />
                </div>
                <div className='grid grid-cols-2 items-end col-span-2 md:col-span-1'>
                  <div className='space-y-2 ml-12'>
                    <Label>Estado</Label>
                    <div className='flex h-8 items-center'>
                      <Button
                        type='button'
                        variant={values.inativo ? 'destructive' : 'outline'}
                        size='sm'
                        className='h-8'
                        onClick={() =>
                          !isView &&
                          setValues((p) => ({ ...p, inativo: !p.inativo }))
                        }
                        disabled={isView}
                      >
                        <X className='mr-1 h-3 w-3' />
                        Inactivo
                      </Button>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label>Laboratório</Label>
                    <div className='flex h-8 items-center'>
                      <Button
                        type='button'
                        variant={values.laboratorio ? 'destructive' : 'outline'}
                        size='sm'
                        className='h-8'
                        onClick={() =>
                          !isView &&
                          setValues((p) => ({
                            ...p,
                            laboratorio: p.laboratorio ? '' : '1',
                          }))
                        }
                        disabled={isView}
                      >
                        <X className='mr-1 h-3 w-3' />
                        Laboratório
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Designação</Label>
                <Input
                  value={values.designacao}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, designacao: e.target.value }))
                  }
                  disabled={isView}
                  placeholder='Designação...'
                  className='w-full min-w-0'
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label>Centro/Unidade *</Label>
                    <div className='flex gap-1'>
                      <Select
                        value={values.categoriaProcedimentoId || undefined}
                        onValueChange={(v) =>
                          setValues((p) => ({
                            ...p,
                            categoriaProcedimentoId: v ?? '',
                          }))
                        }
                        disabled={isView}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar...' />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='shrink-0'
                        title='Adicionar Centro/Unidade'
                        disabled={isView}
                        onClick={() => setAddCategoriaOpen(true)}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label>Preço (€)</Label>
                    <Input
                      value={values.preco}
                      onChange={(e) =>
                        setValues((p) => ({ ...p, preco: e.target.value }))
                      }
                      disabled={isView}
                      placeholder='7,50'
                    />
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label>Taxa de Iva *</Label>
                    <div className='flex gap-1'>
                      <Select
                        value={values.taxaIvaId || undefined}
                        onValueChange={(v) => {
                          const nextTaxa = taxasIva.find((t) => t.id === v)
                          const nextIsIsento =
                            nextTaxa?.descricao
                              ?.toLowerCase()
                              .includes('isento') ?? false
                          setValues((p) => ({
                            ...p,
                            taxaIvaId: v ?? '',
                            motivoIsencaoId: nextIsIsento ? p.motivoIsencaoId : '',
                          }))
                        }}
                        disabled={isView}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Seleccionar...' />
                        </SelectTrigger>
                        <SelectContent>
                          {taxasIva.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='shrink-0'
                        title='Adicionar Taxa de IVA'
                        disabled={isView}
                        onClick={() => setAddTaxaOpen(true)}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label>
                      Motivo de Isenção
                      {isTaxaIsento && (
                        <span className='text-destructive'> *</span>
                      )}
                    </Label>
                    <div className='flex gap-1'>
                      <Select
                        value={values.motivoIsencaoId || undefined}
                        onValueChange={(v) =>
                          setValues((p) => ({
                            ...p,
                            motivoIsencaoId: v ?? '',
                          }))
                        }
                        disabled={isView || !isTaxaIsento}
                      >
                        <SelectTrigger
                          className={!isTaxaIsento ? 'bg-muted' : undefined}
                        >
                          <SelectValue placeholder='Motivo de Isenção...' />
                        </SelectTrigger>
                        <SelectContent>
                          {motivosIsencao.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        className='shrink-0'
                        title='Adicionar Motivo de Isenção'
                        disabled={isView || !isTaxaIsento}
                        onClick={() => setAddMotivoOpen(true)}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Recomendações Variáveis</Label>
                <Textarea
                  value={values.recomendacoesVariaveis}
                  onChange={(e) =>
                    setValues((p) => ({
                      ...p,
                      recomendacoesVariaveis: e.target.value,
                    }))
                  }
                  disabled={isView}
                  rows={4}
                  placeholder='Recomendações Variáveis...'
                  className='w-full min-w-0 resize-y'
                />
              </div>

              <div className='rounded-md border p-3'>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='font-semibold text-primary'>
                    Grupo de Análises
                  </span>
                  {!isView && (
                    <Button
                      type='button'
                      size='sm'
                      className='bg-green-600 hover:bg-green-700'
                      onClick={() => setAnalisePickerOpen(true)}
                    >
                      <Plus className='mr-1 h-4 w-4' />
                      Inserir Análise
                    </Button>
                  )}
                </div>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b'>
                        <th className='p-2 text-left font-medium'>Cód.</th>
                        <th className='p-2 text-left font-medium'>
                          Descrição
                        </th>
                        <th className='p-2 text-left font-medium'>
                          Unidade Medida
                        </th>
                        <th className='p-2 text-left font-medium'>
                          V. Referência
                        </th>
                        <th className='p-2 text-right font-medium'>
                          Opções
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupoLinhas.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className='p-4 text-center text-muted-foreground'
                          >
                            Não existem dados a apresentar
                          </td>
                        </tr>
                      ) : (
                        grupoLinhas.map((row) => (
                          <tr key={row.tempId} className='border-b'>
                            <td className='p-2'>
                              {row.analiseId.slice(0, 8)}
                            </td>
                            <td className='p-2'>{row.analiseNome}</td>
                            <td className='p-2'>
                              {row.unidadeMedida ?? '—'}
                            </td>
                            <td className='p-2'>
                              {row.valoresReferencia ?? '—'}
                            </td>
                            <td className='p-2 text-right'>
                              {!isView && (
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 text-destructive'
                                  onClick={() =>
                                    removeGrupoLinha(row.tempId)
                                  }
                                  title='Remover'
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            {!isView ? (
              <Button type='button' onClick={handleGuardar}>
                OK
              </Button>
            ) : (
              <Button type='button' onClick={() => onOpenChange(false)}>
                OK
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={analisePickerOpen}
        onOpenChange={setAnalisePickerOpen}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Inserir Análise</DialogTitle>
            <DialogDescription>
              Selecione uma análise para adicionar ao grupo.
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-80 overflow-y-auto'>
            <ul className='space-y-1'>
              {analisesLight
                .filter(
                  (a) =>
                    !grupoLinhas.some((r) => r.analiseId === a.id)
                )
                .map((a) => (
                  <li key={a.id}>
                    <Button
                      type='button'
                      variant='ghost'
                      className='w-full justify-start text-left'
                      onClick={() => addAnaliseToGrupo(a)}
                    >
                      {a.nome}
                      {a.unidadeMedida
                        ? ` (${a.unidadeMedida})`
                        : ''}
                    </Button>
                  </li>
                ))}
            </ul>
            {analisesLight.filter(
              (a) => !grupoLinhas.some((r) => r.analiseId === a.id)
            ).length === 0 && (
              <p className='py-4 text-center text-muted-foreground'>
                {analisesLight.length === 0
                  ? 'Nenhuma análise disponível.'
                  : 'Todas as análises já foram adicionadas.'}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CategoriaProcedimentoViewCreateModal
        open={addCategoriaOpen}
        onOpenChange={setAddCategoriaOpen}
        mode='create'
        viewData={null}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['categoria-procedimento-light'],
          })
          setAddCategoriaOpen(false)
        }}
      />

      <TaxaIvaViewCreateModal
        open={addTaxaOpen}
        onOpenChange={setAddTaxaOpen}
        mode='create'
        viewData={null}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['taxas-iva-light'] })
          setAddTaxaOpen(false)
        }}
      />

      <MotivoIsencaoViewCreateModal
        open={addMotivoOpen}
        onOpenChange={setAddMotivoOpen}
        mode='create'
        viewData={null}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ['motivo-isencao-light'],
          })
          setAddMotivoOpen(false)
        }}
        onSuccessWithId={(newId) => {
          setValues((p) => ({ ...p, motivoIsencaoId: newId }))
        }}
      />
    </>
  )
}

