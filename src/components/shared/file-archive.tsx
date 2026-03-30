import type { Accept } from 'react-dropzone'

/**
 * Stub: componente de anexos desativado.
 * Reimplementar quando houver endpoints de anexos no backend.
 */
interface FileArchiveProps {
  entidadeTipo?: string
  entidadeId?: string
  entityExists?: boolean
  onFilesUpdated?: () => void
  maxSize?: number
  accept?: Accept
  readOnly?: boolean
}

export function FileArchive(_props: FileArchiveProps) {
  return null
}

