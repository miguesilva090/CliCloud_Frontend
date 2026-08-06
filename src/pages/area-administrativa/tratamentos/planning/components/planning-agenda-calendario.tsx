import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import type { CalendarApi, DatesSetArg, EventClickArg } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import ptLocale from '@fullcalendar/core/locales/pt'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PlanningSessaoEventoDTO } from '@/types/dtos/tratamentos/planning-tratamento.dtos'
import {
  formatIsoDate,
  mapPlanningEventoToFullCalendar,
} from '../utils/planning-agenda-utils'
import {
  PLANNING_AGENDA_VIEW_ACTIVE,
  PLANNING_AGENDA_VIEW_IDLE,
  PLANNING_TIPO_LABELS,
} from '../utils/planning-agenda-cores'
import { formatDiaCabecalhoLegado } from '@/pages/area-administrativa/consultas/marcacoes/utils/marcacoes-agenda-format'

import './planning-agenda-calendario.css'

type AgendaViewId = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'

type Props = {
  eventos: PlanningSessaoEventoDTO[]
  onRangeChange: (dataDe: string, dataAte: string) => void
  isLoading?: boolean
}

/** Linhas verticais alinhadas às colunas do timegrid (paridade agenda consultas). */
function syncAgendaDayDividers(root: HTMLElement | null) {
  if (!root) return
  const timeBody = root.querySelector('.fc-timegrid-body')
  if (!timeBody) return

  const dayCols = root.querySelectorAll<HTMLElement>(
    '.fc-timegrid-cols td.fc-timegrid-col:not(.fc-timegrid-axis)'
  )
  if (dayCols.length === 0) return

  let overlay = timeBody.querySelector(
    '.planning-agenda-day-dividers'
  ) as HTMLDivElement | null
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = 'planning-agenda-day-dividers'
    overlay.setAttribute('aria-hidden', 'true')
    timeBody.appendChild(overlay)
  }

  const bodyRect = timeBody.getBoundingClientRect()
  overlay.replaceChildren()

  dayCols.forEach((col) => {
    const colRect = col.getBoundingClientRect()
    const line = document.createElement('div')
    line.className = 'planning-agenda-day-dividers__line'
    line.style.left = `${colRect.right - bodyRect.left}px`
    overlay.appendChild(line)
  })
}

