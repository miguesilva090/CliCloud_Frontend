import { useQuery } from '@tanstack/react-query'
import { modules } from '@/config/modules'
import { AdseService } from '@/lib/services/faturacao/adse-service'
import { ClinicaService } from '@/lib/services/core/clinica-service'

export const ADSE_PERM_ID = modules.areaFinanceira.permissions.adse.id

export function useAdseConfigQuery() {
  return useQuery({
    queryKey: ['adse', 'config'],
    queryFn: () => AdseService(ADSE_PERM_ID).getConfiguracaoAtual(),
  })
}

export function useAdseOrganismosQuery() {
  return useQuery({
    queryKey: ['adse', 'lookups', 'organismos'],
    queryFn: () => AdseService(ADSE_PERM_ID).getOrganismos(),
  })
}

export function useAdseClinicasQuery() {
  return useQuery({
    queryKey: ['adse', 'lookups', 'clinicas'],
    queryFn: () => ClinicaService(ADSE_PERM_ID).getClinicasDisponiveisContexto(),
  })
}
