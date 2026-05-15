import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { ServicoTableDTO } from '@/types/dtos/servicos/servico.dtos'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { TipoServicoService } from '@/lib/services/servicos/tipo-servico-service'
import { TaxaIvaService } from '@/lib/services/taxas-iva/taxa-iva-service'
import { ResponseStatus } from '@/types/api/responses'
import type { TipoServicoLightDTO } from '@/types/dtos/servicos/tipo-servico.dtos'
import type { TaxaIvaLightDTO } from '@/types/dtos/taxas-iva/taxa-iva.dtos'
import { TipoAparelhoService } from '@/lib/services/tipo-aparelho'
import { MotivoIsencaoService } from '@/lib/services/taxas-iva/motivo-isencao-service'
import type { TipoAparelhoLightDTO } from '@/types/dtos/tipo-aparelho/tipo-aparelho.dtos'
import type { MotivoIsencaoLightDTO } from '@/types/dtos/taxas-iva/motivo-isencao.dtos'
import {
  openPathInAppStandalone,
  persistServicoModalAuxSessionDraft,
  clearServicoModalAuxSessionDraft,
} from '@/utils/window-utils'
import { usePagesStore, type ServicoModalPageDraftFormValues } from '@/stores/use-pages-store'

const ROTA_TABELA_TIPOS_SERVICO = '/area-comum/tabelas/consultas/servicos/tipos-servico'
const ROTA_TABELA_TAXAS_IVA = '/area-comum/tabelas/tabelas/taxas-iva'
const ROTA_TABELA_TIPOS_APARELHO = '/area-comum/tabelas/tratamentos/tipos-aparelho'
const ROTA_TABELA_MOTIVOS_ISENCAO = '/area-comum/tabelas/tabelas/motivos-isencao'

const TIPO_APARELHO_VAZIO = '__none__'

/** Encontra código lista legível a partir do int armazenado no serviço (quando existir match). */
function mapCodigoMotivoNumericoParaCodigoLista(
  num: number | null | undefined,
  motivos: MotivoIsencaoLightDTO[]
): string {
  if (num == null) return ''
  for (const m of motivos) {
    const match = m.codigo.match(/\d+/)
    if (match && Number.parseInt(match[0], 10) === num) return m.codigo
  }
  return ''
}

function mapCodigoMotivoNumericoParaMotivoId(
  num: number | null | undefined,
  motivos: MotivoIsencaoLightDTO[]
): string {
  const cod = mapCodigoMotivoNumericoParaCodigoLista(num, motivos)
  if (!cod) return ''
  return motivos.find((m) => m.codigo === cod)?.id ?? ''
}

type ModalMode = 'view' | 'create' | 'edit'

interface ServicoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: ServicoTableDTO | null
  onSuccess?: () => void
  /** Janela da listagem Serviços (para persistir rascunho ao usar + nas tabelas auxiliares). */
  windowId?: string
  restoredSnapshot?: {
    values: ServicoModalPageDraftFormValues
    codigoMotivoNumericoCarregado: number | null
  } | null
  onRestoredSnapshotApplied?: () => void
}

type FormValues = ServicoModalPageDraftFormValues

