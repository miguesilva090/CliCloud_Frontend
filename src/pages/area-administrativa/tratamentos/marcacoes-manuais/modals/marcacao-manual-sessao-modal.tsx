import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AsyncCombobox, type ComboboxItem } from '@/components/shared/async-combobox'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import { toast } from '@/utils/toast-utils'
import { TecnicoSlotHorarioFields } from '@/components/tratamentos/tecnico-slot-horario-fields'

export type MarcacaoManualSessaoConfirm = {
  data: string
  horaInic: string | null
  duracao: string | null
  fisioterapeutaId: string | null
  auxiliarId: string | null
  outroTecnicoId: string | null
  fisioLabel: string
  auxLabel: string
  outroLabel: string
}

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  listPermId: string
  existingDates: string[]
  defaultData: string
  defaultDuracao: string
  defaultUsaFisio: boolean
  defaultFisioId: string
  defaultFisioLabel: string
  defaultUsaAux: boolean
  defaultAuxId: string
  defaultAuxLabel: string
  defaultUsaOutro: boolean
  defaultOutroId: string
  defaultOutroLabel: string
  defaultUTempoFisio?: number
  defaultUTempoAux?: number
  defaultUTempoOutro?: number
  onConfirm: (sessao: MarcacaoManualSessaoConfirm) => void
}

function withSelected(items: ComboboxItem[], id: string, label: string) {
  if (!id) return items
  if (items.some((i) => i.value === id)) return items
  return [{ value: id, label: label || id }, ...items]
}

