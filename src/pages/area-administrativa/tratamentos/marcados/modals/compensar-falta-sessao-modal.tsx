import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AsyncCombobox , type ComboboxItem } from '@/components/shared/async-combobox'
import { TimeField } from '@/components/shared/time-field'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { SessaoTratamentoService } from '@/lib/services/tratamentos/sessao-tratamento-service'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { SessaoTratamentoTableDTO } from '@/types/dtos/tratamentos/sessao-tratamento.dtos'

type Props = {
    open: boolean
    onOpenChange: (o: boolean) => void
    tratamentoId: string
    listPermId: string
    sessoes: SessaoTratamentoTableDTO[]
    defaultFisioId?: string
    defaultFisioLabel?: string 
    defaultAuxId?: string
    defaultAuxLabel?: string
    defaultOutroId?: string
    defaultOutroLabel?: string
    defaultDuracao?: string
    onSaved: () => void
}

function withSelected(items: ComboboxItem[], id: string, label: string) {
    if (!id) return items
    if (items.some((i) => i.value === id)) return items
    return [{ value: id, label: label || id}, ...items]
}

function suggestData(sessoes: SessaoTratamentoTableDTO[]) {
    const datas = sessoes
        .map((s) => s.data)
        .filter(Boolean)
        .map((d) => new Date(d!))
        .filter((d) => !Number.isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime())

    const base = datas.length ? datas[datas.length - 1] : new Date()
    const next = new Date(base)
    next.setDate(next.getDate() + 1)
    const y = next.getFullYear()
    const m = String(next.getMonth() + 1).padStart(2, '0')
    const day = String(next.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

async function loadTecnicos(tipo: number, keyword: string, perm: string) {
    const res = await TecnicoService(perm).getTecnicosPaginated({
        pageNumber: 1,
        pageSize: 30,
        filters: [
            { id: 'tipoTecnico', value: String(tipo) },
            ...(keyword ? [{ id: 'nome', value: keyword }] : []),
        ],
    })
    return res.info?.data ?? []
}

export function CompensarFaltaSessaoModal({
    open, 
    onOpenChange,
    tratamentoId,
    listPermId,
    sessoes,
    defaultFisioId = '',
    defaultFisioLabel = '',
    defaultAuxId = '',
    defaultAuxLabel = '',
    defaultOutroId = '',
    defaultOutroLabel = '',
    defaultDuracao = '01:00',
    onSaved,
}: Props) {
    const [data, setData] = useState('')
    const [usaFisio, setUsaFisio] = useState(!!defaultFisioId)
    const [fisioId, setFisioId] = useState(defaultFisioId)
    const [fisioLabel, setFisioLabel] = useState(defaultFisioLabel)
    const [horaFisio, setHoraFisio] = useState('')
    const [durFisio, setDurFisio] = useState(defaultDuracao)
    const [usaAux, setUsaAux] = useState(!!defaultAuxId)
    const [auxId, setAuxId] = useState(defaultAuxId)
    const [auxLabel, setAuxLabel] = useState(defaultAuxLabel)
    const [horaAux, setHoraAux] = useState('')
    const [durAux, setDurAux] = useState(defaultDuracao)
    const [usaOutro, setUsaOutro] = useState(!!defaultOutroId)
    const [outroId, setOutroId] = useState(defaultOutroId)
    const [outroLabel, setOutroLabel] = useState(defaultOutroLabel)
    const [horaOutro, setHoraOutro] = useState('')
    const [durOutro, setDurOutro] = useState(defaultDuracao)
    const [fisioSearch, setFisioSearch] = useState('')
    const [auxSearch, setAuxSearch] = useState('')
    const [outroSearch, setOutroSearch] = useState('')
    const [saving, setSaving] = useState(false)

    const [dFisio] = useDebounce(fisioSearch, 300)
    const [dAux] = useDebounce(auxSearch, 300)
    const [dOutro] = useDebounce(outroSearch, 300)

    useEffect(() => {
        if (!open) return
        setData(suggestData(sessoes))
        setUsaFisio(!!defaultFisioId)
        setFisioId(defaultFisioId)
        setFisioLabel(defaultFisioLabel)
        setHoraFisio('')
        setDurFisio(defaultDuracao || '01:00')
        setUsaAux(!!defaultAuxId)
        setAuxId(defaultAuxId)
        setAuxLabel(defaultAuxLabel)
        setHoraAux('')
        setDurAux(defaultDuracao || '01:00')
        setUsaOutro(!!defaultOutroId)
        setOutroId(defaultOutroId)
        setOutroLabel(defaultOutroLabel)
        setHoraOutro('')
        setDurOutro(defaultDuracao || '01:00')
    }, [
        open,
        sessoes,
        defaultFisioId,
        defaultFisioLabel,
        defaultAuxId,
        defaultAuxLabel,
        defaultOutroId,
        defaultOutroLabel,
        defaultDuracao,
    ])

    const fisioQ = useQuery({
        queryKey: ['cf-fisio', dFisio],
        queryFn: () => loadTecnicos(TIPO_TECNICO.Fisioterapeuta, dFisio, listPermId),
        enabled: open && usaFisio,
    })
    const auxQ = useQuery({
        queryKey: ['cf-aux', dAux],
        queryFn: () => loadTecnicos(TIPO_TECNICO.Auxiliar, dAux, listPermId),
        enabled: open && usaAux,
    })
    const outroQ = useQuery({
        queryKey: ['cf-outro', dOutro],
        queryFn: () => loadTecnicos(TIPO_TECNICO.Outro, dOutro, listPermId),
        enabled: open && usaOutro,
    })

    const fisioItems = useMemo(
        () => withSelected((fisioQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        fisioId,
        fisioLabel
    ),
    [fisioQ.data, fisioId, fisioLabel]
)
const auxItems = useMemo(
    () => 
        withSelected((auxQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        auxId,
        auxLabel
    ),
    [auxQ.data, auxId, auxLabel]
)
const outroItems = useMemo(
    () => 
        withSelected((outroQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        outroId,
        outroLabel
    ),
    [outroQ.data, outroId, outroLabel]
)

    const handleOk = async () => {
        if (!data) { 
            toast.error("A data é obrigatória")
            return
        }
        if (!usaFisio && !usaAux && !usaOutro) {
            toast.error("Selecione pelo menos um técnico")
            return
        }
        if (usaFisio && (!fisioId || !horaFisio.trim() || !durFisio.trim())) {
            toast.error("Preencha fisioterapeuta, início e duração")
            return
        }
        if (usaAux && (!auxId || !horaAux.trim() || !durAux.trim())) {
            toast.error("Preencha auxiliar, início e duração")
            return
        }
        if (usaOutro && (!outroId || !horaOutro.trim() || !durOutro.trim())) {
            toast.error("Preencha terapeuta, início e duração")
            return
        }

        const horas = [
            usaFisio ? horaFisio.trim() : null,
            usaAux ? horaAux.trim() : null,
            usaOutro ? horaOutro.trim() : null,
        ].filter(Boolean) as string[]
        const horaInic = horas.sort()[0] ?? null

        setSaving(true)
        try
        {
            const res = await SessaoTratamentoService(listPermId).compensarFalta({
                tratamentoId,
                data,
                horaInic,
                duracao: durFisio || durAux || durOutro || null,
                fisioterapeutaId: usaFisio ? fisioId : null,
                auxiliarId: usaAux ? auxId : null,
                outroTecnicoId: usaOutro ? outroId : null,
                horaFisio: usaFisio ? horaFisio.trim() : null,
                horaAux: usaAux ? horaAux.trim() : null,
                horaOutro: usaOutro ? horaOutro.trim() : null,
                duracaoFisio: usaFisio ? durFisio.trim() : null,
                duracaoAux: usaAux ? durAux.trim() : null,
                duracaoOutro: usaOutro ? durOutro.trim() : null,
            })
            if (res.info?.status === ResponseStatus.Success) {
                toast.success("Falta compensada com sucesso")
                onOpenChange(false)
                onSaved()
            } else {
                const msg = Object.values(res.info?.messages ?? {})
                    .flat()
                    .find(Boolean) ?? 'Não foi possível compensar'
                toast.error(msg)
            }
        } catch {
            toast.error("Erro ao compensar falta")
        } finally {
            setSaving(false)
        }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Compensar falta</DialogTitle>
            </DialogHeader>
            <div className='space-y-1.5'>
              <Label>Data *</Label>
              <Input type='date' value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className='mt-4 space-y-4'>
              <div className='space-y-2 rounded border p-3'>
                <label className='flex items-center gap-2 text-sm font-medium'>
                  <Checkbox
                    checked={usaFisio}
                    onCheckedChange={(v) => setUsaFisio(v === true)}
                  />
                  Fisioterapeuta
                </label>
                <div className='grid gap-3 sm:grid-cols-[1fr_9rem_9rem]'>
                  <AsyncCombobox
                    value={fisioId}
                    disabled={!usaFisio}
                    onChange={(v) => {
                      const hit = fisioItems.find((i) => i.value === v)
                      setFisioId(v)
                      setFisioLabel(hit?.label ?? '')
                    }}
                    items={fisioItems}
                    searchValue={fisioSearch}
                    onSearchValueChange={setFisioSearch}
                    isLoading={fisioQ.isFetching}
                    placeholder='Seleccionar…'
                    searchPlaceholder='Pesquisar…'
                    emptyText='Sem resultados'
                  />
                  <div className='space-y-1'>
                    <Label className='text-xs'>Início</Label>
                    <TimeField
                      value={horaFisio}
                      disabled={!usaFisio}
                      placeholder='HH:mm'
                      onChange={setHoraFisio}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Duração</Label>
                    <TimeField
                      value={durFisio}
                      disabled={!usaFisio}
                      placeholder='HH:mm'
                      onChange={setDurFisio}
                    />
                  </div>
                </div>
              </div>
              <div className='space-y-2 rounded border p-3'>
                <label className='flex items-center gap-2 text-sm font-medium'>
                  <Checkbox
                    checked={usaAux}
                    onCheckedChange={(v) => setUsaAux(v === true)}
                  />
                  Auxiliar
                </label>
                <div className='grid gap-3 sm:grid-cols-[1fr_9rem_9rem]'>
                  <AsyncCombobox
                    value={auxId}
                    disabled={!usaAux}
                    onChange={(v) => {
                      const hit = auxItems.find((i) => i.value === v)
                      setAuxId(v)
                      setAuxLabel(hit?.label ?? '')
                    }}
                    items={auxItems}
                    searchValue={auxSearch}
                    onSearchValueChange={setAuxSearch}
                    isLoading={auxQ.isFetching}
                    placeholder='Seleccionar…'
                    searchPlaceholder='Pesquisar…'
                    emptyText='Sem resultados'
                  />
                  <div className='space-y-1'>
                    <Label className='text-xs'>Início</Label>
                    <TimeField
                      value={horaAux}
                      disabled={!usaAux}
                      placeholder='HH:mm'
                      onChange={setHoraAux}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Duração</Label>
                    <TimeField
                      value={durAux}
                      disabled={!usaAux}
                      placeholder='HH:mm'
                      onChange={setDurAux}
                    />
                  </div>
                </div>
              </div>
              <div className='space-y-2 rounded border p-3'>
                <label className='flex items-center gap-2 text-sm font-medium'>
                  <Checkbox
                    checked={usaOutro}
                    onCheckedChange={(v) => setUsaOutro(v === true)}
                  />
                  Terapeuta Ocup./Fala
                </label>
                <div className='grid gap-3 sm:grid-cols-[1fr_9rem_9rem]'>
                  <AsyncCombobox
                    value={outroId}
                    disabled={!usaOutro}
                    onChange={(v) => {
                      const hit = outroItems.find((i) => i.value === v)
                      setOutroId(v)
                      setOutroLabel(hit?.label ?? '')
                    }}
                    items={outroItems}
                    searchValue={outroSearch}
                    onSearchValueChange={setOutroSearch}
                    isLoading={outroQ.isFetching}
                    placeholder='Seleccionar…'
                    searchPlaceholder='Pesquisar…'
                    emptyText='Sem resultados'
                  />
                  <div className='space-y-1'>
                    <Label className='text-xs'>Início</Label>
                    <TimeField
                      value={horaOutro}
                      disabled={!usaOutro}
                      placeholder='HH:mm'
                      onChange={setHoraOutro}
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs'>Duração</Label>
                    <TimeField
                      value={durOutro}
                      disabled={!usaOutro}
                      placeholder='HH:mm'
                      onChange={setDurOutro}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className='gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type='button' disabled={saving} onClick={() => void handleOk()}>
                {saving ? 'A guardar…' : 'OK'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
    }
    