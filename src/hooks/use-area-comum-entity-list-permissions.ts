import { usePermissionsStore } from '@/stores/permissions-store'

/** Opções passadas a colunas de ações das listagens (Área Comum). */
export type AreaComumListRowActionPermissions = {
  canView?: boolean
  canChange?: boolean
  canDelete?: boolean
}

/** Permissões típicas das listagens de entidades (Área Comum). */
export function useAreaComumEntityListPermissions(funcionalidadeId: string) {
  const hasPermission = usePermissionsStore((s) => s.hasPermission)
  return {
    canView: hasPermission(funcionalidadeId, 'AuthVer'),
    canAdd: hasPermission(funcionalidadeId, 'AuthAdd'),
    canChange: hasPermission(funcionalidadeId, 'AuthChg'),
    canDelete: hasPermission(funcionalidadeId, 'AuthDel'),
  }
}

export function mergeRowActionPermissions(
  input?: AreaComumListRowActionPermissions
) {
  return {
    canView: input?.canView ?? true,
    canChange: input?.canChange ?? true,
    canDelete: input?.canDelete ?? true,
  }
}
