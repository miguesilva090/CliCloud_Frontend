export function todayIsoDate(): string {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export interface ConsentimentoToggleState {
    checked: boolean
    wasChecked: boolean
    consentDate: string
    revokeDate: string
}

export function applyConsentimentoToggle(state: ConsentimentoToggleState): {
    consentDate: string
    revokeDate: string
} {
    const today = todayIsoDate()

    if (state.checked) {
        const consentDate = 
            !state.wasChecked ? today : state.consentDate || today
        return {
            consentDate,
            revokeDate: state.revokeDate,
        }
    }

    const revokeDate = 
        state.wasChecked ? today : state.revokeDate
    return {
        consentDate: state.consentDate,
        revokeDate,
    }
}

/** Paridade UtentesEdt.js — uma data na BD; UI com consentimento/revogação. */
export function tratamentoDadosDatesFromStored(
    markTratamentoDados: boolean,
    dataTratamentoDados?: string | null,
): { consentDate: string; revokeDate: string } {
    const stored = dataTratamentoDados?.slice(0, 10) ?? ''
    if (!stored) return { consentDate: '', revokeDate: '' }
    return markTratamentoDados
        ? { consentDate: stored, revokeDate: '' }
        : { consentDate: '', revokeDate: stored }
}

export function dataTratamentoDadosFromForm(
    consentDate?: string,
    revokeDate?: string,
): string | null {
    const consent = consentDate?.trim()
    const revoke = revokeDate?.trim()
    return consent || revoke || null
}