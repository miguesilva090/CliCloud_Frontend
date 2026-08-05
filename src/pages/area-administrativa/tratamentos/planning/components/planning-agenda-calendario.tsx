import { useEffect, useMemo, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import ptLocale from '@fullcalendar/core/locales/pt'
import { Button } from '@/components/ui/button'
import type { PlanningSessaoEventoDTO } from '@/types/dtos/tratamentos/planning-tratamento.dtos'
import {
  formatIsoDate,
  mapPlanningEventoToFullCalendar,
} from '../utils/planning-agenda-utils'
import { PLANNING_TIPO_LABELS } from '../utils/planning-agenda-cores'

type Props = {
  eventos: PlanningSessaoEventoDTO[]
  onRangeChange: (dataDe: string, dataAte: string) => void
}

export function PlanningAgendaCalendario({ eventos, onRangeChange }: Props) {
  const calRef = useRef<FullCalendar>(null)
  const [selected, setSelected] = useState<PlanningSessaoEventoDTO | null>(null)
  const rangeReady = useRef(false)

  const fcEvents = useMemo(
    () => eventos.map(mapPlanningEventoToFullCalendar),
    [eventos]
  )

  useEffect(() => {
    const api = calRef.current?.getApi()
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

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap gap-2'>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => calRef.current?.getApi().changeView('timeGridDay')}
        >
          Dia
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => calRef.current?.getApi().changeView('timeGridWeek')}
        >
          Semana
        </Button>
        <Button
          type='button'
          size='sm'
          variant='outline'
          onClick={() => calRef.current?.getApi().changeView('dayGridMonth')}
        >
          Mês
        </Button>
      </div>

      <FullCalendar
        ref={calRef}
        plugins={[timeGridPlugin, dayGridPlugin]}
        initialView='timeGridWeek'
        locale={ptLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '',
        }}
        height='auto'
        slotMinTime='07:00:00'
        slotMaxTime='21:00:00'
        allDaySlot={false}
        events={fcEvents}
        datesSet={onDatesSet}
        eventClick={onEventClick}
      />

      {selected && (
        <div className='rounded border p-3 text-sm space-y-1 bg-muted/30'>
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
