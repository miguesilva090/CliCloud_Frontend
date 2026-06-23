import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { SubsistemaArtigoTableDTO } from '@/types/dtos/stocks/subsistema-artigo.dtos'
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
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import { SubsistemaArtigoService } from '@/lib/services/stocks/subsistema-artigo-service'
import { ArtigoService } from '@/lib/services/stocks/artigo-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { ResponseStatus } from '@/types/api/responses'
import {
  formatMoney,
  parseMoney,
  recalcFromMargem,
  recalcFromValorOrganismo,
  recalcFromValorUtente,
  suggestCodigoCartaoInstituicao,
} from '../utils/subsistema-artigo-precos-utils'

type ModalMode = 'view' | 'create' | 'edit'

interface SubsistemaArtigoViewCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ModalMode
  viewData: SubsistemaArtigoTableDTO | null
  onSuccess?: () => void
}

type FormValues = {
  artigoId: string
  organismoId: string
  codigoCartaoInstituicao: string
  valorServico: string
  valorOrganismo: string
  margemOrganismoPercent: string
  valorUtente: string
  codigoComplementarAdse: string
  inativo: boolean
}

const emptyValues: FormValues = {
  artigoId: '',
  organismoId: '',
  codigoCartaoInstituicao: '',
  valorServico: '0.00',
  valorOrganismo: '0.00',
  margemOrganismoPercent: '0.00',
  valorUtente: '0.00',
  codigoComplementarAdse: '',
  inativo: false,
}

function resolveRowId(data: SubsistemaArtigoTableDTO | null): string {
  if (!data) return ''
  const raw = 'id' in data ? data.id : (data as { Id?: string }).Id
  return typeof raw === 'string' ? raw : raw != null ? String(raw) : ''
}

