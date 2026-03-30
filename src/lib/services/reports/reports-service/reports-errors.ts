import { BaseApiError } from '@/lib/base-client'

export class ReportsError extends BaseApiError {
  constructor(message: string, statusCode?: number, data?: unknown) {
    super(message, statusCode, data)
    this.name = 'ReportsError'
  }
}
