import { BaseApiError } from '@/lib/base-client'

export class NotificacaoError extends BaseApiError {
  name: string = 'NotificacaoError'
}
