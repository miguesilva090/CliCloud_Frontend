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
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { ServicoTratamentoService } from '@/lib/services/tratamentos/servico-tratamento-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type {
  CreateServicoTratamentoRequest,
  ServicoTratamentoTableDTO,
} from '@/types/dtos/tratamentos/servico-tratamento.dtos'
import { TimeField } from '@/components/shared/time-field'

type Mode = 'create' | 'edit' | 'view'

type FormState = {
  servicoId: string
  servicoLabel: string
  duracao: string
  ordem: string
  usaFisioter: boolean
  usaAuxiliar: boolean
  usaOutro: boolean
  preco: string
  valorUt: string
  obs: string
}

function emptyForm(nextOrdem: number): FormState {
  return {
    servicoId: '',
    servicoLabel: '',
    duracao: '',
    ordem: String(nextOrdem),
    usaFisioter: true,
    usaAuxiliar: false,
    usaOutro: false,
    preco: '',
    valorUt: '',
    obs: '',
  }
}

function parseOptDecimal(raw: string): number | null {
  const t = raw.trim().replace(',', '.')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  mode: Mode
  tratamentoId: string
  listPermId: string
  existing: ServicoTratamentoTableDTO[]
  row: ServicoTratamentoTableDTO | null
  onSaved: () => void
}

