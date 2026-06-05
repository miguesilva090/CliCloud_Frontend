import type { DocumentoTableDTO } from '@/types/dtos/faturacao/documento.dtos'

export function podeEditarDocumento(doc: DocumentoTableDTO): boolean {
  return !doc.anulado
}

export function podeAnularDocumento(doc: DocumentoTableDTO): boolean {
  if (doc.anulado) return false
  if (!doc.estaEmitido) return false
  return true
}

export function podeCriarNotaCredito(doc: DocumentoTableDTO): boolean {
  if (doc.anulado) return false
  if (!doc.estaEmitido) return false
  return true
}

export function podeReimprimirDocumento(doc: DocumentoTableDTO): boolean {
  if (doc.anulado) return false
  return !!doc.estaEmitido
}

export function podeImprimirOriginalDocumento(doc: DocumentoTableDTO): boolean {
  if (!podeReimprimirDocumento(doc)) return false
  return (doc.tipoSerie ?? '').toUpperCase() === 'N'
}

export function podeEnviarEmailDocumento(doc: DocumentoTableDTO): boolean {
  if (doc.anulado) return false
  return !!doc.estaEmitido
}

export function podeLiquidarDocumento(doc: DocumentoTableDTO): boolean {
  if (doc.anulado) return false
  if (!doc.estaEmitido) return false
  if (doc.liquidado) return false
  return true
}

export function podeValidarTransporteDocumento(doc: DocumentoTableDTO): boolean {
  if (doc.anulado) return false
  const abrev = (doc.tipoDocumentoAbreviatura ?? '').toUpperCase()
  return abrev === 'GT' || abrev === 'GR'
}

export function podeEmitirFaturaDocumento(doc: DocumentoTableDTO): boolean {
  if (doc.anulado) return false
  const abrev = (doc.tipoDocumentoAbreviatura ?? '').toUpperCase()
  return abrev === 'GT' || abrev === 'GR' || abrev === 'CM' || abrev === 'FP'
}