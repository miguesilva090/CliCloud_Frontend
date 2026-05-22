import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import type { CalendarApi } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptLocale from '@fullcalendar/core/locales/pt'
import type {
  DateSelectArg,
  DateSpanApi,
  EventClickArg,
  EventDropArg,
} from '@fullcalendar/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast-utils'
import { ResponseStatus } from '@/types/api/responses'
import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import { useMarcacoesAgendaCalendario } from '../queries/marcacoes-agenda-calendario-queries'
import { useMarcacoesDisponibilidadeMes } from '../queries/marcacoes-agenda-disponibilidade-queries'
import { MARCACOES_AGENDA_ACTION_BLUE } from '../utils/marcacoes-agenda-cores'
import type { MarcacoesListCriteria } from '../utils/marcacoes-list-criteria'
import {
  formatIsoDate,
  formatTimeForApi,
  mapCalendarioEventoToFullCalendar,
  toFullCalendarTime,
} from '../utils/marcacoes-agenda-utils'
import { isEventoMarcacao } from '../utils/marcacoes-agenda-cores'
import {
  isTipoEventoPermiteMarcacaoNoBloco,
  mensagemParaTipoEvento,
  podeMarcarNoIntervalo,
  resolveDiasOcultos,
  resolveDiasUteis,
} from '../utils/marcacoes-agenda-disponibilidade'
import { formatDiaCabecalhoLegado } from '../utils/marcacoes-agenda-format'
import { toTimeSpan } from '../modals/marcacao-administrativo-form-utils'
import {
  MARCACOES_AGENDA_TEAL,
  MARCACOES_AGENDA_TEAL_ACTIVE,
} from '../utils/marcacoes-agenda-cores'

import './marcacoes-agenda-calendario.css'

type AgendaViewId = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'

/** Linhas verticais alinhadas às colunas reais do timegrid (não ao cabeçalho em scroll separado). */
function syncAgendaDayDividers(root: HTMLElement | null) {
  if (!root) return
  const timeBody = root.querySelector('.fc-timegrid-body')
  if (!timeBody) return

  const dayCols = root.querySelectorAll<HTMLElement>(
    '.fc-timegrid-cols td.fc-timegrid-col:not(.fc-timegrid-axis)'
  )
  if (dayCols.length === 0) return

  let overlay = timeBody.querySelector(
    '.marcacoes-agenda-day-dividers'
  ) as HTMLDivElement | null
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = 'marcacoes-agenda-day-dividers'
    overlay.setAttribute('aria-hidden', 'true')
    timeBody.appendChild(overlay)
  }

  const bodyRect = timeBody.getBoundingClientRect()
  overlay.replaceChildren()

  dayCols.forEach((col) => {
    const colRect = col.getBoundingClientRect()
    const line = document.createElement('div')
    line.className = 'marcacoes-agenda-day-dividers__line'
    line.style.left = `${colRect.right - bodyRect.left}px`
    overlay.appendChild(line)
  })
}

type Props = {
  criteria: MarcacoesListCriteria
  listPermId: string
  canChange: boolean
  modoDisponibilidade?: boolean
  selectedMarcacaoId?: string | null
  onSelectMarcacao?: (marcacaoId: string | null) => void
  onWeekRangeChange: (dataDe: string, dataAte: string) => void
  onPickMedicoDisponibilidade?: (medicoId: string, medicoNome: string, dataIso: string) => void
  onCreateSlot: (data: string, horaInicio: string) => void
  onOpenMarcacao: (row: MarcacaoAdministrativoTableDTO) => void
  onOpenMarcacaoById: (marcacaoId: string) => void
  onRefresh: () => void
}