function diaSemana(isoDate: string) {
  if (!isoDate) return ''
  const d = new Date(isoDate + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-PT', { weekday: 'long' })
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

export function MarcacaoManualSessaoModal({
  open,
  onOpenChange,
  listPermId,
  existingDates,
  defaultData,
  defaultDuracao,
  defaultUsaFisio,
  defaultFisioId,
  defaultFisioLabel,
  defaultUsaAux,
  defaultAuxId,
  defaultAuxLabel,
  defaultUsaOutro,
  defaultOutroId,
  defaultOutroLabel,
  defaultUTempoFisio = 1,
  defaultUTempoAux = 1,
  defaultUTempoOutro = 1,
  onConfirm,
}: Props) {
  const [data, setData] = useState(defaultData)
  const [usaFisio, setUsaFisio] = useState(defaultUsaFisio)
  const [fisioId, setFisioId] = useState(defaultFisioId)
  const [fisioLabel, setFisioLabel] = useState(defaultFisioLabel)
  const [uTempoFisio, setUTempoFisio] = useState(defaultUTempoFisio)
  const [horaFisio, setHoraFisio] = useState('')
  const [durFisio, setDurFisio] = useState(defaultDuracao)
  const [usaAux, setUsaAux] = useState(defaultUsaAux)
  const [auxId, setAuxId] = useState(defaultAuxId)
  const [auxLabel, setAuxLabel] = useState(defaultAuxLabel)
  const [uTempoAux, setUTempoAux] = useState(defaultUTempoAux)
  const [horaAux, setHoraAux] = useState('')
  const [durAux, setDurAux] = useState(defaultDuracao)
  const [usaOutro, setUsaOutro] = useState(defaultUsaOutro)
  const [outroId, setOutroId] = useState(defaultOutroId)
  const [outroLabel, setOutroLabel] = useState(defaultOutroLabel)
  const [uTempoOutro, setUTempoOutro] = useState(defaultUTempoOutro)
  const [horaOutro, setHoraOutro] = useState('')
  const [durOutro, setDurOutro] = useState(defaultDuracao)
  const [fisioSearch, setFisioSearch] = useState('')
  const [auxSearch, setAuxSearch] = useState('')
  const [outroSearch, setOutroSearch] = useState('')

  const [dFisio] = useDebounce(fisioSearch, 300)
  const [dAux] = useDebounce(auxSearch, 300)
  const [dOutro] = useDebounce(outroSearch, 300)

  useEffect(() => {
    if (!open) return
    const dur = defaultDuracao || '01:00'
    setData(defaultData)
    setUsaFisio(defaultUsaFisio)
    setFisioId(defaultFisioId)
    setFisioLabel(defaultFisioLabel)
    setUTempoFisio(defaultUTempoFisio || 1)
    setHoraFisio('')
    setDurFisio(dur)
    setUsaAux(defaultUsaAux)
    setAuxId(defaultAuxId)
    setAuxLabel(defaultAuxLabel)
    setUTempoAux(defaultUTempoAux || 1)
    setHoraAux('')
    setDurAux(dur)
    setUsaOutro(defaultUsaOutro)
    setOutroId(defaultOutroId)
    setOutroLabel(defaultOutroLabel)
    setUTempoOutro(defaultUTempoOutro || 1)
    setHoraOutro('')
    setDurOutro(dur)
    setFisioSearch('')
    setAuxSearch('')
    setOutroSearch('')
  }, [
    open,
    defaultData,
    defaultDuracao,
    defaultUsaFisio,
    defaultFisioId,
    defaultFisioLabel,
    defaultUsaAux,
    defaultAuxId,
    defaultAuxLabel,
    defaultUsaOutro,
    defaultOutroId,
    defaultOutroLabel,
    defaultUTempoFisio,
    defaultUTempoAux,
    defaultUTempoOutro,
  ])

  const fisioQ = useQuery({
    queryKey: ['mm-modal-fisio', dFisio],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Fisioterapeuta, dFisio, listPermId),
    enabled: open && usaFisio,
  })
  const auxQ = useQuery({
    queryKey: ['mm-modal-aux', dAux],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Auxiliar, dAux, listPermId),
    enabled: open && usaAux,
  })
  const outroQ = useQuery({
    queryKey: ['mm-modal-outro', dOutro],
    queryFn: () => loadTecnicos(TIPO_TECNICO.Outro, dOutro, listPermId),
    enabled: open && usaOutro,
  })

  const fisioItems = useMemo(
    () =>
      withSelected(
        (fisioQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        fisioId,
        fisioLabel
      ),
    [fisioQ.data, fisioId, fisioLabel]
  )
  const auxItems = useMemo(
    () =>
      withSelected(
        (auxQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        auxId,
        auxLabel
      ),
    [auxQ.data, auxId, auxLabel]
  )
  const outroItems = useMemo(
    () =>
      withSelected(
        (outroQ.data ?? []).map((t) => ({ value: t.id, label: t.nome ?? t.id })),
        outroId,
        outroLabel
      ),
    [outroQ.data, outroId, outroLabel]
  )

  const handleOk = () => {
    if (!data) {
      toast.error('A data é obrigatória.')
      return
    }
    if (existingDates.includes(data)) {
      toast.error('Já existe sessão nesta data.')
      return
    }
    if (!usaFisio && !usaAux && !usaOutro) {
      toast.error('Seleccione pelo menos um técnico.')
      return
    }
    if (usaFisio && (!fisioId || !horaFisio.trim() || !durFisio.trim())) {
      toast.error('Preencha fisioterapeuta, início e duração.')
      return
    }
    if (usaAux && (!auxId || !horaAux.trim() || !durAux.trim())) {
      toast.error('Preencha auxiliar, início e duração.')
      return
    }
    if (usaOutro && (!outroId || !horaOutro.trim() || !durOutro.trim())) {
      toast.error('Preencha terapeuta, início e duração.')
      return
    }

    const horas = [
      usaFisio ? horaFisio.trim() : null,
      usaAux ? horaAux.trim() : null,
      usaOutro ? horaOutro.trim() : null,
    ].filter(Boolean) as string[]

    onConfirm({
      data,
      horaInic: horas.sort()[0] ?? null,
      duracao: durFisio || durAux || durOutro || defaultDuracao || null,
      fisioterapeutaId: usaFisio ? fisioId : null,
      auxiliarId: usaAux ? auxId : null,
      outroTecnicoId: usaOutro ? outroId : null,
      fisioLabel: usaFisio ? fisioLabel : '',
      auxLabel: usaAux ? auxLabel : '',
      outroLabel: usaOutro ? outroLabel : '',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Inserir Sessões</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <Label>Data Início</Label>
            <Input
              type='date'
              value={data}
              onChange={(e) => {
                setData(e.target.value)
                setHoraFisio('')
                setHoraAux('')
                setHoraOutro('')
              }}
            />
          </div>
          <div className='space-y-1.5'>
            <Label>Dia da Semana</Label>
            <Input value={diaSemana(data)} disabled />
          </div>
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
            <AsyncCombobox
              value={fisioId}
              disabled={!usaFisio}
              onChange={(v) => {
                const hit = fisioItems.find((i) => i.value === v)
                setFisioId(v)
                setFisioLabel(hit?.label ?? '')
                setHoraFisio('')
                setUTempoFisio(defaultUTempoFisio || 1)
              }}
              items={fisioItems}
              searchValue={fisioSearch}
              onSearchValueChange={setFisioSearch}
              isLoading={fisioQ.isFetching}
              placeholder='Seleccionar…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
            <TecnicoSlotHorarioFields
              enabled={open && usaFisio}
              tecnicoId={fisioId}
              data={data}
              idFuncionalidade={listPermId}
              unidadeTempo={uTempoFisio}
              onUnidadeTempoChange={setUTempoFisio}
              hora={horaFisio}
              onHoraChange={setHoraFisio}
              duracao={durFisio}
              onDuracaoChange={setDurFisio}
            />
          </div>

          <div className='space-y-2 rounded border p-3'>
            <label className='flex items-center gap-2 text-sm font-medium'>
              <Checkbox
                checked={usaAux}
                onCheckedChange={(v) => setUsaAux(v === true)}
              />
              Auxiliar
            </label>
            <AsyncCombobox
              value={auxId}
              disabled={!usaAux}
              onChange={(v) => {
                const hit = auxItems.find((i) => i.value === v)
                setAuxId(v)
                setAuxLabel(hit?.label ?? '')
                setHoraAux('')
                setUTempoAux(defaultUTempoAux || 1)
              }}
              items={auxItems}
              searchValue={auxSearch}
              onSearchValueChange={setAuxSearch}
              isLoading={auxQ.isFetching}
              placeholder='Seleccionar…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
            <TecnicoSlotHorarioFields
              enabled={open && usaAux}
              tecnicoId={auxId}
              data={data}
              idFuncionalidade={listPermId}
              unidadeTempo={uTempoAux}
              onUnidadeTempoChange={setUTempoAux}
              hora={horaAux}
              onHoraChange={setHoraAux}
              duracao={durAux}
              onDuracaoChange={setDurAux}
            />
          </div>

          <div className='space-y-2 rounded border p-3'>
            <label className='flex items-center gap-2 text-sm font-medium'>
              <Checkbox
                checked={usaOutro}
                onCheckedChange={(v) => setUsaOutro(v === true)}
              />
              Terapeuta Ocup./Fala
            </label>
            <AsyncCombobox
              value={outroId}
              disabled={!usaOutro}
              onChange={(v) => {
                const hit = outroItems.find((i) => i.value === v)
                setOutroId(v)
                setOutroLabel(hit?.label ?? '')
                setHoraOutro('')
                setUTempoOutro(defaultUTempoOutro || 1)
              }}
              items={outroItems}
              searchValue={outroSearch}
              onSearchValueChange={setOutroSearch}
              isLoading={outroQ.isFetching}
              placeholder='Seleccionar…'
              searchPlaceholder='Pesquisar…'
              emptyText='Sem resultados'
            />
            <TecnicoSlotHorarioFields
              enabled={open && usaOutro}
              tecnicoId={outroId}
              data={data}
              idFuncionalidade={listPermId}
              unidadeTempo={uTempoOutro}
              onUnidadeTempoChange={setUTempoOutro}
              hora={horaOutro}
              onHoraChange={setHoraOutro}
              duracao={durOutro}
              onDuracaoChange={setDurOutro}
            />
          </div>
        </div>

        <DialogFooter className='gap-2 sm:gap-2'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleOk}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}