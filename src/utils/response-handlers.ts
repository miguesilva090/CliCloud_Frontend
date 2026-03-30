import { ResponseStatus } from '@/types/api/responses'
import { ResponseApi } from '@/types/responses'
import { getErrorMessage, getPartialSuccessMessage } from './error-handlers'
import { toast } from './toast-utils'

interface ApiResponseInfo {
  status: ResponseStatus
  messages: Record<string, string[]>
  data?: unknown
}

/**
 * Handles API responses and shows appropriate toast messages
 * @param response - The API response
 * @param successMessage - Message to show on success
 * @param errorMessage - Message to show on error
 * @param partialSuccessMessage - Message to show on partial success
 * @returns Object with success status and data
 */
export const handleApiResponse = <T>(
  response: ResponseApi<ApiResponseInfo>,
  successMessage: string = 'Operação realizada com sucesso',
  errorMessage: string = 'Erro ao realizar operação',
  partialSuccessMessage: string = 'Operação concluída com avisos'
): { success: boolean; data?: T; isPartialSuccess?: boolean } => {
  if (!response.info) {
    toast.error('Resposta inválida do servidor')
    return { success: false }
  }

  const { status, data } = response.info

  // Handle new response structure with status field
  switch (status) {
    case ResponseStatus.Success:
      toast.success(successMessage)
      return { success: true, data: data as T }

    case ResponseStatus.PartialSuccess:
      const partialMessage = getPartialSuccessMessage(
        response,
        partialSuccessMessage
      )
      toast.partialSuccess(partialMessage)
      return { success: true, data: data as T, isPartialSuccess: true }

    case ResponseStatus.Failure:
      const errorMsg = getErrorMessage(response, errorMessage)
      toast.error(errorMsg)
      return { success: false }

    default:
      toast.error('Status de resposta desconhecido')
      return { success: false }
  }
}

/**
 * Checks if a response is a partial success
 */
export const isPartialSuccess = (
  response: ResponseApi<ApiResponseInfo>
): boolean => {
  return response.info?.status === ResponseStatus.PartialSuccess
}

/**
 * Checks if a response is a full success
 */
export const isFullSuccess = (
  response: ResponseApi<ApiResponseInfo>
): boolean => {
  return response.info?.status === ResponseStatus.Success
}

/**
 * Checks if a response is a failure
 */
export const isFailure = (response: ResponseApi<ApiResponseInfo>): boolean => {
  return response.info?.status === ResponseStatus.Failure
}
