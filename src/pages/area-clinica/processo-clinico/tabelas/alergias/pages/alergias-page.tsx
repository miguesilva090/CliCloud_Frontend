import { modules } from '@/config/modules'
import { ListagemAlergiasPage } from '@/pages/area-comum/tabelas/consultas/alergias/pages/listagem-alergias-page'

export function AlergiasPage() {
  return (
    <ListagemAlergiasPage
      permissionIds={[
        modules.areaComum.permissions.alergias.id,
        modules.areaClinica.permissions.tabelas.id,
      ]}
    />
  )
}
