import { BaseApiError } from '@/lib/base-client'

export class VersionError extends BaseApiError {
  name: string = 'VersionError'
}
