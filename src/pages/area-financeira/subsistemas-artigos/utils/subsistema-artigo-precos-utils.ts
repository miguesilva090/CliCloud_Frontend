export function parseMoney(value: string): number {
    const normalized = value.trim().replace(',', '.')
    if(!normalized) return 0
    const n = Number(normalized)
    return Number.isFinite(n) ? n : NaN
}

export function formatMoney(value: number): string {
    return value.toFixed(2)
}

export function recalcFromMargem(valorServico: number, margemRaw: number) {
    let margem = margemRaw
    if (margem > 100) margem = 100
    if (margem <= 0 || !valorServico) {
        return {
            margemOrganismoPercent: 0,
            valorOrganismo: 0,
            valorUtente: valorServico,
        }
    }

    const valorOrganismo = valorServico * (margem / 100)
    const valorUtente = valorServico - valorOrganismo
    return { margemOrganismoPercent: margem ,valorOrganismo, valorUtente }
}

export function recalcFromValorOrganismo(valorServico: number, valorOrganismoRaw: number) {
    if (!valorServico) {
        return {
            margemOrganismoPercent: 0,
            valorOrganismo: 0,
            valorUtente: 0,
        }
    }

    let valorOrganismo = valorOrganismoRaw
    if (valorOrganismo > valorServico) valorOrganismo = valorServico
    if (valorOrganismo <= 0) {
        return {
            margemOrganismoPercent: 0,
            valorOrganismo: 0,
            valorUtente: valorServico,
        }
    }

    const margem = (valorOrganismo / valorServico) * 100
    const valorUtente = valorServico - valorOrganismo
    return { margemOrganismoPercent: margem, valorOrganismo, valorUtente }
}

export function recalcFromValorUtente(valorServico: number, valorUtenteRaw: number) {
    if (!valorServico) {
        return {
            margemOrganismoPercent: 0,
            valorOrganismo: 0,
            valorUtente: 0,
        }
    }

    let valorUtente = valorUtenteRaw
    if (valorUtente > valorServico) valorUtente = valorServico
    if (valorUtente <= 0) {
        return {
            margemOrganismoPercent: 0,
            valorOrganismo: valorServico,
            valorUtente: 0,
        }
    }

    const valorOrganismo = valorServico - valorUtente 
    const margem = (valorOrganismo / valorServico ) * 100
    return { margemOrganismoPercent: margem, valorOrganismo, valorUtente }
}

export function suggestCodigoCartaoInstituicao(
    organismoId: string,
    artigoCodigo: number | undefined,
    organismos: Array<{id: string; abreviatura?: string | null; nomeComercial?: string | null; nome?: string | null }>
): string {
    if (!artigoCodigo) return ''
    const org = organismos.find((o) => o.id === organismoId)
    const orgPart = 
        org?.abreviatura?.trim() ||
        org?.nomeComercial?.trim() || 
        org?.nome?.trim() ||
        organismoId.slice(0,8)
    return `${orgPart}.${artigoCodigo}` 
}