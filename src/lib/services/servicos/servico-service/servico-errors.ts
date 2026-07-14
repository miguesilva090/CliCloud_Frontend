import { BaseApiError } from '@/lib/base-client'

export class ServicoError extends BaseApiError {
  name: string = 'ServicoError'
}