export function ServicoTratamentoFichaModal({
  open,
  onOpenChange,
  mode,
  tratamentoId,
  listPermId,
  existing,
  row,
  onSaved,
}: Props) {
  const readOnly = mode === 'view'
  const [form, setForm] = useState<FormState>(emptyForm(1))
  const [saving, setSaving] = useState(false)
  const [servicoSearch, setServicoSearch] = useState('')
  const [debouncedSearch] = useDebounce(servicoSearch, 300)

  const nextOrdem =
    existing.reduce((m, s) => Math.max(m, s.ordem ?? 0), 0) + 1

  const servicosQuery = useQuery({
    queryKey: ['trat-ficha-servicos-light', debouncedSearch],
    queryFn: () => ServicoService(listPermId).getServicoLight(debouncedSearch),
    enabled: open && !readOnly,
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'create' || !row) {
      setForm(emptyForm(nextOrdem))
      setServicoSearch('')
      return
    }

    let cancelled = false
    const run = async () => {
      try {
        const res = await ServicoTratamentoService(listPermId).getById(row.id)
        const dto = res.info?.data
        if (!dto || cancelled) return
        setForm({
          servicoId: dto.servicoId ?? '',
          servicoLabel:
            row.servicoDesignacao?.trim() || dto.servicoId?.slice(0, 8) || '',
          duracao: dto.duracao ?? '',
          ordem: dto.ordem != null ? String(dto.ordem) : '',
          usaFisioter: dto.usaFisioter === 1,
          usaAuxiliar: dto.usaAuxiliar === 1,
          usaOutro: dto.usaOutro === 1,
          preco: dto.preco != null ? String(dto.preco) : '',
          valorUt: dto.valorUt != null ? String(dto.valorUt) : '',
          obs: dto.obs ?? '',
        })
      } catch {
        if (cancelled) return
        setForm({
          ...emptyForm(row.ordem ?? 1),
          servicoId: row.servicoId ?? '',
          servicoLabel: row.servicoDesignacao ?? '',
          duracao: row.duracao ?? '',
          ordem: row.ordem != null ? String(row.ordem) : '',
          usaFisioter: row.usaFisioter === 1,
          usaAuxiliar: row.usaAuxiliar === 1,
          usaOutro: row.usaOutro === 1,
          preco: row.preco != null ? String(row.preco) : '',
          valorUt: row.valorUt != null ? String(row.valorUt) : '',
        })
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [open, mode, row, listPermId, nextOrdem])

  const servicoItems = useMemo(() => {
    const list = servicosQuery.data?.info?.data ?? []
    const mapped = list.map((s) => ({
      value: s.id,
      label: s.designacao,
      secondary: s.ean ?? s.id.slice(0, 8),
    }))
    if (
      form.servicoId &&
      !mapped.some((i) => i.value === form.servicoId)
    ) {
      mapped.unshift({
        value: form.servicoId,
        label: form.servicoLabel || form.servicoId,
        secondary: form.servicoId.slice(0, 8),
      })
    }
    return mapped
  }, [servicosQuery.data, form.servicoId, form.servicoLabel])

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const buildPayload = (): CreateServicoTratamentoRequest | null => {
    if (!form.servicoId.trim()) {
      toast.error('Seleccione o serviço.')
      return null
    }
    return {
      tratamentoId,
      servicoId: form.servicoId,
      duracao: form.duracao.trim() || null,
      ordem: form.ordem.trim() ? Number(form.ordem) : null,
      usaFisioter: form.usaFisioter ? 1 : 0,
      usaAuxiliar: form.usaAuxiliar ? 1 : 0,
      usaOutro: form.usaOutro ? 1 : 0,
      preco: parseOptDecimal(form.preco),
      valorUt: parseOptDecimal(form.valorUt),
      obs: form.obs.trim() || null,
      sessaoTratamentoId: null,
    }
  }

  const handleSave = async () => {
    if (readOnly) return
    const payload = buildPayload()
    if (!payload) return
    setSaving(true)
    try {
      const svc = ServicoTratamentoService(listPermId)
      const res =
        mode === 'create'
          ? await svc.create(payload)
          : await svc.update(row!.id, payload)
      if (res.info?.status === ResponseStatus.Success) {
        toast.success(
          mode === 'create' ? 'Serviço adicionado.' : 'Serviço actualizado.'
        )
        onOpenChange(false)
        onSaved()
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível guardar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Erro ao guardar.')
    } finally {
      setSaving(false)
    }
  }

  const title =
    mode === 'create'
      ? 'Inserir serviço prescrito'
      : mode === 'edit'
        ? 'Editar serviço prescrito'
        : 'Ver serviço prescrito'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-lg overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div className='space-y-1.5'>
            <Label>Serviço *</Label>
            <AsyncCombobox
              value={form.servicoId}
              disabled={readOnly}
              onChange={(v) => {
                const hit = servicoItems.find((i) => i.value === v)
                setForm((prev) => ({
                  ...prev,
                  servicoId: v,
                  servicoLabel: hit?.label ?? '',
                }))
                if (!v || readOnly || mode !== 'create') return
                void (async () => {
                  try {
                    const res = await ServicoService(listPermId).getServico(v)
                    const dto = res.info?.data
                    if (!dto) return
                    setForm((prev) => ({
                      ...prev,
                      duracao: dto.duracao ?? prev.duracao,
                      preco: dto.preco != null ? String(dto.preco) : prev.preco,
                      valorUt:
                        dto.preco != null ? String(dto.preco) : prev.valorUt,
                    }))
                  } catch {
                    /* mantém valores manuais */
                  }
                })()
              }}
              items={servicoItems}
              searchValue={servicoSearch}
              onSearchValueChange={setServicoSearch}
              isLoading={servicosQuery.isFetching}
              placeholder='Seleccionar serviço…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>Duração</Label>
              <TimeField
                value = {form.duracao}
                disabled = {readOnly}
                placeholder = 'HH:mm'
                onChange={(v) => patch('duracao', v)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Ordem</Label>
              <Input
                type='number'
                value={form.ordem}
                disabled={readOnly}
                onChange={(e) => patch('ordem', e.target.value)}
              />
            </div>
          </div>

          <div className='flex flex-wrap gap-4'>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox
                checked={form.usaFisioter}
                disabled={readOnly}
                onCheckedChange={(v) => patch('usaFisioter', v === true)}
              />
              Fisioterapeuta
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox
                checked={form.usaAuxiliar}
                disabled={readOnly}
                onCheckedChange={(v) => patch('usaAuxiliar', v === true)}
              />
              Auxiliar
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox
                checked={form.usaOutro}
                disabled={readOnly}
                onCheckedChange={(v) => patch('usaOutro', v === true)}
              />
              Outro
            </label>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label>Preço</Label>
              <Input
                value={form.preco}
                disabled={readOnly}
                onChange={(e) => patch('preco', e.target.value)}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Valor utente</Label>
              <Input
                value={form.valorUt}
                disabled={readOnly}
                onChange={(e) => patch('valorUt', e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label>Observações</Label>
            <Textarea
              value={form.obs}
              disabled={readOnly}
              rows={3}
              onChange={(e) => patch('obs', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Fechar
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