export function ServicoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
  windowId,
  restoredSnapshot = null,
  onRestoredSnapshotApplied,
}: ServicoViewCreateModalProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const restoredOnceRef = useRef(false)
  const codigoMotivoNumericoCarregadoRef = useRef<number | null>(null)

  const [values, setValues] = useState<FormValues>({
    designacao: '',
    tipoServicoId: '',
    preco: '',
    duracao: '',
    taxaIvaId: '',
    ean: '',
    tipoAparelhoId: '',
    motivoIsencaoId: '',
    tratDentario: false,
    inativo: false,
  })

  useLayoutEffect(() => {
    if (!open || !restoredSnapshot) return
    setValues(restoredSnapshot.values)
    codigoMotivoNumericoCarregadoRef.current =
      restoredSnapshot.codigoMotivoNumericoCarregado
    restoredOnceRef.current = true
    onRestoredSnapshotApplied?.()
    void queryClient.invalidateQueries({ queryKey: ['tipos-servico-light'] })
    void queryClient.invalidateQueries({ queryKey: ['taxas-iva-light'] })
    void queryClient.invalidateQueries({ queryKey: ['tipos-aparelho-light'] })
    void queryClient.invalidateQueries({ queryKey: ['motivos-isencao-light'] })
  }, [open, restoredSnapshot, onRestoredSnapshotApplied, queryClient])

  /** Mesmo padrão que as outras listagens: regista janela na store e navega (não só `navigate`). */
  const openTabelaParaInsercao = (path: string, title: string) => {
    const p = path.startsWith('/') ? path : `/${path}`
    const servicosInstanceId = new URLSearchParams(window.location.search).get(
      'instanceId'
    )
    const draftPayload = {
      open: true as const,
      mode,
      values: { ...values },
      viewData: viewData ?? null,
      codigoMotivoNumericoCarregado: codigoMotivoNumericoCarregadoRef.current,
    }
    if (windowId) {
      usePagesStore.getState().updatePageState(windowId, () => ({
        servicoModalDraft: draftPayload,
      }))
    }
    if (servicosInstanceId) {
      persistServicoModalAuxSessionDraft(servicosInstanceId, draftPayload)
    }
    openPathInAppStandalone(navigate, p, title)
  }

  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const { data: tiposServicoResponse } = useQuery({
    queryKey: ['tipos-servico-light', { open }],
    queryFn: () => TipoServicoService().getTipoServicoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: taxasIvaResponse } = useQuery({
    queryKey: ['taxas-iva-light', { open }],
    queryFn: () => TaxaIvaService().getTaxasIvaLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })
  const { data: tiposAparelhoResponse } = useQuery({
    queryKey: ['tipos-aparelho-light', { open }],
    queryFn: () => TipoAparelhoService().getTipoAparelhoLight(),
    enabled: open, 
    staleTime: 5 * 60 * 1000,
  })
  const { data: motivosIsencaoResponse } = useQuery({
    queryKey: ['motivos-isencao-light', { open }],
    queryFn: () => MotivoIsencaoService().getMotivosIsencaoLight(''),
    enabled: open, 
    staleTime: 5 * 60 * 1000,
  })

  const tiposAparelho: TipoAparelhoLightDTO[] = 
    tiposAparelhoResponse?.info?.data ?? []

  const motivosIsencao: MotivoIsencaoLightDTO[] =
    motivosIsencaoResponse?.info?.data ?? []

  const tiposServico: TipoServicoLightDTO[] =
    tiposServicoResponse?.info?.data ?? []

  const taxasIva: TaxaIvaLightDTO[] = useMemo(
    () =>
      (taxasIvaResponse?.info?.data ?? [])
        .slice()
        .sort((a, b) => a.taxa - b.taxa || a.descricao.localeCompare(b.descricao)),
    [taxasIvaResponse]
  )

  const tipoServicoSelecionado = useMemo(
    () => tiposServico.find((t) => t.id === values.tipoServicoId) ?? null,
    [tiposServico, values.tipoServicoId]
  )

  const taxaIvaSelecionada = useMemo(
    () => taxasIva.find((t) => t.id === values.taxaIvaId) ?? null,
    [taxasIva, values.taxaIvaId]
  )

  const taxaIvaIsenta =
    taxaIvaSelecionada != null && Number(taxaIvaSelecionada.taxa) === 0

  const motivoIsencaoSelecionado = useMemo(
    () => motivosIsencao.find((m) => m.id === values.motivoIsencaoId) ?? null,
    [motivosIsencao, values.motivoIsencaoId]
  )

  useEffect(() => {
    if (restoredOnceRef.current) {
      restoredOnceRef.current = false
      return
    }
    const loadForViewOrEdit = async () => {
      if (!open || !(isView || isEdit) || !viewData) return

      const rawId =
        'id' in viewData ? viewData.id : (viewData as { Id?: string }).Id
      const id = typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''
      if (!id) return

      try {
        const resp = await ServicoService().getServico(id)
        const dto = resp.info.data
        if (!dto) return

        const dtoMotivoId = (dto.motivoIsencaoId ?? '').trim()
        const codigoMotivoLista = mapCodigoMotivoNumericoParaCodigoLista(
          dto.codigoMotivoIsencao,
          motivosIsencao
        )
        let motivoIsencaoId = dtoMotivoId
        if (!motivoIsencaoId && codigoMotivoLista) {
          motivoIsencaoId =
            motivosIsencao.find((m) => m.codigo === codigoMotivoLista)?.id ?? ''
        }
        if (!motivoIsencaoId && dto.codigoMotivoIsencao != null) {
          motivoIsencaoId = mapCodigoMotivoNumericoParaMotivoId(
            dto.codigoMotivoIsencao,
            motivosIsencao
          )
        }

        codigoMotivoNumericoCarregadoRef.current =
          dto.codigoMotivoIsencao != null && !motivoIsencaoId
            ? dto.codigoMotivoIsencao
            : null

        setValues({
          designacao: dto.designacao ?? '',
          tipoServicoId: dto.tipoServicoId ?? '',
          preco: dto.preco != null ? String(dto.preco) : '',
          duracao: dto.duracao ?? '',
          taxaIvaId: dto.taxaIvaId ?? '',
          ean: dto.ean ?? '',
          tipoAparelhoId: dto.tipoAparelhoId ?? '',
          motivoIsencaoId,
          tratDentario: dto.tratDentario ?? false,
          inativo: dto.inativo ?? false,
        })
      } catch (error) {
        const err = error as { message?: string }
        toast.error(
          err?.message ??
            'Não foi possível carregar os detalhes completos do serviço.'
        )
      }
    }

    if (open && mode === 'create') {
      codigoMotivoNumericoCarregadoRef.current = null
      setValues({
        designacao: '',
        tipoServicoId: '',
        preco: '',
        duracao: '',
        taxaIvaId: '',
        ean: '',
        tipoAparelhoId: '',
        motivoIsencaoId: '',
        tratDentario: false,
        inativo: false,
      })
    } else {
      void loadForViewOrEdit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `motivosIsencao` hidrata-se no efeito seguinte para não refazer GET ao chegar a lista
  }, [open, mode, isView, isEdit, viewData])

  useEffect(() => {
    const n = codigoMotivoNumericoCarregadoRef.current
    if (n == null || !open || motivosIsencao.length === 0) return

    const id = mapCodigoMotivoNumericoParaMotivoId(n, motivosIsencao)
    codigoMotivoNumericoCarregadoRef.current = null

    if (!id) return

    setValues((prev) => {
      if (prev.motivoIsencaoId === id) return prev
      return { ...prev, motivoIsencaoId: id }
    })
  }, [motivosIsencao, open])

  useEffect(() => {
    if (!open) return
    const refreshLights = () => {
      void queryClient.invalidateQueries({ queryKey: ['tipos-servico-light'] })
      void queryClient.invalidateQueries({ queryKey: ['taxas-iva-light'] })
      void queryClient.invalidateQueries({ queryKey: ['tipos-aparelho-light'] })
      void queryClient.invalidateQueries({ queryKey: ['motivos-isencao-light'] })
      void queryClient.invalidateQueries({ queryKey: ['motivos-isencao-paginated'] })
    }
    window.addEventListener('focus', refreshLights)
    return () => window.removeEventListener('focus', refreshLights)
  }, [open, queryClient])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.designacao.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    if (!values.tipoServicoId) {
      toast.error('Tipo de Serviço é obrigatório.')
      return
    }

    const precoNum = values.preco ? Number(values.preco) : undefined
    if (values.preco && Number.isNaN(precoNum)) {
      toast.error('Valor inválido para preço.')
      return
    }

    const taxaIvaZero = taxaIvaIsenta

    if (taxaIvaZero) {
      if (!values.motivoIsencaoId.trim()) {
        toast.error('Motivo de isenção é obrigatório quando a Taxa IVA é isenta.')
        return
      }
    }

    try {
      const client = ServicoService()

      const body = {
        designacao: values.designacao.trim(),
        tipoServicoId: values.tipoServicoId,
        preco: precoNum,
        duracao: values.duracao || undefined,
        taxaIvaId: values.taxaIvaId || undefined,
        ean: values.ean || undefined,
        tipoAparelhoId: values.tipoAparelhoId || undefined,
        tratDentario: values.tratDentario,
        inativo: values.inativo,
        ...(taxaIvaZero ? { motivoIsencaoId: values.motivoIsencaoId.trim() } : {}),
      }

      const rawId =
        viewData && ('id' in viewData ? viewData.id : (viewData as { Id?: string }).Id)
      const editId =
        typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : ''

      const response =
        isEdit && viewData && editId
          ? await client.updateServico(editId, { ...body, id: editId })
          : await client.createServico(body)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit ? 'Serviço atualizado com sucesso.' : 'Serviço criado com sucesso.'
        )
        const sid = new URLSearchParams(window.location.search).get('instanceId')
        if (sid) {
          clearServicoModalAuxSessionDraft(sid)
        }
        if (windowId) {
          usePagesStore.getState().updatePageState(windowId, () => ({
            servicoModalDraft: undefined,
          }))
        }
        onOpenChange(false)
        onSuccess?.()
      } else {
        const msg =
          response.info.messages?.['$']?.[0] ??
          (isEdit ? 'Falha ao atualizar serviço.' : 'Falha ao criar serviço.')
        toast.error(msg)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err?.message ?? 'Ocorreu um erro ao guardar o serviço.')
    }
  }

  const title =
    mode === 'view'
      ? 'Serviço'
      : mode === 'edit'
        ? 'Editar Serviço'
        : 'Adicionar Serviço'

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para ver, criar ou editar um serviço.
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-4 py-4 [&>*]:min-w-0'>
          <div className='col-span-1 grid gap-2'>
            <Label>Designação</Label>
            <Input
              disabled={isView}
              value={values.designacao}
              maxLength={250}
              placeholder='Designação do serviço...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, designacao: e.target.value }))
              }
            />
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Tipo de Serviço</Label>
            <div className='flex min-w-0 gap-2'>
              <div className='min-w-0 flex-1'>
                <Select
                  disabled={isView}
                  value={values.tipoServicoId}
                  onValueChange={(value) =>
                    setValues((prev) => ({ ...prev, tipoServicoId: value }))
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue
                      placeholder='Selecione o tipo de serviço...'
                      aria-label={
                        tipoServicoSelecionado
                          ? `Tipo de serviço: ${tipoServicoSelecionado.descricao}`
                          : undefined
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServico.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type='button'
                variant='secondary'
                size='icon'
                className='h-9 w-9 shrink-0'
                disabled={isView}
                title='Abrir tabela Tipos de serviço (inserção)'
                aria-label='Abrir tabela Tipos de serviço para inserir novo'
                onClick={() =>
                  openTabelaParaInsercao(ROTA_TABELA_TIPOS_SERVICO, 'Tipos de serviço')
                }
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Valor (EUR)</Label>
            <Input
              disabled={isView}
              type='number'
              step={0.01}
              value={values.preco}
              placeholder='0,00'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, preco: e.target.value }))
              }
            />
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Duração</Label>
            <Input
              disabled={isView}
              value={values.duracao}
              maxLength={50}
              placeholder='Duração (texto livre)...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, duracao: e.target.value }))
              }
            />
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Taxa IVA</Label>
            <div className='flex min-w-0 gap-2'>
              <div className='min-w-0 flex-1'>
                <Select
                  disabled={isView}
                  value={values.taxaIvaId}
                  onValueChange={(value) => {
                    const taxa = taxasIva.find((t) => t.id === value)
                    const zeraMotivo = taxa == null || Number(taxa.taxa) !== 0
                    setValues((prev) => ({
                      ...prev,
                      taxaIvaId: value,
                      motivoIsencaoId: zeraMotivo ? '' : prev.motivoIsencaoId,
                    }))
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue
                      placeholder='Selecione a taxa IVA...'
                      aria-label={
                        taxaIvaSelecionada
                          ? `Taxa IVA: ${taxaIvaSelecionada.descricao} (${taxaIvaSelecionada.taxa.toFixed(2)}%)`
                          : undefined
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {taxasIva.map((taxa) => (
                      <SelectItem key={taxa.id} value={taxa.id}>
                        {taxa.descricao} ({taxa.taxa.toFixed(2)}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type='button'
                variant='secondary'
                size='icon'
                className='h-9 w-9 shrink-0'
                disabled={isView}
                title='Abrir tabela Taxas IVA (inserção)'
                aria-label='Abrir tabela Taxas IVA para inserir novo'
                onClick={() => openTabelaParaInsercao(ROTA_TABELA_TAXAS_IVA, 'Taxas IVA')}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Tipo de Aparelho</Label>
            <div className='flex min-w-0 gap-2'>
              <div className='min-w-0 flex-1'>
                <Select
                  disabled={isView}
                  value={values.tipoAparelhoId || TIPO_APARELHO_VAZIO}
                  onValueChange={(value) =>
                    setValues((prev) => ({
                      ...prev,
                      tipoAparelhoId: value === TIPO_APARELHO_VAZIO ? '' : value,
                    }))
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Nenhum / selecionar…' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TIPO_APARELHO_VAZIO}>(Nenhum)</SelectItem>
                    {tiposAparelho.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.designacao ?? t.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type='button'
                variant='secondary'
                size='icon'
                className='h-9 w-9 shrink-0'
                disabled={isView}
                title='Abrir tabela Tipos de aparelho (inserção)'
                aria-label='Abrir tabela Tipos de aparelho para inserir novo'
                onClick={() =>
                  openTabelaParaInsercao(ROTA_TABELA_TIPOS_APARELHO, 'Tipos de aparelho')
                }
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Motivo de Isenção</Label>
            <div className='flex min-w-0 gap-2'>
              <div className='min-w-0 flex-1 overflow-hidden'>
                <Select
                  disabled={isView || !taxaIvaIsenta}
                  value={values.motivoIsencaoId}
                  onValueChange={(value) =>
                    setValues((prev) => ({ ...prev, motivoIsencaoId: value }))
                  }
                >
                  <SelectTrigger
                    className='w-full min-w-0 max-w-full'
                    title={
                      taxaIvaIsenta
                        ? motivoIsencaoSelecionado
                          ? `${motivoIsencaoSelecionado.codigo} — ${motivoIsencaoSelecionado.descricao}`
                          : undefined
                        : 'Aplicável quando a taxa IVA for isenta (0%).'
                    }
                  >
                    <SelectValue
                      placeholder={
                        taxaIvaIsenta
                          ? 'Selecione o motivo de isenção...'
                          : 'Quando IVA for isento...'
                      }
                      aria-label={
                        motivoIsencaoSelecionado
                          ? `Motivo de isenção: ${motivoIsencaoSelecionado.descricao} (${motivoIsencaoSelecionado.codigo})`
                          : undefined
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosIsencao.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type='button'
                variant='secondary'
                size='icon'
                className='h-9 w-9 shrink-0'
                disabled={isView}
                title='Abrir tabela Motivos de isenção (inserção / edição)'
                aria-label='Abrir tabela Motivos de isenção para gerir registos'
                onClick={() =>
                  openTabelaParaInsercao(ROTA_TABELA_MOTIVOS_ISENCAO, 'Motivos de isenção')
                }
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          </div>
          <div className='col-span-1 grid gap-2'>
            <Label>Cód. EAN</Label>
            <Input
              disabled={isView}
              value={values.ean}
              maxLength={50}
              placeholder='EAN...'
              onChange={(e) =>
                setValues((prev) => ({ ...prev, ean: e.target.value }))
              }
            />
          </div>
          <div className='col-span-1 flex items-center gap-2 mt-2'>
            <Checkbox
              disabled={isView}
              checked={values.tratDentario}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, tratDentario: Boolean(checked) }))
              }
            />
            <Label>Serviço Dentário</Label>
          </div>
          <div className='col-span-1 flex items-center gap-2 mt-2'>
            <Checkbox
              disabled={isView}
              checked={values.inativo}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, inativo: Boolean(checked) }))
              }
            />
            <Label>Inativo</Label>
          </div>
        </div>
        <DialogFooter>
          {isView ? (
            <Button type='button' onClick={handleClose}>
              OK
            </Button>
          ) : (
            <>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancelar
              </Button>
              <Button type='button' onClick={handleGuardar}>
                Guardar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

