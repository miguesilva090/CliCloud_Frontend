import { BaseApiError } from '@/lib/base-client'

export class SalaError extends BaseApiError {
  name: string = 'SalaError'
}
