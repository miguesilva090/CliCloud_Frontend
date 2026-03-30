/**
 * Stub: visualizador de ficheiros desativado (escopo antigo removido).
 * Reimplementar quando houver serviço de anexos no backend.
 */
interface FileViewerProps {
  arquivo: { id: string; nome?: string; tipoArquivo?: string } | null
  isOpen: boolean
  onClose: () => void
}

export function FileViewer(_props: FileViewerProps) {
  return null
}
