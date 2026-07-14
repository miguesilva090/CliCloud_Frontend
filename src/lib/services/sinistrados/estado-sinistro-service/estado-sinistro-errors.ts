import { BaseApiError } from '@/lib/base-client'

export class EstadoSinistroError extends BaseApiError {
  name: string = 'EstadoSinistroError'
}
