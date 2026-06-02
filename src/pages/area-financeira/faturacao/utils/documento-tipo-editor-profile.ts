import type { TipoDocumentoLightDTO } from '@/types/dtos/faturacao/tipo-documento.dtos'

export type DocumentoEditorProfile = {
  abreviatura: string
  mostraTransporte: boolean
  mostraDocOrigem: boolean
  mostraRetencao: boolean
  mostraReferenciasMb: boolean
  exigeUtenteOuOrganismo: boolean
  permiteNotaCreditoRapida: boolean
  ivaIncluidoNosPrecos: boolean
  /** Coluna referência/artigo (GT, GR, stocks). */
  mostraColunaArtigo: boolean
  /** Descontos tipo 1–3 (€) além da percentagem. */
  mostraDescontosAvancados: boolean
  /** Tab para importar linhas de admissões. */
  mostraTabAdmissoes: boolean
  /** Sugestões de preço utente/organismo (subsistema). */
  mostraPrecosSubsistema: boolean
}

const DEFAULT: Omit<DocumentoEditorProfile, 'abreviatura'> = {
  mostraTransporte: false,
  mostraDocOrigem: false,
  mostraRetencao: true,
  mostraReferenciasMb: true,
  exigeUtenteOuOrganismo: true,
  permiteNotaCreditoRapida: true,
  ivaIncluidoNosPrecos: true,
  mostraColunaArtigo: false,
  mostraDescontosAvancados: true,
  mostraTabAdmissoes: true,
  mostraPrecosSubsistema: true,
}

const POR_ABREV: Record<string, Partial<DocumentoEditorProfile>> = {
  FS: {},
  FSR: { mostraReferenciasMb: true },
  FR: { mostraReferenciasMb: false, permiteNotaCreditoRapida: false },
  AD: { permiteNotaCreditoRapida: false },
  GT: {
    mostraTransporte: true,
    mostraRetencao: false,
    mostraColunaArtigo: true,
    mostraTabAdmissoes: false,
  },
  GR: {
    mostraTransporte: true,
    mostraRetencao: false,
    mostraColunaArtigo: true,
    mostraTabAdmissoes: false,
  },
  NC: { mostraDocOrigem: true, permiteNotaCreditoRapida: false },
  DV: { mostraDocOrigem: true, permiteNotaCreditoRapida: false },
  RC: {
    mostraRetencao: false,
    mostraReferenciasMb: false,
    mostraDescontosAvancados: false,
    mostraTabAdmissoes: false,
    mostraPrecosSubsistema: false,
  },
  NP: { mostraRetencao: false },
  RG: { mostraDocOrigem: true },
}

export function getDocumentoEditorProfile(
  tipo?: Pick<TipoDocumentoLightDTO, 'abreviatura'> | null,
): DocumentoEditorProfile {
  const abrev = (tipo?.abreviatura ?? '').trim().toUpperCase()
  return { abreviatura: abrev || '?', ...DEFAULT, ...(POR_ABREV[abrev] ?? {}) }
}