export function PlanningAgendaCalendario({
  eventos,
  onRangeChange,
  isLoading = false,
}: Props) {
  const calRef = useRef<FullCalendar>(null)
  const agendaRootRef = useRef<HTMLDivElement>(null)
  const rangeReady = useRef(false)
  const [selected, setSelected] = useState<PlanningSessaoEventoDTO | null>(null)
  const [toolbarTitle, setToolbarTitle] = useState('')
  const [activeView, setActiveView] = useState<AgendaViewId>('timeGridWeek')

  const fcEvents = useMemo(
    () => eventos.map(mapPlanningEventoToFullCalendar),
    [eventos]
  )

  const getCalendarApi = (): CalendarApi | undefined =>
    calRef.current?.getApi()

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
    const ro = new ResizeObserver(() => {
      getCalendarApi()?.updateSize()
      requestAnimationFrame(syncDayDividers)
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [syncDayDividers])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      refreshToolbarFromApi()
      requestAnimationFrame(syncDayDividers)
    })
    return () => cancelAnimationFrame(id)
  }, [refreshToolbarFromApi, syncDayDividers, fcEvents, isLoading])

  useEffect(() => {
    const api = getCalendarApi()
    if (!api || rangeReady.current) return
    rangeReady.current = true
    const start = api.view.activeStart
    const endExclusive = api.view.activeEnd
    const end = new Date(endExclusive)
    end.setDate(end.getDate() - 1)
    onRangeChange(formatIsoDate(start), formatIsoDate(end))
  }, [onRangeChange])

  const onDatesSet = (arg: DatesSetArg) => {
    const end = new Date(arg.end)
    end.setDate(end.getDate() - 1)
    onRangeChange(formatIsoDate(arg.start), formatIsoDate(end))
    refreshToolbarFromApi()
  }

  const onEventClick = (arg: EventClickArg) => {
    const props = arg.event.extendedProps as PlanningSessaoEventoDTO
    setSelected({
      sessaoId: arg.event.id,
      tratamentoId: props.tratamentoId,
      title: arg.event.title,
      start: arg.event.start?.toISOString() ?? '',
      end: arg.event.end?.toISOString() ?? '',
      tipoEvento: props.tipoEvento,
      numSessao: props.numSessao,
      horaInicio: props.horaInicio,
      duracao: props.duracao,
      utenteNome: props.utenteNome,
      tratamentoDesignacao: props.tratamentoDesignacao,
      numSessoesTratamento: props.numSessoesTratamento,
      nFaltas: props.nFaltas,
      dataInicTratamento: props.dataInicTratamento,
      dataFimTratamento: props.dataFimTratamento,
      faltou: props.faltou,
      confirmado: props.confirmado,
      efetuado: props.efetuado,
    })
  }

  const navBtnClass =
    'h-8 border border-slate-300 bg-white text-sm text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900'
  const viewBtnClass = (active: boolean) =>
    cn(
      'h-8 min-w-[3.25rem] border text-sm shadow-sm',
      active
        ? 'border-slate-500 text-white hover:opacity-95'
        : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    )
  const viewBtnStyle = (active: boolean) => ({
    backgroundColor: active
      ? PLANNING_AGENDA_VIEW_ACTIVE
      : PLANNING_AGENDA_VIEW_IDLE,
  })

  return (
    <div className='space-y-3'>
      <div
        ref={agendaRootRef}
        className='planning-agenda-calendario relative bg-white'
      >
        <div className='planning-agenda-toolbar'>
          <div className='planning-agenda-toolbar__left'>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className={navBtnClass}
              aria-label='Anterior'
              onClick={() => getCalendarApi()?.prev()}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className={navBtnClass}
              aria-label='Seguinte'
              onClick={() => getCalendarApi()?.next()}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className={cn(navBtnClass, 'px-3')}
              onClick={() => getCalendarApi()?.today()}
            >
              Hoje
            </Button>
          </div>

          <div className='planning-agenda-toolbar__center'>{toolbarTitle}</div>

          <div className='planning-agenda-toolbar__right'>
            {(
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
            ))}
          </div>
        </div>

        {isLoading && (
          <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-slate-600'>
            A carregar planning…
          </div>
        )}

        <FullCalendar
          ref={calRef}
          plugins={[timeGridPlugin, dayGridPlugin]}
          initialView='timeGridWeek'
          locale={ptLocale}
          headerToolbar={false}
          dayHeaderContent={(arg) => formatDiaCabecalhoLegado(arg.date)}
          allDaySlot={false}
          displayEventTime={false}
          slotMinTime='08:00:00'
          slotMaxTime='19:00:00'
          slotDuration='00:30:00'
          slotLabelInterval='01:00:00'
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '08:00',
            endTime: '19:00',
          }}
          height='auto'
          firstDay={1}
          events={fcEvents}
          datesSet={onDatesSet}
          eventClick={onEventClick}
          eventClassNames={(arg) =>
            arg.event.id && arg.event.id === selected?.sessaoId
              ? ['planning-agenda-selecionada']
              : []
          }
          viewDidMount={() => {
            requestAnimationFrame(() => {
              refreshToolbarFromApi()
              requestAnimationFrame(syncDayDividers)
            })
          }}
        />
      </div>

      {selected && (
        <div className='rounded border border-slate-200 bg-white p-3 text-sm space-y-1'>
          <div className='font-medium'>{selected.utenteNome}</div>
          <div>
            {PLANNING_TIPO_LABELS[selected.tipoEvento] ?? 'Sessão'}
            {selected.numSessao != null ? ` · Sessão ${selected.numSessao}` : ''}
          </div>
          {selected.tratamentoDesignacao && (
            <div>{selected.tratamentoDesignacao}</div>
          )}
          <div>
            Hora {selected.horaInicio}
            {selected.duracao ? ` · Duração ${selected.duracao}` : ''}
          </div>
          {selected.numSessoesTratamento != null && (
            <div>Nº sessões tratamento: {selected.numSessoesTratamento}</div>
          )}
          {selected.nFaltas != null && <div>Faltas: {selected.nFaltas}</div>}
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='mt-1'
            onClick={() => setSelected(null)}
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  )
}
