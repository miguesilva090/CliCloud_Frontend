import { useCallback, useState } from 'react'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

/** Modo visualização + «Editar» (AuthChg) para páginas de configuração com um único formulário principal. */
export function useConfigPageEditMode(funcionalidadeId: string) {
  const { canChange } = useAreaComumEntityListPermissions(funcionalidadeId)
  const [isEditing, setIsEditing] = useState(false)
  const formEditable = isEditing && canChange

  const startEditing = useCallback(() => {
    if (canChange) setIsEditing(true)
  }, [canChange])

  const cancelEditing = useCallback(() => setIsEditing(false), [])

  const exitEditAfterSave = useCallback(() => setIsEditing(false), [])

  return {
    canChange,
    isEditing,
    formEditable,
    startEditing,
    cancelEditing,
    exitEditAfterSave,
  }
}
