import { useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Save } from 'lucide-react'
import type { MedicoDTO } from '@/types/dtos/saude/medicos.dtos'
import type { MedicoEditFormValues } from '@/pages/medicos/types/medico-edit-form-types'
import type { DiaSemana, Periodo, HorarioMedicoDiaDTO } from '@/types/dtos/saude/medicos.dtos'
import { useQueryClient } from '@tanstack/react-query'
import {
  useGetHorarioMedicoByMedicoId,
  useGetHorarioMedicoDiaByHorarioMedicoId,
} from '@/pages/medicos/queries/medicos-queries'
import { MedicosService } from '@/lib/services/saude/medicos-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'

/** Ordem do backend (DiaSemana 0-6): Domingo=0, Segunda=1, ..., Sábado=6 */
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const
/** Ordem de apresentação: Segunda a Sexta primeiro (dias úteis), depois Sábado e Domingo */
const DIAS_DISPLAY = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const

/** Converte valor do backend (número ou string) para índice do dia (0-6) */
function parseDiaSemana(val: unknown): number | undefined {
  if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 6) return val
  const s = String(val ?? '').trim()
  const n = parseInt(s, 10)
  if (!Number.isNaN(n) && n >= 0 && n <= 6) return n
  const map: Record<string, number> = { Domingo: 0, Segunda: 1, Terça: 2, Terca: 2, Quarta: 3, Quinta: 4, Sexta: 5, Sábado: 6, Sabado: 6 }
  return map[s] ?? map[s.replace(/-feira$/, '')]
}

/** Converte "HH:mm" para "HH:mm:ss" (backend TimeSpan) */
function toTimeSpan(s: string): string {
  if (!s?.trim()) return ''
  return s.length === 5 ? `${s}:00` : s
}

/** Converte "HH:mm:ss" ou "HH:mm:ss.ffffff" ou "HH:mm" para "HH:mm" (input type="time") */
function fromTimeSpan(s?: string | null): string {
  if (s == null) return ''
  const trimmed = String(s).trim()
  if (!trimmed) return ''
  if (trimmed.length >= 5) return trimmed.slice(0, 5)
  return ''
}

/** Extrai array de resposta da API (suporta info.data, info.Data, data direto, PascalCase) */
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

/** Verifica se é período Manhã (0, "0", "Manha", "Manhã") */
function isPeriodoManha(p: unknown): boolean {
  if (p === 0 || p === '0') return true
  const s = String(p ?? '').toLowerCase()
  return s === 'manha' || s === 'manhã'
}

export interface TabHorarioFixoRef {
  saveHorario: () => Promise<void>
}

