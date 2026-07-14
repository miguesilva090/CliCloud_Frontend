import { BaseApiError } from '@/lib/base-client'

export class TecnicoError extends BaseApiError {
  name: string = 'TecnicoError'
}
