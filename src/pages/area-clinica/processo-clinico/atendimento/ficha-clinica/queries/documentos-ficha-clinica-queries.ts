import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'

import { DocumentosFichaClinicaService } from '@/lib/services/processo-clinico/documentos-ficha-clinica-service'
import type { DocumentoFichaClinicaDTO, CreateDocumentoFichaClinicaRequest } from '@/lib/services/processo-clinico/documentos-ficha-clinica-service'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'

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

export const useUploadDocumentoFichaClinica = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { data: CreateDocumentoFichaClinicaRequest; file: File }) => {
      const client = documentosClient()
      return client.upload(params.data, params.file)
    },
    onSuccess: (_res, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['documentos-ficha-clinica', variables.data.utenteId],
      })
      toast.success('Documento anexado com sucesso.')
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erro ao anexar documento.'
      toast.error(message)
    },
  })
}

export const useDeleteDocumentoFichaClinica = (utenteId?: string, categoria = 'Clinico') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const client = documentosClient()
      return client.delete(id)
    },
    onSuccess: () => {
      if (utenteId) {
        void queryClient.invalidateQueries({
          queryKey: ['documentos-ficha-clinica', utenteId, categoria],
        })
      }
      toast.success('Documento apagado com sucesso.')
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erro ao apagar documento.'
      toast.error(message)
    },
  })
}

export const useDeleteMultipleDocumentosFichaClinica = (utenteId?: string, categoria = 'Clinico') => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const client = documentosClient()
      return client.deleteMultiple(ids)
    },
    onSuccess: () => {
      if (utenteId) {
        void queryClient.invalidateQueries({
          queryKey: ['documentos-ficha-clinica', utenteId, categoria],
        })
      }
      toast.success('Documentos apagados com sucesso.')
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Erro ao apagar documentos.'
      toast.error(message)
    },
  })
}

