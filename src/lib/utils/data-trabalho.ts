import { sessionVars } from './session-vars'

export function getDataTrabalhoDate(): Date {
    const raw = sessionVars.get('data-trabalho')
    if (raw) {
        const d = raw instanceof Date ? raw : new Date(raw)
        if(!Number.isNaN(d.getTime())) {
            d.setHours(0,0,0,0)
            return d
        }
    }

    const today = new Date()
    today.setHours(0,0,0,0)
    return today
}

export function getDataTrabalhoIsoDate(): string {
    const d = getDataTrabalhoDate()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}