import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast-utils'
import {
  DocumentosFichaClinicaService,
  type CreateDocumentoFichaClinicaRequest,
} from '@/lib/services/processo-clinico/documentos-ficha-clinica-service'

const documentosClient = () => DocumentosFichaClinicaService('PClinico_FichaClinica')

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


