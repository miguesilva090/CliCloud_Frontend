export type LinhaComPrecos = {
  quantidade: number
  pvp?: number | null
  comparticipacao?: number | null
  valorUtente?: number | null
}

export type TotaisReceita = {
  totalComparticipacao: number
  totalReceita: number
  totalUtente: number
}

function n(v: number | null | undefined): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : 0
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

/** Totais estilo legado: comparticipação e PVP × qtd. */
export function calcularTotaisReceita(linhas: LinhaComPrecos[]): TotaisReceita {
  let totalComparticipacao = 0
  let totalReceita = 0
  let totalUtente = 0

  for (const l of linhas) {
    const q = Math.max(1, l.quantidade || 1)
    totalComparticipacao += n(l.comparticipacao) * q
    totalReceita += n(l.pvp) * q
    totalUtente += n(l.valorUtente) * q
  }

  return {
    totalComparticipacao: round2(totalComparticipacao),
    totalReceita: round2(totalReceita),
    totalUtente: round2(totalUtente),
  }
}

export function formatEuro(v: number): string {
  return `${v.toFixed(2)} €`
}
