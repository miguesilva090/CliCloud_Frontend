import { MARCACOES_AGENDA_CORES } from '../utils/marcacoes-agenda-cores'

/** Legenda fixa como no legado MarcacoesLst (barra inferior do calendário). */
const ITENS_LEGADO: Array<{ label: string; cor: string }> = [
  { label: '1ª consulta', cor: MARCACOES_AGENDA_CORES.primeiraConsulta },
  { label: 'Subsequente', cor: MARCACOES_AGENDA_CORES.subsequente },
  { label: 'Av. Final', cor: MARCACOES_AGENDA_CORES.avFinal },
  { label: 'Pós Operatório', cor: MARCACOES_AGENDA_CORES.posOperatorio },
  { label: 'Indisponível', cor: MARCACOES_AGENDA_CORES.indisponivel },
  { label: 'V. Extra', cor: MARCACOES_AGENDA_CORES.vagasExtra },
  { label: 'Feriado', cor: MARCACOES_AGENDA_CORES.feriado },
]

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

export function MarcacoesAgendaLegenda() {
  return (
    <div className='flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t bg-muted/20 px-3 py-2'>
      {ITENS_LEGADO.map((item) => (
        <LegendaItem key={item.label} label={item.label} cor={item.cor} />
      ))}
    </div>
  )
}
