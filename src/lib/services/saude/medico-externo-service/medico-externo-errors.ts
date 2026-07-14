import { BaseApiError } from '@/lib/base-client'

export class MedicoExternoError extends BaseApiError {
  name: string = 'MedicoExternoError'
}
