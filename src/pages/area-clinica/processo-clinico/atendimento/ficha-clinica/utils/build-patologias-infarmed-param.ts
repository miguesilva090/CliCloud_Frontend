import type { UtentePatologiaComparticipacaoDTO } from '@/types/dtos/prescricao/utente-patologia-comparticipacao.dtos'

export function buildPatologiasInfarmedParam(
    items: UtentePatologiaComparticipacaoDTO[] | null | undefined
): string | undefined {
    if (!items?.length) return undefined

    const ids = [
        ...new Set(
            items
                .map((x) => x.codigoComparticipacao)
                .filter((n) => Number.isFinite(n) && n > 0)
        ),
    ]

    return ids.length > 0 ? ids.join(',') : undefined
}