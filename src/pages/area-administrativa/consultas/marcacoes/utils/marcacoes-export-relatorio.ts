import { MarcacoesAdministrativoService } from '@/lib/services/consultas/marcacoes-administrativo-service'
import type { MarcacaoAdministrativoTableDTO } from '@/types/dtos/consultas/marcacoes-administrativo.dtos'
import type { MarcacoesListCriteria } from './marcacoes-list-criteria'

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadCsv(filename: string, rows: string[][]) {
  const header = [
    'Data',
    'Hora',
    'Nº Utente',
    'Utente',
    'Médico',
    'Especialidade',
    'Organismo',
    'Situação',
  ]
  const lines = [header, ...rows].map((r) => r.map(escapeCsv).join(','))
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportMarcacoesRelatorioCsv(
  listPermId: string,
  opts: {
    tipo: 'data' | 'medico' | 'utente'
    criteria: MarcacoesListCriteria
    utenteId?: string
  }
): Promise<{ ok: boolean; message?: string }> {
  const params = {
    pageNumber: 1,
    pageSize: 5000,
    dataDe: opts.criteria.dataDe ? `${opts.criteria.dataDe}T00:00:00` : undefined,
    dataAte: opts.criteria.dataAte ? `${opts.criteria.dataAte}T23:59:59` : undefined,
    medicoId: opts.tipo === 'medico' ? opts.criteria.medicoId : undefined,
    utenteId: opts.tipo === 'utente' ? opts.utenteId : undefined,
    especialidadeId: opts.criteria.especialidadeId || undefined,
    apenasAtivas: true,
  }

  if (opts.tipo === 'medico' && !params.medicoId) {
    return { ok: false, message: 'Selecione o médico na agenda.' }
  }
  if (opts.tipo === 'utente' && !params.utenteId) {
    return { ok: false, message: 'Indique o utente.' }
  }

  const res = await MarcacoesAdministrativoService(listPermId).getPaginated(params)
  if (!res.info?.data) {
    return { ok: false, message: 'Não foi possível obter marcações.' }
  }

  const items = res.info.data ?? []
  const rows = items.map((r: MarcacaoAdministrativoTableDTO) => [
    r.data ? String(r.data).slice(0, 10) : '',
    r.horaInicio ?? '',
    r.utenteNumero ?? '',
    r.utenteNome ?? '',
    r.medicoNome ?? '',
    r.especialidadeDesignacao ?? '',
    r.organismoNome ?? '',
    r.statusConsultaLabel ?? String(r.statusConsulta ?? ''),
  ])

  const suffix =
    opts.tipo === 'data'
      ? `${opts.criteria.dataDe ?? 'periodo'}`
      : opts.tipo === 'medico'
        ? 'medico'
        : 'utente'
  downloadCsv(`marcacoes-${suffix}.csv`, rows)
  return { ok: true }
}