export function MarcacoesAgendaCalendario({
  criteria,
  listPermId,
  canChange,
  modoDisponibilidade = false,
  selectedMarcacaoId = null,
  onSelectMarcacao,
  onWeekRangeChange,
  onPickMedicoDisponibilidade,
  onCreateSlot,
  onOpenMarcacao,
  onOpenMarcacaoById,
  onRefresh,
}: Props) {
  const calendarRef = useRef<FullCalendar>(null)
  const agendaRootRef = useRef<HTMLDivElement>(null)
  const temMedico = !!criteria.medicoId
  const temEspecialidade = !!criteria.especialidadeId
  const [toolbarTitle, setToolbarTitle] = useState('')
  const [activeView, setActiveView] = useState<AgendaViewId>('timeGridWeek')
  const [dispMes, setDispMes] = useState(() => new Date().getMonth() + 1)
  const [dispAno, setDispAno] = useState(() => new Date().getFullYear())

  const getCalendarApi = (): CalendarApi | undefined =>
    calendarRef.current?.getApi()

  const syncDayDividers = useCallback(() => {
    syncAgendaDayDividers(agendaRootRef.current)
  }, [])

  const refreshToolbarFromApi = useCallback(() => {
    const api = getCalendarApi()
    if (!api) return
    setToolbarTitle(api.view.title)
    const viewType = api.view.type
    if (
      viewType === 'timeGridDay' ||
      viewType === 'timeGridWeek' ||
      viewType === 'dayGridMonth'
    ) {
      setActiveView(viewType)
    }
    syncDayDividers()
  }, [syncDayDividers])

  useEffect(() => {
    const root = agendaRootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => syncDayDividers())
    ro.observe(root)
    return () => ro.disconnect()
  }, [syncDayDividers])

  useEffect(() => {
    if (!modoDisponibilidade) return
    const api = getCalendarApi()
    if (api && api.view.type !== 'dayGridMonth') {
      api.changeView('dayGridMonth')
      setActiveView('dayGridMonth')
    }
  }, [modoDisponibilidade])

  const { data: calendario, isLoading, isFetching, isError, error } =
    useMarcacoesAgendaCalendario(criteria, temMedico && !modoDisponibilidade)

  const {
    data: dispEventos = [],
    isLoading: dispLoading,
    isFetching: dispFetching,
    isError: dispError,
    error: dispErr,
  } = useMarcacoesDisponibilidadeMes(
    listPermId,
    criteria.especialidadeId,
    dispMes,
    dispAno,
    modoDisponibilidade && temEspecialidade
  )

  const config = calendario?.config
  const eventosRaw = temMedico ? (calendario?.eventos ?? []) : []
  const slotMin = '08:00:00'
  const slotMax = '19:00:00'
  const slotDuration = toFullCalendarTime(config?.intervaloMarcacao, '00:30:00')
  const hiddenDays = useMemo(() => resolveDiasOcultos(config), [config])
  const diasUteis = useMemo(() => resolveDiasUteis(config), [config])

  const businessHours = useMemo(
    () => ({
      daysOfWeek: diasUteis,
      startTime: '08:00',
      endTime: '19:00',
    }),
    [diasUteis]
  )

  const eventsAgenda = useMemo(
    () =>
      eventosRaw
        .map(mapCalendarioEventoToFullCalendar)
        .filter((e): e is NonNullable<typeof e> => e != null),
    [eventosRaw]
  )

  const eventsDisponibilidade = useMemo(
    () =>
      dispEventos.map((evt) => ({
        id: String(evt.id),
        title: evt.title,
        start: evt.start,
        end: evt.end,
        backgroundColor: MARCACOES_AGENDA_ACTION_BLUE,
        borderColor: MARCACOES_AGENDA_ACTION_BLUE,
        extendedProps: {
          tipoEvento: 'DisponibilidadeMedico',
          medicoId: evt.medicoId,
        },
      })),
    [dispEventos]
  )

  const events = modoDisponibilidade ? eventsDisponibilidade : eventsAgenda

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      refreshToolbarFromApi()
      requestAnimationFrame(syncDayDividers)
    })
    return () => cancelAnimationFrame(id)
  }, [refreshToolbarFromApi, syncDayDividers, events, isLoading, isFetching, hiddenDays])

  const validarSlotMarcacao = (start: Date, end?: Date): boolean => {
    const endSlot = end ?? new Date(start.getTime() + 30 * 60 * 1000)
    const resultado = podeMarcarNoIntervalo(start, endSlot, config, eventosRaw)
    if (!resultado.ok) {
      toast.error(resultado.mensagem ?? 'Horário indisponível.')
      return false
    }
    return true
  }

  const tentarAbrirCriacao = (start: Date, end?: Date) => {
    if (!canChange) return
    if (!criteria.medicoId) {
      toast.error('Selecione o médico.')
      return
    }
    if (!validarSlotMarcacao(start, end)) return
    onCreateSlot(formatIsoDate(start), formatTimeForApi(start).slice(0, 5))
  }

  const handleDatesSet = (info: { start: Date; end: Date }) => {
    if (modoDisponibilidade) {
      const anchor = info.start
      setDispMes(anchor.getMonth() + 1)
      setDispAno(anchor.getFullYear())
    }
    const dataDe = formatIsoDate(info.start)
    const endInclusive = new Date(info.end)
    endInclusive.setDate(endInclusive.getDate() - 1)
    const dataAte = formatIsoDate(endInclusive)
    if (!modoDisponibilidade) {
      onWeekRangeChange(dataDe, dataAte)
    }
    requestAnimationFrame(() => {
      refreshToolbarFromApi()
      requestAnimationFrame(syncDayDividers)
    })
  }

  const handleDateClick = (info: { date: Date; allDay: boolean }) => {
    if (info.allDay) return
    tentarAbrirCriacao(info.date)
  }

  const handleSelectAllow = (span: DateSpanApi) =>
    temMedico && podeMarcarNoIntervalo(span.start, span.end, config, eventosRaw).ok

  const handleEventClick = (arg: EventClickArg) => {
    if (modoDisponibilidade) {
      const medicoId = arg.event.extendedProps.medicoId as string | undefined
      const nome = arg.event.title ?? ''
      const dataIso = arg.event.start ? formatIsoDate(arg.event.start) : ''
      if (medicoId && dataIso) {
        onPickMedicoDisponibilidade?.(medicoId, nome, dataIso)
      }
      return
    }

    const tipo = arg.event.extendedProps.tipoEvento as string | undefined
    const tipoNorm = tipo ?? ''

    if (isTipoEventoPermiteMarcacaoNoBloco(tipoNorm)) {
      if (arg.event.start) tentarAbrirCriacao(arg.event.start, arg.event.end ?? undefined)
      return
    }

    const msg = mensagemParaTipoEvento(tipoNorm)
    if (msg) {
      toast.error(msg)
      return
    }

    if (!isEventoMarcacao(tipoNorm)) return

    const marcacaoId = arg.event.extendedProps.marcacaoId as string | undefined
    if (marcacaoId) onSelectMarcacao?.(marcacaoId)
  }

  const abrirEdicaoMarcacao = (
    marcacaoId: string,
    row?: MarcacaoAdministrativoTableDTO
  ) => {
    if (row) onOpenMarcacao(row)
    else onOpenMarcacaoById(marcacaoId)
  }

  const handleEventDrop = async (arg: EventDropArg) => {
    if (!canChange) {
      arg.revert()
      return
    }
    const marcacaoId = arg.event.extendedProps.marcacaoId as string | undefined
    if (!marcacaoId || !arg.event.start) {
      arg.revert()
      return
    }

    const novaData = formatIsoDate(arg.event.start)
    const novaHora = formatTimeForApi(arg.event.start)
    const endSlot = arg.event.end ?? new Date(arg.event.start.getTime() + 30 * 60 * 1000)

    if (!podeMarcarNoIntervalo(arg.event.start, endSlot, config, eventosRaw).ok) {
      arg.revert()
      toast.error('Não é possível mover a marcação para um horário indisponível.')
      return
    }

    try {
      const res = await MarcacoesAdministrativoService(listPermId).mudarHorario(marcacaoId, {
        data: `${novaData}T00:00:00`,
        horaInicio: toTimeSpan(novaHora.slice(0, 5)) as string,
      })
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Horário atualizado.')
        onRefresh()
      } else {
        arg.revert()
        toast.error('Não foi possível alterar o horário.')
      }
    } catch {
      arg.revert()
      toast.error('Não foi possível alterar o horário.')
    }
  }

  const navBtnClass =
    'h-8 border-0 text-sm text-white shadow-sm hover:opacity-95'
  const navBtnStyle = { backgroundColor: MARCACOES_AGENDA_TEAL }
  const viewBtnClass = (active: boolean) =>
    cn('h-8 min-w-[3.25rem] border-0 text-sm text-white shadow-sm hover:opacity-95')
  const viewBtnStyle = (active: boolean) => ({
    backgroundColor: active ? MARCACOES_AGENDA_TEAL_ACTIVE : MARCACOES_AGENDA_TEAL,
  })

  return (
    <div ref={agendaRootRef} className='marcacoes-agenda-calendario relative bg-white'>
      <div className='marcacoes-agenda-toolbar'>
        <div className='marcacoes-agenda-toolbar__left'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className={navBtnClass}
            style={navBtnStyle}
            aria-label='Semana anterior'
            onClick={() => getCalendarApi()?.prev()}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className={navBtnClass}
            style={navBtnStyle}
            aria-label='Semana seguinte'
            onClick={() => getCalendarApi()?.next()}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className={cn(navBtnClass, 'px-3')}
            style={navBtnStyle}
            onClick={() => getCalendarApi()?.today()}
          >
            Hoje
          </Button>
        </div>

        <div className='marcacoes-agenda-toolbar__center'>{toolbarTitle}</div>

        <div className='marcacoes-agenda-toolbar__right'>
          {!modoDisponibilidade
            ? (
            [
              ['timeGridDay', 'Dia'],
              ['timeGridWeek', 'Semana'],
              ['dayGridMonth', 'Mês'],
            ] as const
          ).map(([viewId, label]) => (
            <Button
              key={viewId}
              type='button'
              variant='outline'
              size='sm'
              className={viewBtnClass(activeView === viewId)}
              style={viewBtnStyle(activeView === viewId)}
              onClick={() => getCalendarApi()?.changeView(viewId)}
            >
              {label}
            </Button>
          ))
            : null}
        </div>
      </div>

      {modoDisponibilidade && !temEspecialidade && (
        <div className='marcacoes-agenda-calendario__hint absolute inset-0 z-[5] flex items-center justify-center bg-white/75'>
          <p className='rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 shadow-sm'>
            Selecione a especialidade para ver disponibilidade dos médicos.
          </p>
        </div>
      )}

      {!modoDisponibilidade && !temMedico && (
        <div className='marcacoes-agenda-calendario__hint absolute inset-0 z-[5] flex items-center justify-center bg-white/75'>
          <p className='rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 shadow-sm'>
            Selecione o médico para carregar o horário na agenda.
          </p>
        </div>
      )}

      {!modoDisponibilidade && temMedico && isError && (
        <div className='border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800'>
          {error instanceof Error ? error.message : 'Não foi possível carregar o calendário.'}
        </div>
      )}

      {modoDisponibilidade && temEspecialidade && dispError && (
        <div className='border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800'>
          {dispErr instanceof Error ? dispErr.message : 'Não foi possível carregar disponibilidade.'}
        </div>
      )}

      {((modoDisponibilidade && temEspecialidade && (dispLoading || dispFetching)) ||
        (!modoDisponibilidade && temMedico && (isLoading || isFetching))) && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-slate-600'>
          {modoDisponibilidade ? 'A carregar disponibilidade…' : 'A carregar agenda…'}
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        locale={ptLocale}
        initialView={modoDisponibilidade ? 'dayGridMonth' : 'timeGridWeek'}
        headerToolbar={false}
        dayHeaderContent={(arg) => formatDiaCabecalhoLegado(arg.date)}
        allDaySlot={false}
        displayEventTime={false}
        slotMinTime={slotMin}
        slotMaxTime={slotMax}
        slotDuration={slotDuration}
        slotLabelInterval='01:00:00'
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        hiddenDays={hiddenDays.length > 0 ? hiddenDays : undefined}
        eventClassNames={(arg) => {
          const id = arg.event.extendedProps.marcacaoId as string | undefined
          return id && id === selectedMarcacaoId ? ['marcacao-agenda-selecionada'] : []
        }}
        eventDidMount={(info) => {
          if (!isEventoMarcacao(info.event.extendedProps.tipoEvento as string)) return
          const marcacaoId = info.event.extendedProps.marcacaoId as string | undefined
          if (!marcacaoId) return
          const row = info.event.extendedProps.row as MarcacaoAdministrativoTableDTO | undefined
          const onDbl = () => abrirEdicaoMarcacao(marcacaoId, row)
          info.el.addEventListener('dblclick', onDbl)
          info.el.style.cursor = 'pointer'
          ;(info.el as HTMLElement & { __dblMarcacao?: () => void }).__dblMarcacao = onDbl
        }}
        eventWillUnmount={(info) => {
          const el = info.el as HTMLElement & { __dblMarcacao?: () => void }
          if (el.__dblMarcacao) el.removeEventListener('dblclick', el.__dblMarcacao)
        }}
        businessHours={businessHours}
        selectConstraint={!modoDisponibilidade && temMedico ? 'businessHours' : undefined}
        height='auto'
        editable={!modoDisponibilidade && canChange && temMedico}
        eventDurationEditable={false}
        selectable={!modoDisponibilidade && canChange && temMedico}
        selectMirror
        selectAllow={handleSelectAllow}
        events={events}
        datesSet={handleDatesSet}
        viewDidMount={() => {
          requestAnimationFrame(() => {
            refreshToolbarFromApi()
            requestAnimationFrame(syncDayDividers)
          })
        }}
        dateClick={modoDisponibilidade ? undefined : handleDateClick}
        eventClick={handleEventClick}
        eventDrop={modoDisponibilidade ? undefined : handleEventDrop}
        select={
          modoDisponibilidade
            ? undefined
            : (arg: DateSelectArg) => {
                tentarAbrirCriacao(arg.start, arg.end)
              }
        }
        firstDay={1}
      />
    </div>
  )
}
