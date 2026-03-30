import { DocumentosFichaClinicaClient } from '@/lib/services/processo-clinico/documentos-ficha-clinica-service/documentos-ficha-clinica-client'

export const DocumentosFichaClinicaService = (idFuncionalidade = 'PClinico_FichaClinica') =>
  new DocumentosFichaClinicaClient(idFuncionalidade)

export * from '@/lib/services/processo-clinico/documentos-ficha-clinica-service/documentos-ficha-clinica-client'

