import { toast } from '@/utils/toast-utils'

export const getFirstValidationMessage = (errors: unknown): string | null => {
  const stack: unknown[] = [errors]
  while (stack.length > 0) {
    const current = stack.shift()
    if (!current || typeof current !== 'object') continue
    const msg = (current as { message?: unknown }).message
    if (typeof msg === 'string' && msg.trim()) return msg
    for (const value of Object.values(current)) stack.push(value)
  }
  return null
}

export const toastFirstValidationMessage = (errors: unknown) => {
  const msg = getFirstValidationMessage(errors)
  toast.error(msg || 'Corrija os erros do formulário antes de gravar.')
}

