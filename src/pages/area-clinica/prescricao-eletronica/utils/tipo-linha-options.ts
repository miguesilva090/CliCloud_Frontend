export const TIPOS_LINHA_LABEL: Record<number, string> = {
    1: 'LN',
    2: 'LE',
    3: 'LMDB',
    4: 'LMM',
    5: 'LMDT',
    6: 'LOUT',
    8: 'LCE',
    10: 'LMA', 
}

export function labelTipoLinha(tipo: number | null | undefined) : string {
    const t = tipo ?? 1
    return TIPOS_LINHA_LABEL[t] ?? String(t)
}