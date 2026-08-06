import {
  PLANNING_TIPO_CORES,
  PLANNING_TIPO_LABELS,
} from '../utils/planning-agenda-cores'

const ITENS = Object.keys(PLANNING_TIPO_LABELS)
  .map(Number)
  .sort((a, b) => a - b)
  .map((codigo) => ({
    label: PLANNING_TIPO_LABELS[codigo],
    cor: PLANNING_TIPO_CORES[codigo],
  }))

function LegendaItem({ label, cor }: { label: string; cor: string }) {
  return (
    <div className='flex items-center gap-1.5 text-xs text-foreground/90'>
      <span
        className='inline-block h-3.5 w-3.5 shrink-0 border border-black/10'
        style={{ backgroundColor: cor }}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  )
}

/** Legenda inferior — mesmo padrão da Agenda Consultas. */
export function PlanningAgendaLegenda() {
  return (
    <div className='flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t bg-muted/20 px-3 py-2'>
      {ITENS.map((item) => (
        <LegendaItem key={item.label} label={item.label} cor={item.cor} />
      ))}
    </div>
  )
}
