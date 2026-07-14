import { BaseApiError } from '@/lib/base-client'

export class TaxaIvaError extends BaseApiError {
  name: string = 'TaxaIvaError'
}
