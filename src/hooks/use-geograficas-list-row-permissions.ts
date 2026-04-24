import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

/** ID estável só para satisfazer o hook quando não há controlo por funcionalidade (rotas legacy). */
const PERM_HOOK_FALLBACK_ID = modules.utilitarios.permissions.paises.id

/**
 * Controlo de linha nas listagens geográficas (Área Comum).
 * Com `funcionalidadeId`, aplica AuthVer / AuthChg / AuthDel; sem isso, mantém todos os botões visíveis.
 */
export function useGeograficasListRowPermissions(funcionalidadeId?: string) {
  const applies = Boolean(funcionalidadeId)
  const p = useAreaComumEntityListPermissions(
    funcionalidadeId ?? PERM_HOOK_FALLBACK_ID
  )
  return {
    canView: !applies || p.canView,
    canChange: !applies || p.canChange,
    canDelete: !applies || p.canDelete,
  }
}
