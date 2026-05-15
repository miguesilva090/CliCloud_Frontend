import type { ComboboxItem } from '@/components/shared/async-combobox'
import type { AdmissaoFormState } from './admissao-form-utils'

export type AdmissaoFormSessionDraft = {
  form: AdmissaoFormState
  activeTab: 'dados-utente' | 'dados-consulta' | 'registo-servicos'
  organismoOptions: ComboboxItem[]
  obsDraft: string
  mode: 'view' | 'create' | 'edit'
  rowId: string | null
}

const ADMISSAO_FORM_DRAFT_KEY = 'admissao-form-session-draft'

function storageKey(instanceId: string): string {
  return `${ADMISSAO_FORM_DRAFT_KEY}:${instanceId}`
}

export function persistAdmissaoFormSessionDraft(
  instanceId: string,
  draft: AdmissaoFormSessionDraft
): void {
  if (!instanceId) return
  try {
    sessionStorage.setItem(storageKey(instanceId), JSON.stringify(draft))
  } catch {
    // ignore quota errors
  }
}

export function readAdmissaoFormSessionDraft(
  instanceId: string
): AdmissaoFormSessionDraft | null {
  if (!instanceId) return null
  try {
    const raw = sessionStorage.getItem(storageKey(instanceId))
    if (!raw) return null
    return JSON.parse(raw) as AdmissaoFormSessionDraft
  } catch {
    return null
  }
}

export function clearAdmissaoFormSessionDraft(instanceId: string): void {
  if (!instanceId) return
  sessionStorage.removeItem(storageKey(instanceId))
}
