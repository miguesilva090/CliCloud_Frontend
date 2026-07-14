import { BaseApiError } from '@/lib/base-client'

export class TipoPagamentoError extends BaseApiError {
  name: string = 'TipoPagamentoError'
}
