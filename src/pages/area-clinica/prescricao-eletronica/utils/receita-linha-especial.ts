import type { CreateReceitaLinhaRequest } from "@/types/dtos/prescricao/receita-medica.dtos"

export const TIPOS_COM_INFARMED = new Set([1, 2, 3, 9, 10])

export const TIPOS_LINHA_ESPECIAL = new Set([4, 5, 6, 8])

export function usaPainelInfarmed(tipoReceita: number): boolean {
    return TIPOS_COM_INFARMED.has(tipoReceita)
}

export function usaLinhaEspecial(tipoReceita: number): boolean {
    return TIPOS_LINHA_ESPECIAL.has(tipoReceita)
}

export function posologiaObrigatoriaNaLinha(tipoLinha: number): boolean {
    return tipoLinha !== 8
}

export type LinhaEspecialForm = {
    designacao: string
    dosagem?: string
    formaFarmaceutica?: string
    substanciaAtiva?: string
    dimensaoOuCodigo?: string
    posologia?: string
}

export const MSG_LINHA_ESPECIAL = {
    designacaoObrigatoria: 'Indique a designação do produto',
    dosagemObrigatoria: 'Indique a dosagem',
    tipoCamaraObrigatoria: 'Indique o tipo de câmara expansora',
} as const

export function tituloDialogoEspecial(tipoLinha: number): string {
    switch (tipoLinha) {
        case 4: 
            return 'Medicamento manipulado'
        case 5: 
            return 'Produto dietético'
        case 6: 
            return 'Outro produto (LOUT)'
        case 8: 
            return 'Câmara expansora'
        default:
            return 'Linha especial'
    }
}

export function buildLinhaEspecial(
    tipoLinha: number,
    form: LinhaEspecialForm
): CreateReceitaLinhaRequest | { error: string } {
    const designacao = form.designacao.trim()
    const dosagem = (form.dosagem ?? '').trim()
    const forma = (form.formaFarmaceutica ?? '').trim()
    const substancia = (form.substanciaAtiva ?? '').trim()
    const dimensaoOuCodigo = (form.dimensaoOuCodigo ?? '').trim()
    const posologia = (form.posologia ?? '').trim() || null

    if (tipoLinha === 4) {
        if (!designacao) return { error: MSG_LINHA_ESPECIAL.designacaoObrigatoria }
        if (!dosagem) return { error: MSG_LINHA_ESPECIAL.dosagemObrigatoria }
        const descParts = [dosagem, forma, substancia].filter(Boolean)
        return {
            ordem: 0,
            tipoLinha: 4,
            embId: null,
            cnpem: null,
            designacao,
            descricaoEmbalagem: descParts.length ? descParts.join(' · ') : null,
            quantidade: 1,
            pvp: 0,
            comparticipacao: 0,
            valorUtente: 0,
            posologia,
            codTipoPrescricao: 0,
            codMotivo: null,
            codIndicacaoTerapeutica: null,
            diploma: null,
            codValidade: 1, 
        }
    }

    if (tipoLinha === 5) {
        if (!designacao) return { error: MSG_LINHA_ESPECIAL.designacaoObrigatoria }
        return {
            ordem: 0,
            tipoLinha: 5,
            embId: null,
            cnpem: null,
            designacao,
            descricaoEmbalagem: null,
            quantidade: 1,
            pvp: 0,
            comparticipacao: 0,
            valorUtente: 0,
            posologia,
            codTipoPrescricao: 0,
            codMotivo: null,
            codIndicacaoTerapeutica: null,
            diploma: null,
            codValidade: 1,
        }
    }

    if (tipoLinha === 6) {
        if (!designacao) return { error: MSG_LINHA_ESPECIAL.designacaoObrigatoria }
        return {
            ordem: 0,
            tipoLinha: 6,
            embId: null,
            cnpem: null,
            designacao,
            descricaoEmbalagem: dimensaoOuCodigo || null,
            quantidade: 1,
            pvp: 0,
            comparticipacao: 0,
            valorUtente: 0,
            posologia,
            codTipoPrescricao: 0,
            codMotivo: null,
            codIndicacaoTerapeutica: null,
            diploma: null,
            codValidade: 1,
        }
    }

    if (tipoLinha === 8) {
        if (!designacao) return { error: MSG_LINHA_ESPECIAL.tipoCamaraObrigatoria }
        return {
            ordem: 0,
            tipoLinha: 8,
            embId: null,
            cnpem: null,
            designacao,
            descricaoEmbalagem: dimensaoOuCodigo || null,
            quantidade: 1,
            pvp: 0,
            comparticipacao: 0,
            valorUtente: 0,
            posologia: null,
            codTipoPrescricao: 0,
            codMotivo: null,
            codIndicacaoTerapeutica: null,
            diploma: null,
            codValidade: 1,
        }
    }

    return { error: 'Tipo de linha especial não suportado'}
}