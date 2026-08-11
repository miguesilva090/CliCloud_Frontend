/** Activos = PrescricaoRSPEdtNova.aspx.cs (JAU2/JAU4 comentados no legado). */
export const JUSTIFICACOES_QUANTIDADE = [
  { value: 'JAU1', label: 'Posologia', ativo: true },
  { value: 'JAU2', label: 'Doente crónico estabilizado', ativo: false },
  { value: 'JAU3', label: 'Ausência Prolongada do país', ativo: true },
  { value: 'JAU4', label: 'Outra', ativo: false },
] as const


export type CodJustificacaoQuantidade = (typeof JUSTIFICACOES_QUANTIDADE)[number]['value']

export const JUSTIFICACOES_QUANTIDADE_ATIVAS = JUSTIFICACOES_QUANTIDADE.filter(
    (j) => j.ativo
)

export const MSG_JAU = {
  naoNecessaria:
    'Não é necessário justificar o ato único para o medicamento com a quantidade e validade indicada.',
  selecionar:
    'É necessário selecionar uma justificação para a quantidade indicada',
  obrigatoriaGuardar:
    'É necessário indicar a justificação de ato único para a quantidade e/ou validade indicada',
  gravada: 'Justificação para ato único alterada com sucesso',
  cancelada: 'Quantidade alterada para o permitido sem justificação',
} as const

export type LinhaJustificacaoInput = {
    quantidade: number
    tipoLinha?: number | null
    tipoTratamento?: number | null
    embalagemUnitaria?: boolean | null
    codValidade?: number | null
    codJustificacaoQuantidade?: string | null
    justificacaoQuantidade?: string | null
}

export function embalagensAcimaPermitido(
    tipoTratamento: number | null | undefined,
    embalagemUnitaria: boolean | null | undefined,
    embalagens: number
): boolean {
    if (tipoTratamento === 2 || tipoTratamento === 3) return false
    if (embalagemUnitaria === true && embalagens > 4) return true
    if (embalagemUnitaria !== true && embalagens > 2) return true
    return false
}

export function maxQuantidadeSemJustificacao(
    embalagemUnitaria?: boolean | null 
): number {
    return embalagemUnitaria === true ? 4 : 2
}

export function requiresJustificacaoQuantidade(
    linha: LinhaJustificacaoInput
): boolean {
    return embalagensAcimaPermitido(
        linha.tipoTratamento ?? 1,
        linha.embalagemUnitaria ?? false,
        linha.quantidade
    )
}

export function isCodJustificacaoValido(
    codigo: string | null | undefined
): codigo is CodJustificacaoQuantidade {
    return (
        codigo === 'JAU1' ||
        codigo === 'JAU2' ||
        codigo === 'JAU3' || 
        codigo === 'JAU4'
    )
}

export function linhaJustificacaoInvalida(
    linha: LinhaJustificacaoInput
): boolean {
    if (!requiresJustificacaoQuantidade(linha)) return false
    if (!isCodJustificacaoValido(linha.codJustificacaoQuantidade)) return true
    if (
        linha.codJustificacaoQuantidade === 'JAU4' &&
        !String(linha.justificacaoQuantidade ?? '').trim()
    ) {
        return true
    }
    return false
}

export function patchLimparJustificacao() {
    return {
        codJustificacaoQuantidade: null as string | null,
        justificacaoQuantidade: null as string | null,
        codValidade: 1,
    }
}

export function patchConfirmarJustificacao(codigo: string, outroTexto: string) {
    return {
        codJustificacaoQuantidade: codigo,
        justificacaoQuantidade: 
            codigo === 'JAU4' ? outroTexto.trim() || null : null,
        codValidade: 3,
    }
}