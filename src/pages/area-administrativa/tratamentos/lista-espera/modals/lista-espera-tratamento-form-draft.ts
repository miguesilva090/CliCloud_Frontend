import type {
  ListaEsperaTratamentoFormState,
  ListaEsperaTratamentoServicoForm,
} from './lista-espera-tratamento-form-utils'

export type ListaEsperaTratamentoFormSessionDraft = {
  form: ListaEsperaTratamentoFormState
  servicos: ListaEsperaTratamentoServicoForm[]
  activeTab: 'utente' | 'tratamento' | 'servicos'
  createObsDraft: string
  mode: 'view' | 'create' | 'edit'
  rowId: string | null
}

const LISTA_ESPERA_FORM_DRAFT_KEY = 'lista-espera-tratamento-form-session-draft'

function storageKey(instanceId: string): string {
  return `${LISTA_ESPERA_FORM_DRAFT_KEY}:${instanceId}`
}

export function persistListaEsperaTratamentoFormSessionDraft(
  instanceId: string,
  draft: ListaEsperaTratamentoFormSessionDraft
): void {
  if (!instanceId) return
  try {
    sessionStorage.setItem(storageKey(instanceId), JSON.stringify(draft))
  } catch {
    // ignore quota errors
  }
}

export function readListaEsperaTratamentoFormSessionDraft(
  instanceId: string
): ListaEsperaTratamentoFormSessionDraft | null {
  if (!instanceId) return null
  try {
    const raw = sessionStorage.getItem(storageKey(instanceId))
    if (!raw) return null
    return JSON.parse(raw) as ListaEsperaTratamentoFormSessionDraft
  } catch {
    return null
  }
}

export function clearListaEsperaTratamentoFormSessionDraft(instanceId: string): void {
  if (!instanceId) return
  sessionStorage.removeItem(storageKey(instanceId))
}
