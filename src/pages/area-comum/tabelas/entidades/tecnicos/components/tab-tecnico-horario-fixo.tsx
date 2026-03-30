import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
} from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus } from 'lucide-react'
import type { TecnicoDTO } from '@/types/dtos/saude/tecnicos.dtos'
import type { TecnicoEditFormValues } from '@/pages/tecnicos/types/tecnico-edit-form-types'
import type {
  DiaSemana,
  Periodo,
  HorarioTecnicoDiaDTO,
} from '@/types/dtos/saude/tecnicos.dtos'
import { useQueryClient } from '@tanstack/react-query'
import {
  useGetHorarioTecnicoByTecnicoId,
  useGetHorarioTecnicoDiaByHorarioTecnicoId,
} from '../tecnico-horario-queries'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'

const DIAS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const
const DIAS_DISPLAY = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
] as const

function parseDiaSemana(val: unknown): number | undefined {
  if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 6)
    return val
  const s = String(val ?? '').trim()
  const n = parseInt(s, 10)
  if (!Number.isNaN(n) && n >= 0 && n <= 6) return n
  const map: Record<string, number> = {
    Domingo: 0,
    Segunda: 1,
    Terça: 2,
    Terca: 2,
    Quarta: 3,
    Quinta: 4,
    Sexta: 5,
    Sábado: 6,
    Sabado: 6,
  }
  return map[s] ?? map[s.replace(/-feira$/, '')]
}

function toTimeSpan(s: string): string {
  if (!s?.trim()) return ''
  return s.length === 5 ? `${s}:00` : s
}

function fromTimeSpan(s?: string | null): string {
  if (s == null) return ''
  const trimmed = String(s).trim()
  if (!trimmed) return ''
  if (trimmed.length >= 5) return trimmed.slice(0, 5)
  return ''
}

function extractDataArray<T>(response: unknown): T[] {
  if (!response || typeof response !== 'object') return []
  const r = response as Record<string, unknown>
  const info = r.info ?? r
  if (!info || typeof info !== 'object') return []
  const infoObj = info as Record<string, unknown>
  const arr = infoObj.data ?? infoObj.Data
  if (Array.isArray(arr)) return arr as T[]
  return []
}

function isPeriodoManha(p: unknown): boolean {
  if (p === 0 || p === '0') return true
  const s = String(p ?? '').toLowerCase()
  return s === 'manha' || s === 'manhã'
}

export interface TabHorarioTecnicoFixoRef {
  saveHorario: () => Promise<void>
}

export const TabHorarioTecnicoFixo = forwardRef<
  TabHorarioTecnicoFixoRef,
  {
    form: UseFormReturn<TecnicoEditFormValues>
    tecnico: TecnicoDTO | undefined
    isReadOnly?: boolean
    hideSaveButton?: boolean
  }