export const TabHorarioFixo = forwardRef<TabHorarioFixoRef, {
  form: UseFormReturn<MedicoEditFormValues>
  medico: MedicoDTO | undefined
  isReadOnly?: boolean
  /** Quando true, esconde o botão "Gravar horário" — o horário é gravado pelo "Gravar médico" (como no legado) */
  hideSaveButton?: boolean
}>(function TabHorarioFixo({
  form,
  medico,
  isReadOnly,
  hideSaveButton = false,
}, ref) {
  void form
  const medicoId = medico?.id ?? ''
  const [horarioCompleto, setHorarioCompleto] = useState(false)
  const [intervaloMarcacao, setIntervaloMarcacao] = useState('00:30')
  const [intervaloPrimeiraConsulta, setIntervaloPrimeiraConsulta] = useState('00:30')
  const [horarioFlexivel, setHorarioFlexivel] = useState(false)
  const [periodo1, setPeriodo1] = useState<Record<string, { inicio: string; fim: string; sala: string; vagas: string }>>(
    Object.fromEntries(DIAS.map((d) => [d, { inicio: '', fim: '', sala: '', vagas: '' }]))
  )
  const [periodo2, setPeriodo2] = useState<Record<string, { inicio: string; fim: string; sala: string; vagas: string }>>(
    Object.fromEntries(DIAS.map((d) => [d, { inicio: '', fim: '', sala: '', vagas: '' }]))
  )
  const [isSavingLocal, setIsSavingLocal] = useState(false)

  const {
    data: horarioResponse,
    isLoading: loadingHorario,
    isError: errorHorario,
    error: horarioError,
  } = useGetHorarioMedicoByMedicoId(medicoId)
  const rawHorarioArr = extractDataArray<{ id?: string; horaComp?: boolean; minMarcacao?: string; primeiraConsulta?: string; horarioFlexivel?: boolean }>(horarioResponse)
  const horario = rawHorarioArr.length > 0 ? rawHorarioArr[0] : null
  const horarioMedicoId = horario?.id ?? ''

  const {
    data: diasResponse,
    isLoading: loadingDias,
    isError: errorDias,
    error: diasError,
  } = useGetHorarioMedicoDiaByHorarioMedicoId(horarioMedicoId)
  const dias = extractDataArray<HorarioMedicoDiaDTO>(diasResponse)

  const queryClient = useQueryClient()

  const diasByKey = useMemo(() => {
    const map = new Map<string, HorarioMedicoDiaDTO>()
    for (const d of dias) {
      map.set(`${d.diaSemana}-${d.periodo}`, d)
    }
    return map
  }, [dias])

  // Assinatura estável para evitar loop: só mudar quando o conteúdo real dos dados mudar
  const diasSignature = useMemo(
    () => (dias.length === 0 ? '' : JSON.stringify(dias.map((d) => [d.diaSemana, d.periodo, d.inicio, d.fim, d.sala, d.vagas]))),
    [dias]
  )
  const horaCompFromServer = !!(horario && ((horario as Record<string, unknown>).horaComp ?? (horario as Record<string, unknown>).HoraComp ?? false))

  /** Opções: aplicar dados do HorarioMedico quando existir */
  useEffect(() => {
    if (!horario) return
    const h = horario as Record<string, unknown>
    const getH = (...keys: string[]) => { for (const k of keys) { const v = h[k]; if (v !== undefined && v !== null) return v } return undefined }
    setHorarioCompleto(!!(getH('horaComp', 'HoraComp') ?? false))
    setIntervaloMarcacao(fromTimeSpan(getH('minMarcacao', 'MinMarcacao') as string) || '00:30')
    setIntervaloPrimeiraConsulta(fromTimeSpan(getH('primeiraConsulta', 'PrimeiraConsulta') as string) || '00:30')
    setHorarioFlexivel(!!(getH('horarioFlexivel', 'HorarioFlexivel') ?? false))
  }, [horario?.id, horario])

  const lastAppliedSigRef = useRef<string>('')
  const lastMedicoIdRef = useRef<string>('')

  /** Reset ref quando muda de médico */
  useEffect(() => {
    if (medicoId !== lastMedicoIdRef.current) {
      lastMedicoIdRef.current = medicoId
      lastAppliedSigRef.current = ''
    }
  }, [medicoId])

  /**
   * Exibir horário guardado na BD e aplicar Horário Completo quando aplicável.
   * Ref evita loop: só aplica quando os dados mudaram de facto.
   */
  useEffect(() => {
    const sig = `${horarioMedicoId}|${diasSignature}|${horaCompFromServer}|${horarioCompleto}`
    if (lastAppliedSigRef.current === sig) return
    lastAppliedSigRef.current = sig

    const empty = Object.fromEntries(DIAS.map((d) => [d, { inicio: '', fim: '', sala: '', vagas: '' }])) as Record<string, { inicio: string; fim: string; sala: string; vagas: string }>
    const p1 = { ...empty }
    const p2 = { ...empty }

    // 1) Aplicar dados guardados (HorarioMedicoDia) — mapear diaSemana (0–6) para coluna correta
    const getProp = (obj: Record<string, unknown>, ...keys: string[]): unknown => {
      for (const k of keys) {
        const v = obj[k]
        if (v !== undefined && v !== null) return v
      }
      return undefined
    }
    for (const d of dias) {
      const dobj = d as unknown as Record<string, unknown>
      const diaIdx = parseDiaSemana(getProp(dobj, 'diaSemana', 'DiaSemana'))
      const dayName = diaIdx != null && diaIdx >= 0 && diaIdx < DIAS.length ? DIAS[diaIdx] : undefined
      if (!dayName) continue
      const inicio = fromTimeSpan(getProp(dobj, 'inicio', 'Inicio') as string | null)
      const fim = fromTimeSpan(getProp(dobj, 'fim', 'Fim') as string | null)
      const sala = String(getProp(dobj, 'sala', 'Sala') ?? '')
      const vagas = getProp(dobj, 'vagas', 'Vagas') != null ? String(getProp(dobj, 'vagas', 'Vagas')) : ''
      const isManha = isPeriodoManha(d.periodo)
      if (isManha) {
        p1[dayName] = { inicio, fim, sala, vagas }
      } else {
        p2[dayName] = { inicio, fim, sala, vagas }
      }
    }

    // 2) Horário Completo: preencher apenas Segunda–Sexta; Sábado e Domingo ficam vazios
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
  }, [horarioMedicoId, diasSignature, horaCompFromServer, horarioCompleto])

  const handleGravarHorario = async () => {
    return doSaveHorario({ silent: false })
  }

  const doSaveHorario = async ({ silent }: { silent?: boolean }) => {
    if (!medicoId) {
      toast.error('Grave o médico primeiro para poder configurar o horário.')
      return
    }
    setIsSavingLocal(true)
    try {
      const svc = MedicosService('medicos')
      const payloadCab = {
        medicoId,
        tipoHorario: null as number | null,
        minMarcacao: toTimeSpan(intervaloMarcacao) || undefined,
        horaComp: horarioCompleto,
        primeiraConsulta: toTimeSpan(intervaloPrimeiraConsulta) || undefined,
        horarioFlexivel: horarioFlexivel,
      }

      // Sempre usar Create: o backend faz upsert (se já existir HorarioMedico para este médico, atualiza)
      const res = await svc.createHorarioMedico(payloadCab)
      if (res.info?.status !== ResponseStatus.Success || !res.info?.data) {
        const msg =
          (res.info as { messages?: Record<string, string[]> })?.messages?.['$']?.[0] ??
          Object.values((res.info as { messages?: Record<string, string[]> })?.messages ?? {})?.[0]?.[0] ??
          'Falha ao gravar horário'
        toast.error(msg)
        return
      }
      const hId = res.info.data as string

      // Horário Completo (legado): NÃO guardar Sábado (6) nem Domingo (0) na BD — ficam vazios ao reabrir
      const diasAPersistir =
        horarioCompleto ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6] // Segunda-Sexta vs todos

      for (const diaSemana of diasAPersistir) {
        for (const periodo of [0, 1] as Periodo[]) {
          const dayName = DIAS[diaSemana]
          const data = periodo === 0 ? periodo1[dayName] : periodo2[dayName]
          const inicio = toTimeSpan(data?.inicio ?? '') || undefined
          const fim = toTimeSpan(data?.fim ?? '') || undefined
          const sala = data?.sala?.trim() || undefined
          const vagas = data?.vagas?.trim() ? parseInt(data.vagas, 10) : undefined
          const payloadDia = {
            horarioMedicoId: hId,
            diaSemana: diaSemana as DiaSemana,
            periodo,
            inicio,
            fim,
            sala,
            vagas: vagas != null && !Number.isNaN(vagas) ? vagas : undefined,
          }
          await svc.createHorarioMedicoDia(payloadDia)
        }
      }

      // Horário Completo: remover Sábado/Domingo da BD se existirem
      if (horarioCompleto) {
        for (const diaSemana of [0, 6]) {
          for (const periodo of [0, 1] as Periodo[]) {
            const existing = diasByKey.get(`${diaSemana}-${periodo}`)
            if (existing?.id) {
              await svc.deleteHorarioMedicoDia(existing.id)
            }
          }
        }
      }

      if (!silent) {
        toast.success('Horário gravado com sucesso')
      }
      await queryClient.invalidateQueries({ queryKey: ['horario-medico', medicoId] })
      await queryClient.invalidateQueries({ queryKey: ['horario-medico-dia', hId] })
    } catch (err) {
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
      toast.error(message)
    } finally {
      setIsSavingLocal(false)
    }
  }

  const isLoading = loadingHorario || (!!horarioMedicoId && loadingDias)
  const isSaving = isSavingLocal

  useImperativeHandle(ref, () => ({
    saveHorario: () => doSaveHorario({ silent: true }),
  }), [doSaveHorario])

  return (
    <div className='space-y-6'>
      {medicoId && !hideSaveButton && (
        <div className='flex items-center justify-between gap-4'>
          <p className='text-sm text-muted-foreground'>
            {horarioMedicoId ? 'Horário carregado do servidor. Altere e grave para atualizar.' : 'Preencha e grave para criar o horário fixo.'}
          </p>
          {!isReadOnly && !hideSaveButton && (
            <Button
              type='button'
              size='sm'
              disabled={isSaving || isLoading}
              onClick={handleGravarHorario}
            >
              <Save className='h-4 w-4 mr-2' />
              Gravar horário
            </Button>
          )}
        </div>
      )}
      {isLoading && <p className='text-sm text-muted-foreground'>A carregar horário…</p>}
      {medicoId && !isLoading && (errorHorario || errorDias) && (
        <p className='text-sm text-destructive'>
          {errorHorario
            ? `Erro ao carregar horário: ${horarioError instanceof Error ? horarioError.message : 'Erro desconhecido'}`
            : `Erro ao carregar dias do horário: ${diasError instanceof Error ? diasError.message : 'Erro desconhecido'}`}
        </p>
      )}
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5'>Opções</h3>
        <div className='flex flex-wrap items-center gap-4'>
          <label className='flex items-center space-x-2 cursor-pointer'>
            <Checkbox
              checked={horarioCompleto}
              onCheckedChange={(c) => {
                setHorarioCompleto(!!c)
              }}
              disabled={isReadOnly}
            />
            <span className='text-sm font-normal'>Horário Completo</span>
          </label>
          <div className='flex items-center gap-2'>
            <label className='text-sm'>Intervalo Marcação</label>
            <Input
              type='time'
              className='h-7 w-24'
              value={intervaloMarcacao}
              onChange={(e) => setIntervaloMarcacao(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='text-sm'>Intervalo Marcação - 1ª Consulta</label>
            <Input
              type='time'
              className='h-7 w-24'
              value={intervaloPrimeiraConsulta}
              onChange={(e) => setIntervaloPrimeiraConsulta(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <label className='flex items-center space-x-2 cursor-pointer'>
            <Checkbox
              checked={horarioFlexivel}
              onCheckedChange={(c) => setHorarioFlexivel(!!c)}
              disabled={isReadOnly}
            />
            <span className='text-sm font-normal'>Horário Flexível</span>
          </label>
        </div>
      </section>

      <section className='overflow-x-auto'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5 mb-3'>Primeiro Período (Manhã)</h3>
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
                <th key={d} className='p-2 text-muted-foreground font-normal text-center'>
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
                      onChange={(e) => setPeriodo1((prev) => ({ ...prev, [d]: { ...prev[d], inicio: e.target.value } }))}
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
                      onChange={(e) => setPeriodo1((prev) => ({ ...prev, [d]: { ...prev[d], fim: e.target.value } }))}
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
                      onChange={(e) => setPeriodo1((prev) => ({ ...prev, [d]: { ...prev[d], sala: e.target.value } }))}
                      disabled={isReadOnly}
                    />
                    <Button type='button' variant='outline' size='icon' className='shrink-0 h-7 w-7' disabled={isReadOnly}>
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
                      onChange={(e) => setPeriodo1((prev) => ({ ...prev, [d]: { ...prev[d], vagas: e.target.value } }))}
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
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1.5 mb-3'>Segundo Período (Tarde)</h3>
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
                <th key={d} className='p-2 text-muted-foreground font-normal text-center'>
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
                      onChange={(e) => setPeriodo2((prev) => ({ ...prev, [d]: { ...prev[d], inicio: e.target.value } }))}
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
                      onChange={(e) => setPeriodo2((prev) => ({ ...prev, [d]: { ...prev[d], fim: e.target.value } }))}
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
                      onChange={(e) => setPeriodo2((prev) => ({ ...prev, [d]: { ...prev[d], sala: e.target.value } }))}
                      disabled={isReadOnly}
                    />
                    <Button type='button' variant='outline' size='icon' className='shrink-0 h-7 w-7' disabled={isReadOnly}>
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
                      onChange={(e) => setPeriodo2((prev) => ({ ...prev, [d]: { ...prev[d], vagas: e.target.value } }))}
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