export function SubsistemaArtigoViewCreateModal({
  open,
  onOpenChange,
  mode,
  viewData,
  onSuccess,
}: SubsistemaArtigoViewCreateModalProps) {
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [loading, setLoading] = useState(false)
  const [artigoCodigo, setArtigoCodigo] = useState<number | undefined>()

  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  const isCreate = mode === 'create'
  const keysLocked = isView || isEdit

  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)

  const { data: artigosResponse } = useQuery({
    queryKey: ['artigos-light-subsistema-artigo', { open }],
    queryFn: () => ArtigoService().getArtigosLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const { data: organismosResponse } = useQuery({
    queryKey: ['organismos-light-subsistema-artigo', { open }],
    queryFn: () => OrganismoService().getOrganismoLight(),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })

  const artigos = artigosResponse?.info?.data ?? []
  const organismos = organismosResponse?.info?.data ?? []

  const applyCartaoSuggestion = useCallback(
    (
      next: Pick<FormValues, 'artigoId' | 'organismoId' | 'codigoCartaoInstituicao'>,
      codigo?: number,
    ) => {
      if (next.codigoCartaoInstituicao.trim()) return next.codigoCartaoInstituicao
      const suggested = suggestCodigoCartaoInstituicao(
        next.organismoId,
        codigo ?? artigoCodigo,
        organismos,
      )
      return suggested
    },
    [artigoCodigo, organismos],
  )

  const loadArtigoPreco = useCallback(async (artigoId: string) => {
    if (!artigoId) return
    try {
      const resp = await ArtigoService().getArtigoById(artigoId)
      const dto = resp.info.data
      if (!dto) return

      setArtigoCodigo(dto.codigo)
      const preco = dto.precoVendaComIva1 ?? 0
      setValues((prev) => {
        const cartao = applyCartaoSuggestion(prev, dto.codigo)
        return {
          ...prev,
          valorServico: formatMoney(preco),
          valorOrganismo: '0.00',
          margemOrganismoPercent: '0.00',
          valorUtente: formatMoney(preco),
          codigoCartaoInstituicao: cartao || prev.codigoCartaoInstituicao,
        }
      })
    } catch {
      // mantém valores actuais
    }
  }, [applyCartaoSuggestion])

  useEffect(() => {
    if (!open) return

    if (isCreate) {
      setValues(emptyValues)
      setArtigoCodigo(undefined)
      return
    }

    const rowId = resolveRowId(viewData)
    if (!rowId) return

    let cancelled = false
    setLoading(true)

    void (async () => {
      try {
        const response =
          await SubsistemaArtigoService().getSubsistemaArtigoById(rowId)
        if (cancelled) return

        if (
          response.info.status !== ResponseStatus.Success ||
          !response.info.data
        ) {
          toast.error(
            response.info.messages?.['$']?.[0] ??
              'Não foi possível carregar o subsistema de artigo.',
          )
          return
        }

        const dto = response.info.data
        setArtigoCodigo(dto.artigoCodigo ?? undefined)
        setValues({
          artigoId: dto.artigoId ?? '',
          organismoId: dto.organismoId ?? '',
          codigoCartaoInstituicao: dto.codigoCartaoInstituicao ?? '',
          valorServico:
            dto.valorServico != null ? formatMoney(dto.valorServico) : '0.00',
          valorOrganismo:
            dto.valorOrganismo != null ? formatMoney(dto.valorOrganismo) : '0.00',
          margemOrganismoPercent:
            dto.margemOrganismoPercent != null
              ? formatMoney(dto.margemOrganismoPercent)
              : '0.00',
          valorUtente:
            dto.valorUtente != null ? formatMoney(dto.valorUtente) : '0.00',
          codigoComplementarAdse: dto.codigoComplementarAdse ?? '',
          inativo: dto.inativo ?? false,
        })
      } catch (error: unknown) {
        if (!cancelled) {
          const err = error as { message?: string }
          toast.error(err?.message ?? 'Erro ao carregar subsistema de artigo.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, isCreate, viewData])

  const handleClose = () => onOpenChange(false)

  const handleArtigoChange = (artigoId: string) => {
    const artigo = artigos.find((a) => a.id === artigoId)
    setArtigoCodigo(artigo?.codigo)
    setValues((prev) => {
      const next = { ...prev, artigoId }
      const cartao = applyCartaoSuggestion(next, artigo?.codigo)
      return { ...next, codigoCartaoInstituicao: cartao || prev.codigoCartaoInstituicao }
    })
    void loadArtigoPreco(artigoId)
  }

  const handleOrganismoChange = (organismoId: string) => {
    setValues((prev) => {
      const next = { ...prev, organismoId }
      const cartao = applyCartaoSuggestion(next)
      return { ...next, codigoCartaoInstituicao: cartao || prev.codigoCartaoInstituicao }
    })
  }

  const handleValorServicoChange = (raw: string) => {
    const valorServico = parseMoney(raw)
    if (Number.isNaN(valorServico)) return
    const calc = recalcFromMargem(
      valorServico,
      parseMoney(values.margemOrganismoPercent),
    )
    setValues((prev) => ({
      ...prev,
      valorServico: raw,
      valorOrganismo: formatMoney(calc.valorOrganismo),
      valorUtente: formatMoney(calc.valorUtente),
      margemOrganismoPercent: formatMoney(calc.margemOrganismoPercent),
    }))
  }

  const handleMargemChange = (raw: string) => {
    const valorServico = parseMoney(values.valorServico)
    const margem = parseMoney(raw)
    if (Number.isNaN(margem)) return
    const calc = recalcFromMargem(valorServico, margem)
    setValues((prev) => ({
      ...prev,
      margemOrganismoPercent: raw,
      valorOrganismo: formatMoney(calc.valorOrganismo),
      valorUtente: formatMoney(calc.valorUtente),
    }))
  }

  const handleValorOrganismoChange = (raw: string) => {
    const valorServico = parseMoney(values.valorServico)
    const valorOrganismo = parseMoney(raw)
    if (Number.isNaN(valorOrganismo)) return
    if (valorOrganismo > valorServico) {
      toast.error('O valor do organismo não pode ser superior ao valor do serviço.')
      return
    }
    const calc = recalcFromValorOrganismo(valorServico, valorOrganismo)
    setValues((prev) => ({
      ...prev,
      valorOrganismo: raw,
      margemOrganismoPercent: formatMoney(calc.margemOrganismoPercent),
      valorUtente: formatMoney(calc.valorUtente),
    }))
  }

  const handleValorUtenteChange = (raw: string) => {
    const valorServico = parseMoney(values.valorServico)
    const valorUtente = parseMoney(raw)
    if (Number.isNaN(valorUtente)) return
    if (valorUtente > valorServico) {
      toast.error('O valor do utente não pode ser superior ao valor do serviço.')
      return
    }
    const calc = recalcFromValorUtente(valorServico, valorUtente)
    setValues((prev) => ({
      ...prev,
      valorUtente: raw,
      margemOrganismoPercent: formatMoney(calc.margemOrganismoPercent),
      valorOrganismo: formatMoney(calc.valorOrganismo),
    }))
  }

  const handleGuardar = async () => {
    if (isView) return

    if (!values.artigoId.trim() || !values.organismoId.trim()) {
      toast.error('Artigo e Organismo são obrigatórios.')
      return
    }

    if (isEdit && !values.codigoCartaoInstituicao.trim()) {
      toast.error('Cartão instituição é obrigatório.')
      return
    }

    const valorServico = parseMoney(values.valorServico)
    const valorOrganismo = parseMoney(values.valorOrganismo)
    const margemOrganismoPercent = parseMoney(values.margemOrganismoPercent)
    const valorUtente = parseMoney(values.valorUtente)

    if (
      [valorServico, valorOrganismo, margemOrganismoPercent, valorUtente].some(
        Number.isNaN,
      )
    ) {
      toast.error('Valores numéricos inválidos.')
      return
    }

    try {
      const client = SubsistemaArtigoService()
      const editId = resolveRowId(viewData)

      const codigoCartaoInstituicao =
        values.codigoCartaoInstituicao.trim() ||
        applyCartaoSuggestion(values, artigoCodigo)

      const updateBody = {
        codigoCartaoInstituicao,
        valorServico,
        valorOrganismo,
        margemOrganismoPercent,
        valorUtente,
        inativo: values.inativo,
        codigoComplementarAdse: values.codigoComplementarAdse.trim() || null,
      }

      const createBody = {
        artigoId: values.artigoId.trim(),
        organismoId: values.organismoId.trim(),
        ...updateBody,
      }

      const response =
        isEdit && editId
          ? await client.updateSubsistemaArtigo(editId, updateBody)
          : await client.createSubsistemaArtigo(createBody)

      if (response.info.status === ResponseStatus.Success) {
        toast.success(
          isEdit
            ? 'Subsistema de artigo atualizado com sucesso.'
            : 'Subsistema de artigo criado com sucesso.',
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(
          response.info.messages?.['$']?.[0] ??
            (isEdit
              ? 'Falha ao atualizar subsistema de artigo.'
              : 'Falha ao criar subsistema de artigo.'),
        )
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o subsistema de artigo.',
      )
    }
  }

  const title =
    mode === 'view'
      ? 'Subsistema de Artigo'
      : mode === 'edit'
        ? 'Editar Subsistema de Artigo'
        : 'Adicionar Subsistema de Artigo'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário de subsistema de artigo.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='py-6 text-sm text-muted-foreground'>A carregar...</p>
        ) : (
          <div className='grid grid-cols-1 gap-4 py-2 md:grid-cols-2'>
            <div className='grid gap-2'>
              <Label>Cartão Instituição</Label>
              <Input
                disabled={isView}
                maxLength={20}
                value={values.codigoCartaoInstituicao}
                onChange={(e) =>
                  setValues((p) => ({
                    ...p,
                    codigoCartaoInstituicao: e.target.value,
                  }))
                }
              />
            </div>

            <div className='grid gap-2'>
              <Label>Código Complementar ADSE</Label>
              <Input
                disabled={isView}
                maxLength={10}
                value={values.codigoComplementarAdse}
                onChange={(e) =>
                  setValues((p) => ({
                    ...p,
                    codigoComplementarAdse: e.target.value,
                  }))
                }
              />
            </div>

            <div className='grid gap-2'>
              <Label>Artigo</Label>
              <div className='flex gap-2'>
                <Select
                  disabled={keysLocked}
                  value={values.artigoId}
                  onValueChange={handleArtigoChange}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecione o artigo...' />
                  </SelectTrigger>
                  <SelectContent>
                    {artigos.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.autocompleteLabel ?? `${a.numeroArtigo} - ${a.descricao}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isView && !isEdit && (
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='h-9 w-9 flex-shrink-0'
                    onClick={() =>
                      openPathInApp(
                        navigate,
                        addWindow,
                        '/area-financeira/faturacao/tabelas/artigos/artigos',
                        'Artigos',
                      )
                    }
                    title='Abrir página de Artigos'
                  >
                    +
                  </Button>
                )}
              </div>
            </div>

            <div className='grid gap-2'>
              <Label>Organismo</Label>
              <div className='flex gap-2'>
                <Select
                  disabled={keysLocked}
                  value={values.organismoId}
                  onValueChange={handleOrganismoChange}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecione o organismo...' />
                  </SelectTrigger>
                  <SelectContent>
                    {organismos.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.nome ?? o.nomeComercial ?? o.abreviatura ?? o.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isView && !isEdit && (
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    className='h-9 w-9 flex-shrink-0'
                    onClick={() =>
                      openPathInApp(
                        navigate,
                        addWindow,
                        '/area-comum/tabelas/entidades/organismos',
                        'Organismos',
                      )
                    }
                    title='Abrir página de Organismos'
                  >
                    +
                  </Button>
                )}
              </div>
            </div>

            <div className='grid gap-2'>
              <Label>Val. Serv. (EUR)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.valorServico}
                onChange={(e) => handleValorServicoChange(e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label>Val. Org. (EUR)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.valorOrganismo}
                onChange={(e) => handleValorOrganismoChange(e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label>Val. Utente (EUR)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.valorUtente}
                onChange={(e) => handleValorUtenteChange(e.target.value)}
              />
            </div>

            <div className='grid gap-2'>
              <Label>Margem Org. (%)</Label>
              <Input
                disabled={isView}
                type='number'
                step={0.01}
                value={values.margemOrganismoPercent}
                onChange={(e) => handleMargemChange(e.target.value)}
              />
            </div>

            <div className='flex items-center gap-2 md:col-span-2'>
              <Checkbox
                disabled={isView}
                checked={values.inativo}
                onCheckedChange={(checked) =>
                  setValues((p) => ({ ...p, inativo: Boolean(checked) }))
                }
              />
              <Label>Inativo</Label>
            </div>
          </div>
        )}

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
              <Button type='button' onClick={() => void handleGuardar()}>
                Guardar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}