import { BaseApiError } from '@/lib/base-client'

export class DocumentoError extends BaseApiError {
  name: string = 'DocumentoError'
}
