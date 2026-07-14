import { BaseApiError } from '@/lib/base-client'

export class VozError extends BaseApiError {
  name: string = 'VozError'
}
