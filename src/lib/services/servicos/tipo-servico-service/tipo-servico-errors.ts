import { BaseApiError } from '@/lib/base-client'

export class TipoServicoError extends BaseApiError {
  name: string = 'TipoServicoError'
}
