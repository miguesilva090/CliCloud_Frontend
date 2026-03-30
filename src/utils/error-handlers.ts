import { ResponseStatus } from '@/types/api/responses'
import { ResponseApi } from '@/types/responses'

interface ErrorInfo {
  status: ResponseStatus
  messages: Record<string, string[]> | string | string[] | unknown
}

export const getErrorMessage = (
  response: ResponseApi<ErrorInfo>,
  defaultMessage: string = 'Ocorreu um erro'
): string => {
  if (!response.info) return defaultMessage

  const { messages } = response.info

  if (Array.isArray(messages)) {
    return messages.join('\n• ')
  }

  if (typeof messages === 'string') {
    return messages
  }

  if (typeof messages === 'object' && messages !== null) {
    // Handle new structure with field-specific messages
    if (typeof messages === 'object' && !Array.isArray(messages)) {
      const allMessages: string[] = []
      Object.entries(messages).forEach(([field, fieldMessages]) => {
        if (Array.isArray(fieldMessages)) {
          fieldMessages.forEach((msg) => {
            allMessages.push(field === '$' ? msg : `${field}: ${msg}`)
          })
        }
      })
      if (allMessages.length > 0) {
        return allMessages.join('\n• ')
      }
    }

    const errors = Object.values(messages)
    if (errors.length > 0) {
      return '• ' + errors.flat().join('\n• ')
    }
  }

  return defaultMessage
}

export const getPartialSuccessMessage = (
  response: ResponseApi<ErrorInfo>,
  defaultMessage: string = 'Operação concluída com avisos'
): string => {
  if (!response.info) return defaultMessage

  const { messages } = response.info

  if (
    typeof messages === 'object' &&
    messages !== null &&
    !Array.isArray(messages)
  ) {
    const allMessages: string[] = []
    Object.entries(messages).forEach(([field, fieldMessages]) => {
      if (Array.isArray(fieldMessages)) {
        fieldMessages.forEach((msg) => {
          allMessages.push(field === '$' ? msg : `${field}: ${msg}`)
        })
      }
    })
    if (allMessages.length > 0) {
      return allMessages.join('\n• ')
    }
  }

  return defaultMessage
}

export const handleApiError = (
  error: unknown,
  defaultMessage: string = 'Ocorreu um erro'
): string => {
  console.log(error)
  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object' && 'info' in error) {
    const apiResponse = error as ResponseApi<ErrorInfo>
    return getErrorMessage(apiResponse, defaultMessage)
  }

  return defaultMessage
}
