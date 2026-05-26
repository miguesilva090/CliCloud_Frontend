import { endOfWeek, format, startOfWeek } from 'date-fns'
import { getDataTrabalhoDate } from '@/lib/utils/data-trabalho'

export type MarcacoesListCriteria = {
  dataDe: string
  dataAte: string
  medicoId: string
  medicoLabel: string
  salaId: string
  salaLabel: string
  especialidadeId: string
  especialidadeLabel: string
}

export function defaultMarcacoesListCriteria(): MarcacoesListCriteria {
  const ref = getDataTrabalhoDate()
  const weekStart = startOfWeek(ref, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(ref, { weekStartsOn: 1 })
  return {
    dataDe: format(weekStart, 'yyyy-MM-dd'),
    dataAte: format(weekEnd, 'yyyy-MM-dd'),
    medicoId: '',
    medicoLabel: '',
    salaId: '',
    salaLabel: '',
    especialidadeId: '',
    especialidadeLabel: '',
  }
}
