import { modules } from '@/config/modules'

const FINANCEIRO_BASE = '/area-financeira/faturacao/referencias-multibanco'
const COMUM_CONFIG = '/area-comum/tabelas/configuracao/referencias-mb'

export function isReferenciasMbFinanceiroRoute(pathname: string): boolean {
  return pathname.startsWith(FINANCEIRO_BASE)
}

export function referenciasMbHistoricoPath(pathname: string): string {
  return isReferenciasMbFinanceiroRoute(pathname)
    ? `${FINANCEIRO_BASE}/historico`
    : `${COMUM_CONFIG}/historico`
}

export function referenciasMbPermissionId(pathname: string): string {
  return isReferenciasMbFinanceiroRoute(pathname)
    ? modules.areaFinanceira.permissions.referenciasMultibanco.id
    : modules.areaComum.permissions.referenciasMb.id
}
