import { ListagemPatologiasPage } from '@/pages/area-comum/tabelas/tratamentos/patologias/listagem-patologias-page'

// Página de Patologias em Área Clínica → Processo Clínico → Tabelas.
// Reutiliza a mesma listagem utilizada em Área Comum, mas mantendo o contexto
// de navegação em Processo Clínico.
export function PatologiasPage() {
  return <ListagemPatologiasPage />
}
