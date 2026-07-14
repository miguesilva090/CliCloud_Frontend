import { useQuery } from '@tanstack/react-query'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import {
  DocumentosFichaClinicaService,
  type DocumentoFichaClinicaDTO,
  type CreateDocumentoFichaClinicaRequest,
} from '@/lib/services/processo-clinico/documentos-ficha-clinica-service'

const documentosClient = () => DocumentosFichaClinicaService('PClinico_FichaClinica')

export const useGetDocumentosFichaClinicaByUtente = (utenteId?: string, categoria = 'Clinico') => {
  return useQuery({
    queryKey: ['documentos-ficha-clinica', utenteId, categoria],
    enabled: !!utenteId,
    queryFn: async (): Promise<DocumentoFichaClinicaDTO[]> => {
      if (!utenteId) return []
      const client = documentosClient()
      const res: ResponseApi<GSResponse<DocumentoFichaClinicaDTO[]>> = await client.getByUtente(
        utenteId,
        categoria,
      )
      return res.info?.data ?? []
    },
  })
}

export {
  useUploadDocumentoFichaClinica,
  useDeleteDocumentoFichaClinica,
  useDeleteMultipleDocumentosFichaClinica,
} from './documentos-ficha-clinica-mutations'
