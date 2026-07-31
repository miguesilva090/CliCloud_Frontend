import type { AllFilterRequest } from '@/types/dtos/common/table-filters.dtos'

export interface TratamentoTableDTO {
  id: string
  designacao?: string | null
  utenteId?: string | null
  medicoId?: string | null
  organismoId?: string | null
  localTratamentoId?: string | null
  dataInic?: string | null
  dataFim?: string | null
  numSessao?: number | null
  nFaltMax?: number | null
  nFaltComax?: number | null
  nFalta?: number | null
  nFaltaCons?: number | null
  nAltSess?: number | null
  pago?: number | null
  faturado?: number | null
  suspenso?: number | null
  createdOn: string
  sessoesCount: number
  servicosCount: number
  organismoNome?: string | null
  localTratamentoNome?: string | null
  medicoNome?: string | null
  nomePatologia?: string | null
  vemListEsp?: number | null
}

export interface TratamentoAllFilterRequest extends AllFilterRequest {}

export interface CreateTratamentoRequest {
  utenteId: string
  medicoId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
  localTratamentoId?: string | null
  tratamentoPredId?: string | null
  localOrigemId?: string | null
  designacao?: string | null
  numSessao?: number | null
  dataInic?: string | null
  confDfim?: number | null
  dataFim?: string | null
  data?: string | null
  preco?: number | null
  descInst?: number | null
  descCli?: number | null
  valorDesc?: number | null
  pago?: number | null
  faturado?: number | null
  obs?: string | null
  nomePatologia?: string | null
  sendEmail?: boolean
}

export interface TratamentoDTO {
  id: string
  createdOn: string
  lastModifiedOn?: string | null
  utenteId?: string | null
  medicoId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
  localTratamentoId?: string | null
  tratamentoPredId?: string | null
  localOrigemId?: string | null
  designacao?: string | null
  numSessao?: number | null
  dataInic?: string | null
  confDfim?: number | null
  dataFim?: string | null
  data?: string | null
  nFaltMax?: number | null
  nFaltComax?: number | null
  nFalta?: number | null
  nFaltaCons?: number | null
  nAltSess?: number | null
  preco?: number | null
  descInst?: number | null
  descCli?: number | null
  valorDesc?: number | null
  reciboId?: string | null
  dataRecibo?: string | null
  pago?: number | null
  faturado?: number | null
  numDevolucao?: string | null
  numDestacavel?: string | null
  estadoU?: number | null
  estadoI?: number | null
  suspenso?: number | null
  dataSuspensao?: string | null
  provisorio?: number | null
  obs?: string | null
  tecObs?: string | null
  isencao?: number | null
  credencial?: string | null
  credencialExterna?: number | null
  destacavelCredencial?: number | null
  taxaMod?: number | null
  inisess?: number | null
  horaFisio?: string | null
  horaAux?: string | null
  horaOutro?: string | null
  duracaoTotal?: string | null
  selOutro?: number | null
  numCartao?: string | null
  orespons?: boolean | null
  confirmaLoc?: number | null
  sinistroId?: string | null
  seguradoraId?: string | null
  documentoId?: string | null
  semanaCompleta?: number | null
  vemListEsp?: number | null
  cartaoDevolv?: number | null
  terapiaFala: number
  numBenif?: string | null
  apolice?: string | null
  nomePatologia?: string | null
  frespons?: boolean | null
  arespons?: boolean | null
  lotes: number
}

export interface UpdateTratamentoRequest {
  utenteId?: string | null
  medicoId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
  localTratamentoId?: string | null
  tratamentoPredId?: string | null
  localOrigemId?: string | null
  designacao?: string | null
  numSessao?: number | null
  dataInic?: string | null
  confDfim?: number | null
  dataFim?: string | null
  data?: string | null
  nFaltMax?: number | null
  nFaltComax?: number | null
  nFalta?: number | null
  nFaltaCons?: number | null
  nAltSess?: number | null
  preco?: number | null
  descInst?: number | null
  descCli?: number | null
  valorDesc?: number | null
  reciboId?: string | null
  dataRecibo?: string | null
  pago?: number | null
  faturado?: number | null
  numDevolucao?: string | null
  numDestacavel?: string | null
  estadoU?: number | null
  estadoI?: number | null
  suspenso?: number | null
  dataSuspensao?: string | null
  provisorio?: number | null
  obs?: string | null
  tecObs?: string | null
  isencao?: number | null
  credencial?: string | null
  credencialExterna?: number | null
  destacavelCredencial?: number | null
  taxaMod?: number | null
  inisess?: number | null
  horaFisio?: string | null
  horaAux?: string | null
  horaOutro?: string | null
  duracaoTotal?: string | null
  selOutro?: number | null
  numCartao?: string | null
  orespons?: boolean | null
  confirmaLoc?: number | null
  sinistroId?: string | null
  seguradoraId?: string | null
  documentoId?: string | null
  semanaCompleta?: number | null
  vemListEsp?: number | null
  cartaoDevolv?: number | null
  terapiaFala: number
  numBenif?: string | null
  apolice?: string | null
  nomePatologia?: string | null
  frespons?: boolean | null
  arespons?: boolean | null
  lotes: number
  sendEmail?: boolean
}



