import { BaseApiError } from '@/lib/base-client'

export class CondicaoPagamentoError extends BaseApiError {
  name: string = 'CondicaoPagamentoError'
}
