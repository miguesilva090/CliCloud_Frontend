import { ListagemMedicosPage } from '@/pages/area-comum/tabelas/entidades/medicos/pages/listagem-medicos-page'

// Mapa de Médicos sob Processo Clínico → Tabelas.
// Reutiliza a mesma listagem de Área Comum, mas mantém o path em Área Clínica.
export function MedicosPage() {
  return <ListagemMedicosPage />
}
