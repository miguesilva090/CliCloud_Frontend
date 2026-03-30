import { BaseApiError } from '@/lib/base-client'

export class PaisError extends BaseApiError {
  name: string = 'PaisError'
}
