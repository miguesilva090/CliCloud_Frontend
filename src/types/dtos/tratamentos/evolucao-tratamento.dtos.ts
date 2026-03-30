import type { AllFilterRequest, TableFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface EvolucaoTratamentoTableDTO
{
    id: string
    tratamentoId: string
    utenteId: string
    utenteNome?: string | null
    tratamentoDesignacao?: string | null
    createdOn: string
    dataAlta?: string | null
    escalaDorAlta?: number | null
    objetivosAlcancados?: string | null
}

export interface EvolucaoTratamentoAllFilterRequest extends AllFilterRequest {}

export interface EvolucaoTratamentoTableFilterRequest extends TableFilterRequest {}

export interface EvolucaoTratamentoDTO 
{
    id: string
    tratamentoId: string
    utenteId: string

    pacienteInformadoInicial?: boolean | null
    pacienteMotivadoInicial?: boolean | null
    pacienteColaboranteInicial?: boolean | null
    observacoesAvaliacaoInicial?: string | null
    avaliacaoSubjetivaInicial?: string | null

    tipoInicioDorInicial?: number | null
    valorDorInicial?: number | null
    tipoDorInicial?: string | null

    exameFisicoRegiaoInicial?: string | null
    patologiaInicial?: string | null

    edemaInicial?: boolean | null
    tipoEdemaInicial?: number | null
    regiaoEdemaInicialId?: string | null
    regiaoEdemaInicialDescricao?: string | null
    observacoesEdemaInicial?: string | null

    elasticidadeInicial?: boolean | null
    observacoesElasticidadeInicial?: string | null

    parestesiasInicial?: boolean | null
    zonaParestesiasInicialId?: string | null
    zonaParestesiasInicialDescricao?: string | null

    dorIrradiadaInicial?: boolean | null
    zonaDorIrradiadaInicialId?: string | null
    zonaDorIrradiadaInicialDescricao?: string | null

    cicatrizInicial?: boolean | null
    zonaCicatrizInicialId?: string | null
    zonaCicatrizInicialDescricao?: string | null

    fraquezaMuscularInicial?: boolean | null
    zonaFraquezaInicialId?: string | null
    zonaFraquezaInicialDescricao?: string | null

    marchaAutonomaInicial?: number | null
    observacoesMarchaAutonomaInicial?: string | null

    goniometriaInicial?: string | null
    testeMuscularInicial?: string | null
    autonomiaInicial?: string | null

    objetivosEspecificosInicial?: string | null
    sessoesPropostasInicial?: string | null
    tempoNecessarioInicial?: string | null

    pacienteInformadoFinal?: boolean | null
    pacienteMotivadoFinal?: boolean | null
    pacienteColaboranteFinal?: boolean | null
    observacoesAvaliacaoFinal?: string | null
    avaliacaoSubjetivaFinal?: string | null

    tipoInicioDorFinal?: number | null
    valorDorFinal?: number | null
    tipoDorFinal?: string | null

    exameFisicoRegiaoFinalId?: string | null
    patologiaFinalId?: string | null

    edemaFinal?: boolean | null
    tipoEdemaFinal?: number | null
    regiaoEdemaFinalId?: string | null
    regiaoEdemaFinalDescricao?: string | null
    observacoesEdemaFinal?: string | null

    elasticidadeFinal?: boolean | null
    observacoesElasticidadeFinal?: string | null

    parestesiasFinal?: boolean | null
    zonaParestesiasFinalId?: string | null
    zonaParestesiasFinalDescricao?: string | null

    dorIrradiadaFinal?: boolean | null
    zonaDorIrradiadaFinalId?: string | null
    zonaDorIrradiadaFinalDescricao?: string | null

    cicatrizFinal?: boolean | null
    zonaCicatrizFinalId?: string | null
    zonaCicatrizFinalDescricao?: string | null

    fraquezaMuscularFinal?: boolean | null
    zonaFraquezaFinalId?: string | null
    zonaFraquezaFinalDescricao?: string | null

    marchaAutonomaFinal?: number | null
    observacoesMarchaAutonomaFinal?: string | null

    goniometriaFinal?: string | null
    testeMuscularFinal?: string | null
    autonomiaFinal?: string | null

    objetivosAlcancados?: string | null
    novosObjetivos?: string | null
    sessoesPropostasFinal?: string | null
    tempoNecessarioFinal?: string | null

    dataAlta?: string | null
    motivoAltaId?: string | null
    escalaDorAlta?: number | null
    indicacoesParaUtenteAlta?: string | null
    observacaoClinica?: string | null
}

export interface EvolucaoTratamentoLightDTO
{
    id: string
    tratamentoId: string
    utenteId: string

    utenteNome?: string | null
    tratamentoDesignacao?: string | null

    createdOn: string
    dataAlta?: string | null
    escalaDorAlta?: number | null
    objetivosAlcancados?: string | null
}

// Para o relatório, reutilizamos a mesma estrutura da evolução completa.
// Se no futuro o relatório precisar de um shape diferente, pode-se trocar este alias por uma interface própria.
export type EvolucaoTratamentoReportDTO = EvolucaoTratamentoDTO

export type CreateEvolucaoTratamentoRequest = Omit<EvolucaoTratamentoDTO, 'id'>
export type UpdateEvolucaoTratamentoRequest = EvolucaoTratamentoDTO