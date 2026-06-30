import { ResponseStatus } from '@/types/api/responses'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import { TaxaIvaService } from '@/lib/services/taxas-iva/taxa-iva-service'
import type { AdmissaoDTO, AdmissaoServicoDTO } from '@/types/dtos/consultas/admissao.dtos'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import type { DocumentoEditorState, MovimentoUtenteEditor } from '../types/documento-editor.types'
import {
  mapAdmissaoServicoToLinha,
  mapAdmissaoToEditorCliente,
} from './documento-linha-mappers'

const ID = 'documentos'
const MODULO_CONSULTAS = 'Consultas'

function movimentoFromAdmissao(admissao: AdmissaoDTO): MovimentoUtenteEditor {
  const codigo = admissao.id.slice(0, 8).toUpperCase()
  return {
    key: admissao.id,
    modulo: MODULO_CONSULTAS,
    admissaoId: admissao.id,
    codigoAdmissao: codigo,
  }
}

function patchClienteUtente(
  admissao: AdmissaoDTO,
  utente?: UtenteDTO | null,
): Partial<DocumentoEditorState> {
  const cliente = mapAdmissaoToEditorCliente(admissao, { faturaRecibo: true })
  const cp = utente?.codigoPostal as { codigo?: string; localidade?: string } | null | undefined

  return {
    ...cliente,
    moradaCliente: (utente?.rua?.nome?.trim() ?? '').slice(0, 100)
      || (utente?.observacoes?.trim() ?? '').slice(0, 100),
    localidadeCliente:
      cp?.localidade?.trim() ??
      utente?.freguesia?.nome?.trim() ??
      utente?.concelho?.nome?.trim() ??
      '',
    numeroContribuinteCliente: utente?.numeroContribuinte?.trim() ?? '',
    codigoPostalId: utente?.codigoPostalId ?? null,
    codigoPostalTexto: cp?.codigo?.trim() ?? '',
    beneficiario: utente?.numeroBeneficiarioEfr?.trim() ?? '',
    dataDocumento: admissao.data?.slice(0, 10) ?? undefined,
    dataVencimentoPagamento: admissao.data?.slice(0, 10) ?? undefined,
  }
}

async function servicosParaImportar(
  admissao: AdmissaoDTO,
): Promise<AdmissaoServicoDTO[]> {
  const servicos = admissao.servicos ?? []
  if (!servicos.length) return []

  const debRes = await AdmissaoAdministrativoService(ID).getDebitoFaturacao(
    admissao.id,
  )
  const deb = debRes.info?.data
  const idsDebito = new Set(deb?.admissaoServicoIdsComDebito ?? [])

  if (idsDebito.size > 0) {
    return servicos.filter((s) => s.id && idsDebito.has(s.id))
  }

  return servicos
}

export type ReciboAdmissaoPrecargaResult = {
  patch: Partial<DocumentoEditorState>
  aviso?: string
}

/** Pré-carga alinhada ao legado AdmissoesEdt → Fatura recibo (serviços + utente). */
export async function fetchReciboAdmissaoPrecarga(
  admissaoId: string,
): Promise<ReciboAdmissaoPrecargaResult> {
  const admRes = await AdmissaoAdministrativoService(ID).getById(admissaoId)
  const admissao = admRes.info?.data
  if (!admRes.info || admRes.info.status !== ResponseStatus.Success || !admissao) {
    throw new Error('Não foi possível carregar a admissão.')
  }

  if (!admissao.servicos?.length) {
    throw new Error('Admissão sem serviços para faturar.')
  }

  if (admissao.pago === true) {
    throw new Error('Admissão já está marcada como paga.')
  }

  const [utenteRes, taxasRes] = await Promise.all([
    UtentesService(ID).getUtente(admissao.utenteId),
    TaxaIvaService(ID).getTaxasIvaLight(''),
  ])

  const utente =
    utenteRes.info?.status === ResponseStatus.Success
      ? (utenteRes.info.data ?? null)
      : null
  const taxas =
    taxasRes.info?.status === ResponseStatus.Success
      ? (taxasRes.info.data ?? [])
      : []

  const servicosImportar = await servicosParaImportar(admissao)
  const linhas = []

  for (const s of servicosImportar) {
    let servico = null
    if (s.servicoId) {
      const sr = await ServicoService(ID).getServico(s.servicoId)
      if (sr.info?.status === ResponseStatus.Success) {
        servico = sr.info.data ?? null
      }
    }
    linhas.push(
      mapAdmissaoServicoToLinha(s, taxas, servico, { usarValorUtRecibo: true }),
    )
  }

  const totalUt = linhas.reduce(
    (acc, l) => acc + (l.precoUnitario ?? 0) * (l.quantidade ?? 1),
    0,
  )

  let aviso: string | undefined
  if (admissao.faturado === true) {
    aviso =
      'Admissão já marcada como faturada; a pré-carga usa os serviços disponíveis para recibo.'
  }
  if (totalUt <= 0) {
    aviso =
      (aviso ? `${aviso} ` : '') +
      'Valor utente é 0 € — no legado marca Pago na admissão sem emitir FR, ou ajuste o subsistema.'
  }

  return {
    patch: {
      ...patchClienteUtente(admissao, utente),
      linhas,
      movimentosUtente: [movimentoFromAdmissao(admissao)],
    },
    aviso,
  }
}
