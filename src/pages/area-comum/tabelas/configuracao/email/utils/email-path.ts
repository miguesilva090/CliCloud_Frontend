import { modules } from '@/config/modules'

const FINANCEIRO_BASE = '/area-financeira/faturacao/emails'
const COMUM_CONFIG = '/area-comum/tabelas/configuracao/email'

export function isEmailFinanceiroRoute(pathname: string) : boolean {
    return pathname.startsWith(FINANCEIRO_BASE)
}

export function emailConfigPath(pathname: string) : string {
    return isEmailFinanceiroRoute(pathname) ? FINANCEIRO_BASE : COMUM_CONFIG
}

export function emailHistoricoPath(pathname: string) : string {
    return isEmailFinanceiroRoute(pathname) ? `${FINANCEIRO_BASE}/historico` : `${COMUM_CONFIG}/historico`
}

export function emailPermissionId(pathname: string) : string {
    return isEmailFinanceiroRoute(pathname) ? modules.areaFinanceira.permissions.emails.id : modules.areaComum.permissions.configuracoesEmail.id
}