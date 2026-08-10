/** Extrai mensagens de validação/API (evita toast genérico "Validation Error"). */
export function extractReceitaApiError(
  err: unknown,
  fallback = 'Ocorreu um erro.'
): string {
  if (err == null) return fallback

  if (typeof err === 'object' && err !== null) {
    const e = err as {
      message?: string
      data?: unknown
      info?: unknown
    }

    const fromMessages = (messages: unknown): string | null => {
      if (!messages || typeof messages !== 'object') return null
      const flat = Object.values(messages as Record<string, string[]>)
        .flat()
        .filter(Boolean)
      return flat.length ? flat.join(' ') : null
    }

    const data = e.data ?? e.info
    if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>
      const msg = fromMessages(o.messages)
      if (msg) return msg
      if (typeof o.title === 'string' && o.title !== 'Validation Error')
        return o.title
    }

    if (typeof e.message === 'string' && e.message.trim()) {
      if (e.message !== 'Validation Error') return e.message.trim()
      // message genérico — tentar data outra vez
      if (e.data && typeof e.data === 'object') {
        const msg = fromMessages((e.data as { messages?: unknown }).messages)
        if (msg) return msg
      }
    }
  }

  if (typeof err === 'string' && err.trim()) return err.trim()
  return fallback
}
