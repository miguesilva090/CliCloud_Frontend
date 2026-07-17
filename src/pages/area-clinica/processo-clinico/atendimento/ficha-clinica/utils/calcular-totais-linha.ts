import type { MedicamentoPrescricaoLinhaDto } from "@/types/dtos/prescricao/medicamentos-infarmed.dtos"

export type LinhaReceitaTotaisDto = {
    pvp: number
    taxaComparticipacao: number
    psns: number
    put: number
    quantidade: number
    totalPsns: number
    totalPut: number
}

export function calcularTotaisLinha(
    linha: MedicamentoPrescricaoLinhaDto,
    quantidade = 1
): LinhaReceitaTotaisDto | null {
    const qty = Math.max(1,quantidade)

    const pvp = 
        linha.precoPvp?.preco ??
        linha.baseCalculo?.pvp ??
        null

    if (pvp === null || pvp === undefined) return null

    const taxa = 
        linha.taxaComparticipacaoEfectiva ?? 
        linha.baseCalculo?.taxaComparticipacao ?? 
        0

    const precoReferencia = linha.baseCalculo?.precoReferencia ?? pvp
    const baseComparticipacao = precoReferencia > 0 ? precoReferencia : pvp

    const psns = round2(baseComparticipacao * (taxa / 100))
    const put = round2(Math.max(0, pvp - psns))

    return {
        pvp: round2(pvp),
        taxaComparticipacao: taxa,
        psns,
        put,
        quantidade: qty,
        totalPsns: round2(psns * qty),
        totalPut: round2(put * qty),
    }
}

function round2(value: number) {
    return Math.round(value * 100) / 100
}