>(function TabHorarioTecnicoFixo(
  { form, tecnico, isReadOnly },
  ref
) {
  void form
  const tecnicoId = tecnico?.id ?? ''
  const [horarioCompleto, setHorarioCompleto] = useState(false)
  const [intervaloMarcacao, setIntervaloMarcacao] = useState('00:30')

  const [periodo1, setPeriodo1] = useState<
    Record<string, { inicio: string; fim: string; sala: string; vagas: string }>
  >(
    Object.fromEntries(
      DIAS.map((d) => [d, { inicio: '', fim: '', sala: '', vagas: '' }])
    ) as Record<
      string,
      { inicio: string; fim: string; sala: string; vagas: string }
    >
  )
  const [periodo2, setPeriodo2] = useState<
    Record<string, { inicio: string; fim: string; sala: string; vagas: string }>
  >(
    Object.fromEntries(
      DIAS.map((d) => [d, { inicio: '', fim: '', sala: '', vagas: '' }])
    ) as Record<
      string,
      { inicio: string; fim: string; sala: string; vagas: string }
    >
  )

  const {
    data: horarioResponse,
    isLoading: loadingHorario,
    isError: errorHorario,
    error: horarioError,
  } = useGetHorarioTecnicoByTecnicoId(tecnicoId)
  const rawHorarioArr = extractDataArray<{
    id?: string
    horaComp?: number | null
    minMarcacao?: string | null
  }>(horarioResponse)
  // Backend pode devolver vários horários para o mesmo técnico (ordenados por CreatedOn asc).
  // Queremos sempre o mais recente.
  const horario =
    rawHorarioArr.length > 0 ? rawHorarioArr[rawHorarioArr.length - 1] : null
  const horarioTecnicoId = horario?.id ?? ''

  const {
    data: diasResponse,
    isLoading: loadingDias,
    isError: errorDias,
    error: diasError,
  } = useGetHorarioTecnicoDiaByHorarioTecnicoId(horarioTecnicoId)
  const dias = extractDataArray<HorarioTecnicoDiaDTO>(diasResponse)

  const queryClient = useQueryClient()

  const diasSignature = useMemo(
    () =>
      dias.length === 0
        ? ''
        : JSON.stringify(
            dias.map((d) => [
              d.diaSemana,
              d.periodo,
              d.inicio,
              d.fim,
              d.sala,
              d.numMarcacoesPeriodo,
            ])
          ),
    [dias]
  )

  const horaCompFromServer = !!(
    horario &&
    ((horario as Record<string, unknown>).horaComp ??
      (horario as Record<string, unknown>).HoraComp ??
      false)
  )

  useEffect(() => {
    if (!horario) return
    const h = horario as Record<string, unknown>
    const getH = (...keys: string[]) => {
      for (const k of keys) {
        const v = h[k]
        if (v !== undefined && v !== null) return v
      }
      return undefined
    }
    setHorarioCompleto(
      !!(getH('horaComp', 'HoraComp') ?? false)
    )
    setIntervaloMarcacao(
      fromTimeSpan(getH('minMarcacao', 'MinMarcacao') as string) || '00:30'
    )
  }, [horario?.id, horario])

  const lastAppliedSigRef = useRef<string>('')
  const lastTecnicoIdRef = useRef<string>('')

  useEffect(() => {
    if (tecnicoId !== lastTecnicoIdRef.current) {
      lastTecnicoIdRef.current = tecnicoId
      lastAppliedSigRef.current = ''
    }
  }, [tecnicoId])

  useEffect(() => {
    const sig = `${horarioTecnicoId}|${diasSignature}|${horaCompFromServer}|${horarioCompleto}`
    if (lastAppliedSigRef.current === sig) return
    lastAppliedSigRef.current = sig

    const empty = Object.fromEntries(
      DIAS.map((d) => [d, { inicio: '', fim: '', sala: '', vagas: '' }])
    ) as Record<
      string,
      { inicio: string; fim: string; sala: string; vagas: string }
    >
    const p1 = { ...empty }
    const p2 = { ...empty }

    for (const d of dias) {
      const dobj = d as unknown as Record<string, unknown>
      const diaIdx = parseDiaSemana(dobj.diaSemana ?? dobj.DiaSemana)
      const dayName =
        diaIdx != null && diaIdx >= 0 && diaIdx < DIAS.length
          ? DIAS[diaIdx]
          : undefined
      if (!dayName) continue
      const inicio = fromTimeSpan(
        (dobj.inicio ?? dobj.Inicio) as string | null | undefined
      )
      const fim = fromTimeSpan(
        (dobj.fim ?? dobj.Fim) as string | null | undefined
      )
      const sala = String(dobj.sala ?? dobj.Sala ?? '')
      const vagasVal =
        dobj.numMarcacoesPeriodo ?? dobj.NumMarcacoesPeriodo ?? undefined
      const vagas =
        vagasVal != null && !Number.isNaN(Number(vagasVal))
          ? String(vagasVal)
          : ''
      const isManha = isPeriodoManha(d.periodo)
      if (isManha) {
        p1[dayName] = { inicio, fim, sala, vagas }
      } else {
        p2[dayName] = { inicio, fim, sala, vagas }
      }
    }

    const horaComp = horaCompFromServer || horarioCompleto
    if (horaComp && dias.length === 0) {
      const diasUteis = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'] as const
      for (const d of diasUteis) {
        p1[d] = { inicio: '08:00', fim: '12:00', sala: '', vagas: '' }
        p2[d] = { inicio: '12:00', fim: '20:00', sala: '', vagas: '' }
      }
    }

    setPeriodo1(p1)
    setPeriodo2(p2)
  }, [horarioTecnicoId, diasSignature, horaCompFromServer, horarioCompleto])

  const handleGravarHorario = async () => {
    if (!tecnicoId) {
      toast.error(
        'Grave o técnico primeiro para poder configurar o horário.'
      )
      return
    }
    try {
      const svc = TecnicoService('tecnicos')
      const payloadCab = {
        tecnicoId,
        tipoHorario: null as number | null,
        minMarcacao: toTimeSpan(intervaloMarcacao) || undefined,
        horaComp: horarioCompleto ? 1 : 0,
      }

      const res = await svc.createHorarioTecnico(payloadCab)
      if (res.info?.status !== ResponseStatus.Success || !res.info?.data) {
        const msg =
          (res.info as { messages?: Record<string, string[]> })?.messages?.[
            '$'
          ]?.[0] ??
          Object.values(
            (res.info as { messages?: Record<string, string[]> })?.messages ??
              {}
          )?.[0]?.[0] ??
          'Falha ao gravar horário'
        toast.error(msg)
        return
      }
      const hId = res.info.data as string

      const diasAPersistir = horarioCompleto
        ? [1, 2, 3, 4, 5]
        : [0, 1, 2, 3, 4, 5, 6]

      for (const diaSemana of diasAPersistir) {
        for (const periodo of [0, 1] as Periodo[]) {
          const dayName = DIAS[diaSemana]
          const data =
            periodo === 0 ? periodo1[dayName] : periodo2[dayName]
          const inicio = toTimeSpan(data?.inicio ?? '') || undefined
          const fim = toTimeSpan(data?.fim ?? '') || undefined
          const sala = data?.sala?.trim() || undefined
          const vagas =
            data?.vagas?.trim() && !Number.isNaN(Number(data.vagas))
              ? Number(data.vagas)
              : undefined
          const payloadDia = {
            horarioTecnicoId: hId,
            diaSemana: diaSemana as DiaSemana,
            periodo,
            inicio,
            fim,
            sala,
            numMarcacoesPeriodo: vagas,
            numMarcacoesOutro: undefined,
          }
          await svc.createHorarioTecnicoDia(payloadDia)
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ['horario-tecnico', tecnicoId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['horario-tecnico-dia', hId],
      })
      toast.success('Horário gravado com sucesso.')
    } catch (err) {
      // Alinhar tratamento de erros com o dos médicos,
      // aproveitando eventuais mensagens de validação do backend.
      const apiErr = err as { data?: { messages?: Record<string, string[]> } | string }
      let message = 'Erro ao gravar horário'
      if (typeof apiErr?.data === 'string') {
        message = apiErr.data
      } else if (apiErr?.data && typeof apiErr.data === 'object' && apiErr.data.messages) {
        const msgs = Object.values(apiErr.data.messages).flat()
        message = msgs[0] ?? message
      } else if (err instanceof Error && err.message) {
        message = err.message
      }
      console.error('Erro ao gravar horário técnico:', err)
      toast.error(message)
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      saveHorario: handleGravarHorario,
    }),
    [tecnicoId, horarioCompleto, intervaloMarcacao, periodo1, periodo2]
  )

  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Opções
        </h3>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Checkbox
              checked={horarioCompleto}
              onCheckedChange={(checked) =>
                setHorarioCompleto(checked === true)
              }
              disabled={isReadOnly}
            />
            <span className='text-sm'>Horário Completo</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              Intervalo Marcação
            </span>
            <Input
              type='time'
              className='h-7 w-28'
              value={intervaloMarcacao}
              disabled={isReadOnly}
              onChange={(e) => setIntervaloMarcacao(e.target.value || '00:30')}
            />
          </div>
        </div>
      </section>

      {(loadingHorario || loadingDias) && (
        <div className='text-xs text-muted-foreground'>
          A carregar horário...
        </div>
      )}
      {(errorHorario || errorDias) && (
        <div className='text-xs text-destructive'>
          Falha ao carregar horário:{' '}
          {String(horarioError || diasError || '')}
        </div>
      )}

      <section className='overflow-x-auto'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5 mb-3'>
          Primeiro Período (Manhã)
        </h3>
        <table className='w-full border-collapse text-sm table-fixed'>
          <colgroup>
            <col className='w-28' />
            {DIAS_DISPLAY.map((_, i) => (
              <col key={i} className='min-w-[7.5rem] w-[7.5rem]' />
            ))}
          </colgroup>
          <thead>
            <tr className='border-b'>
              <th className='text-left p-2'></th>
              {DIAS_DISPLAY.map((d) => (
                <th
                  key={d}
                  className='p-2 text-muted-foreground font-normal text-center'
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className='border-b'>
              <td className='p-2 font-medium'>Hora Inicial</td>
              {DIAS_DISPLAY.map((d) => (
                <td key={d} className='p-1.5 text-center'>
                  <div className='flex justify-center'>
                    <Input
                      type='time'
                      className='h-7 w-24 mx-auto'
                      value={periodo1[d]?.inicio ?? ''}
                      onChange={(e) =>
                        setPeriodo1((prev) => ({
                          ...prev,
                          [d]: { ...prev[d], inicio: e.target.value },
                        }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr className='border-b'>
              <td className='p-2 pt-4 font-medium'>Hora Final</td>
              {DIAS_DISPLAY.map((d) => (
                <td key={d} className='p-1.5 pt-4 text-center'>
                  <div className='flex justify-center'>
                    <Input
                      type='time'
                      className='h-7 w-24 mx-auto'
                      value={periodo1[d]?.fim ?? ''}
                      onChange={(e) =>
                        setPeriodo1((prev) => ({
                          ...prev,
                          [d]: { ...prev[d], fim: e.target.value },
                        }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr className='border-b'>
              <td className='p-2 pt-4 font-medium'>Sala</td>
              {DIAS_DISPLAY.map((d) => (
                <td key={d} className='p-1.5 pt-4 text-center'>
                  <div className='flex justify-center gap-1'>
                    <Input
                      className='h-7 w-20 max-w-24'
                      placeholder='Sala...'
                      value={periodo1[d]?.sala ?? ''}
                      onChange={(e) =>
                        setPeriodo1((prev) => ({
                          ...prev,
                          [d]: { ...prev[d], sala: e.target.value },
                        }))
                      }
                      disabled={isReadOnly}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='shrink-0 h-7 w-7'
                      disabled={isReadOnly}
                    >
                      <Plus className='h-3 w-3' />
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
            <tr className='border-b'>
              <td className='p-2 pt-4 font-medium'>Nº Vagas Extra</td>
              {DIAS_DISPLAY.map((d) => (
                <td key={d} className='p-1.5 pt-4 text-center'>
                  <div className='flex justify-center'>
                    <Input
                      type='number'
                      className='h-7 w-20'
                      value={periodo1[d]?.vagas ?? ''}
                      onChange={(e) =>
                        setPeriodo1((prev) => ({
                          ...prev,
                          [d]: { ...prev[d], vagas: e.target.value },
                        }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <section className='overflow-x-auto'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5 mb-3'>
          Segundo Período (Tarde)
        </h3>
        <table className='w-full border-collapse text-sm table-fixed'>
          <colgroup>
            <col className='w-28' />
            {DIAS_DISPLAY.map((_, i) => (
              <col key={i} className='min-w-[7.5rem] w-[7.5rem]' />
            ))}
          </colgroup>
          <thead>
            <tr className='border-b'>
              <th className='text-left p-2'></th>
              {DIAS_DISPLAY.map((d) => (
                <th
                  key={d}
                  className='p-2 text-muted-foreground font-normal text-center'
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className='border-b'>
              <td className='p-2 font-medium'>Hora Inicial</td>
              {DIAS_DISPLAY.map((d) => (
                <td key={d} className='p-1.5 text-center'>
                  <div className='flex justify-center'>
                    <Input
                      type='time'
                      className='h-7 w-24 mx-auto'
                      value={periodo2[d]?.inicio ?? ''}
                      onChange={(e) =>
                        setPeriodo2((prev) => ({
                          ...prev,
                          [d]: { ...prev[d], inicio: e.target.value },
                        }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr className='border-b'>
              <td className='p-2 pt-4 font-medium'>Hora Final</td>
              {DIAS_DISPLAY.map((d) => (
                <td key={d} className='p-1.5 pt-4 text-center'>
                  <div className='flex justify-center'>
                    <Input
                      type='time'
                      className='h-7 w-24 mx-auto'
                      value={periodo2[d]?.fim ?? ''}
                      onChange={(e) =>
                        setPeriodo2((prev) => ({
                          ...prev,
                          [d]: { ...prev[d], fim: e.target.value },
                        }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </td>
              ))}
            </tr>
            <tr className='border-b'>
              <td className='p-2 pt-4 font-medium'>Sala</td>
              {DIAS_DISPLAY.map((d) => (
                <td key={d} className='p-1.5 pt-4 text-center'>
                  <div className='flex justify-center gap-1'>
                    <Input
                      className='h-7 w-20 max-w-24'
                      placeholder='Sala...'
                      value={periodo2[d]?.sala ?? ''}
                      onChange={(e) =>
                        setPeriodo2((prev) => ({
                          ...prev,
                          [d]: { ...prev[d], sala: e.target.value },
                        }))
                      }
                      disabled={isReadOnly}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className='shrink-0 h-7 w-7'
                      disabled={isReadOnly}
                    >
                      <Plus className='h-3 w-3' />
                    </Button>
                  </div>
                </td>
              ))}
            </tr>
            <tr className='border-b'>
              <td className='p-2 pt-4 font-medium'>Nº Vagas Extra</td>
              {DIAS_DISPLAY.map((d) => (
                <td key={d} className='p-1.5 pt-4 text-center'>
                  <div className='flex justify-center'>
                    <Input
                      type='number'
                      className='h-7 w-20'
                      value={periodo2[d]?.vagas ?? ''}
                      onChange={(e) =>
                        setPeriodo2((prev) => ({
                          ...prev,
                          [d]: { ...prev[d], vagas: e.target.value },
                        }))
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  )
})

