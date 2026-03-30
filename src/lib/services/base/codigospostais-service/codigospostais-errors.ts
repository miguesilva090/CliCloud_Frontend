import { BaseApiError } from '@/lib/base-client'

export class CodigoPostalError extends BaseApiError {
  name: string = 'CodigoPostalError'
}
