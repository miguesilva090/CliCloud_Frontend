import { BaseApiError } from '@/lib/base-client'

export class EmailError extends BaseApiError {
  name: string = 'EmailError'
}
