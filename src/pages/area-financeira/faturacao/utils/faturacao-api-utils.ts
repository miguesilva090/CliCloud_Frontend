import { ResponseStatus, type GSResponse } from '@/types/api/responses'

function extractMessageFromUnknown(messages: unknown): string | null {
  if (typeof messages === 'string') {
    const trimmed = messages.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (Array.isArray(messages) && messages.length > 0) {
    return String(messages[0])
  }

  if (messages && typeof messages === 'object') {
    const record = messages as Record<string, string[]>
    if (record.$?.length) return record.$[0]
    const firstKey = Object.keys(record)[0]
    if (firstKey && record[firstKey]?.[0]) return record[firstKey][0]
  }

  return null
}

export function getFaturacaoApiErrorMessage(
  info: unknown,
  fallback: string,
): string {
  if (!info || typeof info !== 'object') return fallback

  const message = extractMessageFromUnknown(
    (info as GSResponse<unknown>).messages,
  )
  return message ?? fallback
}

export function isFaturacaoApiSuccess(info: unknown): boolean {
  if (!info || typeof info !== 'object') return false
  return (info as GSResponse<unknown>).status === ResponseStatus.Success
}
