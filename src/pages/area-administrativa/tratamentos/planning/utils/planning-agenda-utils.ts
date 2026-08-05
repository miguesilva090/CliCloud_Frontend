import type { EventInput } from "@fullcalendar/core";
import type { PlanningSessaoEventoDTO } from "@/types/dtos/tratamentos/planning-tratamento.dtos";
import { corPorTipoPlanning, PLANNING_TIPO_LABELS } from "./planning-agenda-cores";

export function mapPlanningEventoToFullCalendar(
    ev: PlanningSessaoEventoDTO
): EventInput {
    const bg = corPorTipoPlanning(ev.tipoEvento);
    return {
        id: ev.sessaoId,
        title: ev.title,
        start: ev.start,
        end: ev.end,
        backgroundColor: bg,
        borderColor: bg,
        extendedProps: {
            ...ev,
            tipoLabel: PLANNING_TIPO_LABELS[ev.tipoEvento] ?? 'Sessão',
        },
    }
}

export function formatIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}