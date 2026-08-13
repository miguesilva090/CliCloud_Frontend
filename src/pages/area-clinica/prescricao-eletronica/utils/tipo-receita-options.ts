/** Códigos alinhados ao dropdown legado PrescricaoRSPEdtNova (tiporeceita / TipoLinha). */
export const TIPOS_RECEITA = [
    { value: 1, label: 'LN — Medicamentos (RM)' },
    { value: 2, label: 'LE — Psicotrópicos / Estupefacientes (RE)' },
    { value: 3, label: 'LMDB — Diabetes Mellitus' },
    { value: 4, label: 'LMM — Medicamentos Manipulados' },
    { value: 5, label: 'LMDT — Produtos Dietéticos' },
    { value: 6, label: 'LOUT — Outros produtos' },
    { value: 8, label: 'LCE — Câmaras Expansoras' },
    { value: 9, label: 'Receita EU' },
    { value: 10, label: 'LMA — Medicamentos Alergénios' },
  ] as const
  
  export function labelTipoReceita(tipo: number): string {
    return TIPOS_RECEITA.find((t) => t.value === tipo)?.label ?? `Tipo ${tipo}`
  }