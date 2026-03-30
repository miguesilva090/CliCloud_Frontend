import type { FieldErrors, FieldValues } from 'react-hook-form'
import { z } from 'zod'

/**
 * Converte ZodError no formato FieldErrors (aninhado) para react-hook-form.
 * Usado quando o zodResolver lança em vez de devolver erros (ex.: onInvalid não é chamado).
 */
function setByPath(
  obj: Record<string, unknown>,
  path: (string | number)[],
  value: { message: string; type?: string }
): void {
  let current: Record<string, unknown> = obj
  for (let i = 0; i < path.length - 1; i++) {
    const key = String(path[i])
    const nextKey = path[i + 1]
    if (!(key in current)) {
      current[key] = typeof nextKey === 'number' ? [] : {}
    }
    current = current[key] as Record<string, unknown>
  }
  const lastKey = path[path.length - 1]
  if (current && (typeof lastKey === 'string' || typeof lastKey === 'number')) {
    current[String(lastKey)] = value
  }
}

export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError
}

export function zodErrorToFieldErrors<TFieldValues extends FieldValues = FieldValues>(
  error: z.ZodError
): FieldErrors<TFieldValues> {
  const result: Record<string, unknown> = {}
  for (const issue of error.issues) {
    const path = (issue.path.length ? issue.path : ['_root']) as (string | number)[]
    const message = issue.message
    const type = issue.code
    setByPath(result, path, { message, type })
  }
  return result as FieldErrors<TFieldValues>
}

/** Converte erros aninhados em lista de { path, message } para setError. */
function flattenErrors(
  obj: Record<string, unknown>,
  prefix = ''
): Array<{ path: string; message: string }> {
  const out: Array<{ path: string; message: string }> = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && 'message' in v && typeof (v as { message: string }).message === 'string') {
      out.push({ path, message: (v as { message: string }).message })
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      out.push(...flattenErrors(v as Record<string, unknown>, path))
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          out.push(...flattenErrors(item as Record<string, unknown>, `${path}.${i}`))
        }
      })
    }
  }
  return out
}

export function applyZodErrorToForm<TFieldValues extends FieldValues = FieldValues>(
  error: z.ZodError,
  form: { setError: (name: string, opts: { message: string }) => void },
  onInvalid: (errors: FieldErrors<TFieldValues>) => void
): void {
  const fieldErrors = zodErrorToFieldErrors<TFieldValues>(error)
  const flat = flattenErrors(fieldErrors as Record<string, unknown>)
  for (const { path, message } of flat) {
    if (path !== '_root') form.setError(path, { message })
  }
  onInvalid(fieldErrors)
}
