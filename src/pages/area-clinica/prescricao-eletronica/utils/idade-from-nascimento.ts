export function idadeFromNascimento(
    dataNascimento: string | null | undefined,
    ref: Date = new Date()
): string {
    if (!dataNascimento) return ''
    const d = new Date(dataNascimento)
    if (Number.isNaN(d.getTime())) return ''
    let idade = ref.getFullYear() - d.getFullYear()
    const m = ref.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && ref.getDate() < d.getDate())) idade -= 1
    return idade >= 0 ? String(idade) : ''
}