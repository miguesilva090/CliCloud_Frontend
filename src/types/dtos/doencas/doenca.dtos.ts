export interface DoencaDTO {
  id: string
  icdId: string
  code?: string | null
  title: string
  classKind: string
  level: number
  parentId?: string | null
}

export interface DoencaTableDTO extends DoencaDTO {
  createdOn?: string
}
