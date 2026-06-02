import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'

export function getDocumentoNumeroLabel(row: {
  numeroExibicao?: string | null
  tipoDocumentoAbreviatura?: string | null
  numeroDocumento?: number | null
}): string {
  if (row.numeroExibicao?.trim()) return row.numeroExibicao.trim()
  const abrev = row.tipoDocumentoAbreviatura?.trim()
  const num = row.numeroDocumento
  if (abrev && num != null) return `${abrev} ${num}`
  if (num != null) return String(num)
  return '-'
}

export type DocumentoEstadoBadgeInput = {
  anulado: boolean
  rectificado: boolean
  liquidado: boolean
  estaEmitido: boolean
  estadoDocumentoLabel?: string | null
}

export function getDocumentoEstadoBadge(row: DocumentoEstadoBadgeInput): {
  label: string
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
} {
  if (row.anulado) return { label: 'Anulado', variant: 'destructive' }
  if (row.rectificado) return { label: 'Rectificado', variant: 'secondary' }
  if (row.estadoDocumentoLabel) {
    return { label: row.estadoDocumentoLabel, variant: 'outline' }
  }
  if (row.liquidado) return { label: 'Liquidado', variant: 'default' }
  if (row.estaEmitido) return { label: 'Emitido', variant: 'default' }
  return { label: '—', variant: 'outline' }
}

export function formatMoneyPt(value?: number | null): string {
  if (value == null) return '-'
  return Number(value).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDatePt(value?: string | null): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('pt-PT')
}

const RECIBO_ABREVIATURAS = new Set(['RC', 'REC', 'FR'])

export function isTipoDocumentoFaturacao(abreviatura?: string | null): boolean {
  const abrev = abreviatura?.trim().toUpperCase()
  if (!abrev) return true
  return !RECIBO_ABREVIATURAS.has(abrev)
}
