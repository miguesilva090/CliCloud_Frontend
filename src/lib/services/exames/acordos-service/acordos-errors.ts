import { BaseApiError } from '@/lib/base-client'

export class AcordoError extends BaseApiError {
  name: string = 'AcordoError'
}
