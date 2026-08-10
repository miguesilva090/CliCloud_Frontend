export const TIPOS_RECEITA = [
    { value: 1, label: "Receita Medicamentos (RM)"},
    { value: 2, label: "Receita Especial (RE)"},
    { value: 3, label: "Diabetes"},
    { value: 4, label: "Manipulados"},
    { value: 5, label: "Dietéticos"},
    { value: 8, label: "Câmaras Expansoras"},
    { value: 9, label: "Receita EU" },
    { value: 10, label: "Alergénicos"}

] as const

export function labelTipoReceita(tipo: number): string {
    return TIPOS_RECEITA.find((t) => t.value === tipo)?.label ?? `Tipo ${tipo}`
}