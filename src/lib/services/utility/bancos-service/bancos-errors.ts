import { BaseApiError } from '@/lib/base-client'

export class BancoError extends BaseApiError {
  name: string = 'BancoError'
}
