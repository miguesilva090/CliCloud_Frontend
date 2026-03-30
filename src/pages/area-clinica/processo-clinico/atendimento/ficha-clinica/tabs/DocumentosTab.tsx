import type { DocumentosFichaClinicaTabProps } from './DocumentosFichaClinicaTab'
import { DocumentosFichaClinicaTab } from './DocumentosFichaClinicaTab'

export type { DocumentosFichaClinicaTabProps as DocumentosTabProps }

export function DocumentosTab(props: DocumentosFichaClinicaTabProps) {
  return <DocumentosFichaClinicaTab {...props} />
}

