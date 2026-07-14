import { BaseApiError } from '@/lib/base-client'

export class SmError extends BaseApiError {
  name: string = 'SmError'
}
