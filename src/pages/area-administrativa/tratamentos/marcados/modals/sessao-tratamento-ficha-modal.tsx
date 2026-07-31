import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { TimeField } from '@/components/shared/time-field'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { SessaoTratamentoService } from '@/lib/services/tratamentos/sessao-tratamento-service'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type {
  CreateSessaoTratamentoRequest,
  SessaoTratamentoTableDTO,
} from '@/types/dtos/tratamentos/sessao-tratamento.dtos'

type Mode = 'create' | 'edit' | 'view'

type FormState = {
  numSessao: string
  data: string
  horaInic: string
  duracao: string
  fisioterapeutaId: string
  fisioterapeutaLabel: string
  auxiliarId: string
  auxiliarLabel: string
  outroTecnicoId: string
  outroTecnicoLabel: string
  faltou: boolean
  obsFalta: string
}

function emptyForm(nextNum: number): FormState {
  return {
    numSessao: String(nextNum),
    data: '',
    horaInic: '',
    duracao: '',
    fisioterapeutaId: '',
    fisioterapeutaLabel: '',
    auxiliarId: '',
    auxiliarLabel: '',
    outroTecnicoId: '',
    outroTecnicoLabel: '',
    faltou: false,
    obsFalta: '',
  }
}

function toDateInput(v?: string | null) {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

async function loadTecnicos(permId: string, tipo: number, keyword: string) {
  const res = await TecnicoService(permId).getTecnicosPaginated({
    pageNumber: 1,
    pageSize: 30,
    filters: [
      { id: 'tipoTecnico', value: String(tipo) },
      ...(keyword ? [{ id: 'nome', value: keyword }] : []),
    ],
  })
  return res.info?.data ?? []
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: Mode
  tratamentoId: string
  listPermId: string
  defaultFisioId?: string
  defaultFisioLabel?: string
  defaultAuxId?: string
  defaultAuxLabel?: string
  defaultOutroId?: string
  defaultOutroLabel?: string
  existingSessoes: SessaoTratamentoTableDTO[]
  row: SessaoTratamentoTableDTO | null
  onSaved: () => void
}

export function SessaoTratamentoFichaModal({
  open,
  onOpenChange,
  mode,
  tratamentoId,
  listPermId,
  defaultFisioId = '',
  defaultFisioLabel = '',
  defaultAuxId = '',
  defaultAuxLabel = '',
  defaultOutroId = '',
  defaultOutroLabel = '',
  existingSessoes,
  row,
  onSaved,
}: Props) {
  const readOnly = mode === 'view'
  const nextNum =
    existingSessoes.reduce((m, s) => Math.max(m, s.numSessao ?? 0), 0) + 1

  const [form, setForm] = useState<FormState>(() => emptyForm(nextNum))
  const [saving, setSaving] = useState(false)
  const [fisioSearch, setFisioSearch] = useState('')
  const [auxSearch, setAuxSearch] = useState('')
  const [outroSearch, setOutroSearch] = useState('')
  const [debouncedFisio] = useDebounce(fisioSearch, 300)
  const [debouncedAux] = useDebounce(auxSearch, 300)
  const [debouncedOutro] = useDebounce(outroSearch, 300)

  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      setForm({
        ...emptyForm(nextNum),
        fisioterapeutaId: defaultFisioId,
        fisioterapeutaLabel: defaultFisioLabel,
        auxiliarId: defaultAuxId,
        auxiliarLabel: defaultAuxLabel,
        outroTecnicoId: defaultOutroId,
        outroTecnicoLabel: defaultOutroLabel,
      })
      return
    }

    if (!row) return

    void (async () => {
      const res = await SessaoTratamentoService(listPermId).getById(row.id)
      const dto =
        res.info?.status === ResponseStatus.Success ? res.info.data : null
      if (!dto) {
        toast.error('Não foi possível carregar a sessão.')
        return
      }

      const loadNome = async (tecnicoId?: string | null) => {
        if (!tecnicoId) return ''
        try {
          const t = await TecnicoService(listPermId).getTecnico(tecnicoId)
          return t.info?.data?.nome ?? ''
        } catch {
          return ''
        }
      }

      const fisioterapeutaLabel = await loadNome(dto.fisioterapeutaId)
      const auxiliarLabel = await loadNome(dto.auxiliarId)
      const outroTecnicoLabel = await loadNome(dto.outroTecnicoId)

      setForm({
        numSessao: dto.numSessao != null ? String(dto.numSessao) : '',
        data: toDateInput(dto.data),
        horaInic: dto.horaInic ?? dto.horaFisio ?? '',
        duracao: dto.duracao ?? dto.duracaoFisio ?? '',
        fisioterapeutaId: dto.fisioterapeutaId ?? '',
        fisioterapeutaLabel,
        auxiliarId: dto.auxiliarId ?? '',
        auxiliarLabel,
        outroTecnicoId: dto.outroTecnicoId ?? '',
        outroTecnicoLabel,
        faltou: dto.faltou === 1,
        obsFalta: dto.obsFalta ?? '',
      })
    })()
  }, [
    open,
    mode,
    row,
    nextNum,
    listPermId,
    defaultFisioId,
    defaultFisioLabel,
    defaultAuxId,
    defaultAuxLabel,
    defaultOutroId,
    defaultOutroLabel,
  ])

  const fisiosQuery = useQuery({
    queryKey: ['sessao-modal', 'fisio', debouncedFisio],
    queryFn: () =>
      loadTecnicos(listPermId, TIPO_TECNICO.Fisioterapeuta, debouncedFisio),
    enabled: open && !readOnly,
  })
  const auxQuery = useQuery({
    queryKey: ['sessao-modal', 'aux', debouncedAux],
    queryFn: () =>
      loadTecnicos(listPermId, TIPO_TECNICO.Auxiliar, debouncedAux),
    enabled: open && !readOnly,
  })
  const outroQuery = useQuery({
    queryKey: ['sessao-modal', 'outro', debouncedOutro],
    queryFn: () => loadTecnicos(listPermId, TIPO_TECNICO.Outro, debouncedOutro),
    enabled: open && !readOnly,
  })

  const mapTec = (list: Array<{ id: string; nome?: string | null }>) =>
    list.map((t) => ({ value: t.id, label: t.nome ?? t.id }))

  const fisioItems = useMemo(() => {
    const items = mapTec(fisiosQuery.data ?? [])
    if (
      form.fisioterapeutaId &&
      !items.some((i) => i.value === form.fisioterapeutaId)
    ) {
      items.unshift({
        value: form.fisioterapeutaId,
        label: form.fisioterapeutaLabel || form.fisioterapeutaId,
      })
    }
    return items
  }, [fisiosQuery.data, form.fisioterapeutaId, form.fisioterapeutaLabel])

  const auxItems = useMemo(() => {
    const items = mapTec(auxQuery.data ?? [])
    if (form.auxiliarId && !items.some((i) => i.value === form.auxiliarId)) {
      items.unshift({
        value: form.auxiliarId,
        label: form.auxiliarLabel || form.auxiliarId,
      })
    }
    return items
  }, [auxQuery.data, form.auxiliarId, form.auxiliarLabel])

  const outroItems = useMemo(() => {
    const items = mapTec(outroQuery.data ?? [])
    if (
      form.outroTecnicoId &&
      !items.some((i) => i.value === form.outroTecnicoId)
    ) {
      items.unshift({
        value: form.outroTecnicoId,
        label: form.outroTecnicoLabel || form.outroTecnicoId,
      })
    }
    return items
  }, [outroQuery.data, form.outroTecnicoId, form.outroTecnicoLabel])

  const title =
    mode === 'create'
      ? 'Nova sessão'
      : mode === 'edit'
        ? 'Editar sessão'
        : 'Ver sessão'

  const buildPayload = (): CreateSessaoTratamentoRequest => {
    const hora = form.horaInic.trim() || null
    const dur = form.duracao.trim() || null
    return {
      tratamentoId,
      numSessao: form.numSessao.trim() ? Number(form.numSessao) : null,
      data: form.data || null,
      horaInic: hora,
      duracao: dur,
      fisioterapeutaId: form.fisioterapeutaId || null,
      auxiliarId: form.auxiliarId || null,
      outroTecnicoId: form.outroTecnicoId || null,
      horaFisio: form.fisioterapeutaId ? hora : null,
      horaAux: form.auxiliarId ? hora : null,
      horaOutro: form.outroTecnicoId ? hora : null,
      duracaoFisio: form.fisioterapeutaId ? dur : null,
      duracaoAux: form.auxiliarId ? dur : null,
      duracaoOutro: form.outroTecnicoId ? dur : null,
      faltou: form.faltou ? 1 : 0,
      obsFalta: form.obsFalta.trim() || null,
      sendEmail: false,
    }
  }

  const handleSave = async () => {
    if (readOnly) return
    if (!form.data.trim()) {
      toast.error('A data da sessão é obrigatória.')
      return
    }
    if (!form.fisioterapeutaId && !form.auxiliarId && !form.outroTecnicoId) {
      toast.error('Seleccione pelo menos um técnico.')
      return
    }

    setSaving(true)
    try {
      const payload = buildPayload()
      const res =
        mode === 'create'
          ? await SessaoTratamentoService(listPermId).create(payload)
          : await SessaoTratamentoService(listPermId).update(row!.id, payload)

      if (res.info?.status === ResponseStatus.Success) {
        toast.success(
          mode === 'create' ? 'Sessão criada.' : 'Sessão actualizada.'
        )
        onOpenChange(false)
        onSaved()
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível guardar a sessão.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao guardar a sessão.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <Label>N.º sessão</Label>
            <Input value={form.numSessao} disabled />
          </div>
          <div className='space-y-1.5'>
            <Label>Data *</Label>
            <Input
              type='date'
              value={form.data}
              disabled={readOnly}
              onChange={(e) =>
                setForm((p) => ({ ...p, data: e.target.value }))
              }
            />
          </div>
          <div className='space-y-1.5'>
            <Label>Hora início</Label>
            <TimeField
              value={form.horaInic}
              disabled={readOnly}
              placeholder='HH:mm'
              onChange={(v) => setForm((p) => ({ ...p, horaInic: v }))}
            />
          </div>
          <div className='space-y-1.5'>
            <Label>Duração</Label>
            <TimeField
              value={form.duracao}
              disabled={readOnly}
              placeholder='HH:mm'
              onChange={(v) => setForm((p) => ({ ...p, duracao: v }))}
            />
          </div>

          <div className='space-y-1.5 sm:col-span-2'>
            <Label>Fisioterapeuta</Label>
            <AsyncCombobox
              value={form.fisioterapeutaId}
              disabled={readOnly}
              onChange={(id) => {
                const label =
                  fisioItems.find((i) => i.value === id)?.label ?? ''
                setForm((p) => ({
                  ...p,
                  fisioterapeutaId: id,
                  fisioterapeutaLabel: label,
                }))
              }}
              searchValue={fisioSearch}
              onSearchValueChange={setFisioSearch}
              items={fisioItems}
              isLoading={fisiosQuery.isFetching}
              placeholder='Seleccionar…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
          </div>
          <div className='space-y-1.5 sm:col-span-2'>
            <Label>Auxiliar</Label>
            <AsyncCombobox
              value={form.auxiliarId}
              disabled={readOnly}
              onChange={(id) => {
                const label = auxItems.find((i) => i.value === id)?.label ?? ''
                setForm((p) => ({
                  ...p,
                  auxiliarId: id,
                  auxiliarLabel: label,
                }))
              }}
              searchValue={auxSearch}
              onSearchValueChange={setAuxSearch}
              items={auxItems}
              isLoading={auxQuery.isFetching}
              placeholder='Seleccionar…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
          </div>
          <div className='space-y-1.5 sm:col-span-2'>
            <Label>Terapeuta Ocup./Fala</Label>
            <AsyncCombobox
              value={form.outroTecnicoId}
              disabled={readOnly}
              onChange={(id) => {
                const label =
                  outroItems.find((i) => i.value === id)?.label ?? ''
                setForm((p) => ({
                  ...p,
                  outroTecnicoId: id,
                  outroTecnicoLabel: label,
                }))
              }}
              searchValue={outroSearch}
              onSearchValueChange={setOutroSearch}
              items={outroItems}
              isLoading={outroQuery.isFetching}
              placeholder='Seleccionar…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
          </div>

          <label className='flex items-center gap-2 text-sm sm:col-span-2'>
            <Checkbox
              checked={form.faltou}
              disabled={readOnly}
              onCheckedChange={(v) =>
                setForm((p) => ({ ...p, faltou: v === true }))
              }
            />
            Faltou
          </label>
          {form.faltou ? (
            <div className='space-y-1.5 sm:col-span-2'>
              <Label>Observações da falta</Label>
              <Textarea
                rows={3}
                value={form.obsFalta}
                disabled={readOnly}
                onChange={(e) =>
                  setForm((p) => ({ ...p, obsFalta: e.target.value }))
                }
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {readOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!readOnly ? (
            <Button
              type='button'
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? 'A guardar…' : 'Guardar'}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
