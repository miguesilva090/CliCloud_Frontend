import { BaseApiError } from '@/lib/base-client'

export class EntityQuickCreateError extends BaseApiError {
  name: string = 'EntityQuickCreateError'
}
