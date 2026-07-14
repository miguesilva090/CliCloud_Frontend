import { BaseApiError } from '@/lib/base-client'

export class ContaBancariaError extends BaseApiError {
  name: string = 'ContaBancariaError'
}
