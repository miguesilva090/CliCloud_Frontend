import { BaseApiError } from '@/lib/base-client'

export class TipoConsultaError extends BaseApiError {
  name: string = 'TipoConsultaError'
}
