import { BaseApiError } from '@/lib/base-client'

export class MedicoError extends BaseApiError {
  name: string = 'MedicoError'
}
