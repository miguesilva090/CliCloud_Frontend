import { useQuery } from '@tanstack/react-query'
import { UtilityLookupsService } from './index'
import { EstadoCivilService } from '@/lib/services/estados-civis/estado-civil-service'
import { GrupoSanguineoService } from '@/lib/services/grupos-sanguineos/grupo-sanguineo-service'
import { HabilitacaoService } from '@/lib/services/habilitacoes/habilitacao-service'
import { ProfissaoService } from '@/lib/services/profissoes/profissao-service'
import { SexoService } from '@/lib/services/sexos/sexo-service'
import { GrauParentescoService } from '@/lib/services/graus-parentesco/grau-parentesco-service'
import { TaxaIvaService } from '@/lib/services/taxas-iva/taxa-iva-service'
import { ProvenienciaUtenteService } from '@/lib/services/proveniencias-utente/proveniencia-utente-service'
import { CentroSaudeService } from '@/lib/services/saude/centro-saude-service'
import { MedicoExternoService } from '@/lib/services/saude/medico-externo-service'
import { UnidadesLocaisSaudeService } from '@/lib/services/saude/unidades-locais-saude-service'

export const usePaisesLight = (keyword: string) =>
  useQuery({
    queryKey: ['utility', 'pais', 'light', keyword],
    queryFn: () => UtilityLookupsService('utility').getPaisesLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useDistritosLight = (keyword: string) =>
  useQuery({
    queryKey: ['utility', 'distrito', 'light', keyword],
    queryFn: () => UtilityLookupsService('utility').getDistritosLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useConcelhosLight = (keyword: string) =>
  useQuery({
    queryKey: ['utility', 'concelho', 'light', keyword],
    queryFn: () => UtilityLookupsService('utility').getConcelhosLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useFreguesiasLight = (keyword: string) =>
  useQuery({
    queryKey: ['utility', 'freguesia', 'light', keyword],
    queryFn: () => UtilityLookupsService('utility').getFreguesiasLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useCodigosPostaisLight = (keyword: string) =>
  useQuery({
    queryKey: ['utility', 'codigo-postal', 'light', keyword],
    queryFn: () => UtilityLookupsService('utility').getCodigosPostaisLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useRuasLight = (keyword: string) =>
  useQuery({
    queryKey: ['utility', 'rua', 'light', keyword],
    queryFn: () => UtilityLookupsService('utility').getRuasLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  })

export const useEstadosCivisLight = (keyword: string) =>
  useQuery({
    queryKey: ['estados-civis', 'light', keyword],
    queryFn: () => EstadoCivilService().getEstadosCivisLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useGruposSanguineosLight = (keyword: string) =>
  useQuery({
    queryKey: ['grupos-sanguineos', 'light', keyword],
    queryFn: () => GrupoSanguineoService().getGruposSanguineosLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useHabilitacoesLight = (keyword: string) =>
  useQuery({
    queryKey: ['habilitacoes', 'light', keyword],
    queryFn: () => HabilitacaoService().getHabilitacoesLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useProfissoesLight = (keyword: string) =>
  useQuery({
    queryKey: ['profissoes', 'light', keyword],
    queryFn: () => ProfissaoService().getProfissoesLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useSexosLight = (keyword: string) =>
  useQuery({
    queryKey: ['sexos', 'light', keyword],
    queryFn: () => SexoService().getSexosLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useGrausParentescoLight = (keyword: string) =>
  useQuery({
    queryKey: ['graus-parentesco', 'light', keyword],
    queryFn: () => GrauParentescoService().getGrausParentescoLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useTaxasIvaLight = (keyword: string) =>
  useQuery({
    queryKey: ['taxas-iva', 'light', keyword],
    queryFn: () => TaxaIvaService().getTaxasIvaLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useProvenienciasUtenteLight = (keyword: string) =>
  useQuery({
    queryKey: ['proveniencias-utentes', 'light', keyword],
    queryFn: () => ProvenienciaUtenteService().getProvenienciasUtenteLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useCentrosSaudeLight = (keyword: string) =>
  useQuery({
    queryKey: ['centros-saude', 'light', keyword],
    queryFn: () => CentroSaudeService('centro-saude').getCentroSaudeLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useUnidadesLocaisSaudeLight = (keyword: string) =>
  useQuery({
    queryKey: ['unidades-locais-saude', 'light', keyword],
    queryFn: () => UnidadesLocaisSaudeService('unidades-locais-saude').getUnidadesLocaisSaudeLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

export const useMedicosExternosLight = (keyword: string) =>
  useQuery({
    queryKey: ['medicos-externos', 'light', keyword],
    queryFn: () => MedicoExternoService('medicos').getMedicoExternoLight(keyword),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  })

