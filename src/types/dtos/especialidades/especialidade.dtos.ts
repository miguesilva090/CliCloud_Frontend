export interface EspecialidadeTableDTO {
  id: string
  nome: string
  categoriaEspecialidadeId: string | null
  categoriaEspecialidadeCodigo: string | null
  categoriaEspecialidadeDescricao: string | null
  fisioterapia: boolean
  atendimento: boolean
  globalbooking: boolean
  createdOn: string
}
