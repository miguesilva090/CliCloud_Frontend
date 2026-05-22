import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import type { LinhaServicoForm, TaxaModeradora } from '@/pages/area-administrativa/consultas/admissoes/modals/admissao-form-utils'
import {
  persistAdmissaoFormSessionDraft,
  readAdmissaoFormSessionDraft,
} from '@/pages/area-administrativa/consultas/admissoes/modals/admissao-form-draft'
import { buildLinhasFromSubsistemasSelecionados } from '@/pages/area-administrativa/consultas/admissoes/modals/admissao-subsistemas-selecao-utils'

export type AdmissaoSubsistemasPickerContext = {
  numLinhasInserir: number
  servicosLight: ServicoLightDTO[]
  taxaModeradora: TaxaModeradora
  taxaModeradoraAtiva: boolean
}

const CONTEXT_PREFIX = 'admissao-subsistemas-picker-context:'
const PENDING_PREFIX = 'admissao-subsistemas-linhas-pending:'

export const ADMISSAO_SUBSISTEMAS_BC = 'clicloud-admissao-subsistemas'

/** Sincronização URL/Router em `usePathnameKey` — abrir listagem a partir da admissão. */
const PICKER_NAV_OPENING_KEY = 'admissao-subsistemas-picker-opening'
/** Sincronização URL/Router — fechar listagem após «Adicionar à admissão». */
const PICKER_NAV_CLOSING_KEY = 'admissao-subsistemas-picker-closing'

export function markAdmissaoSubsistemasPickerOpening(): void {
  try {
    sessionStorage.removeItem(PICKER_NAV_CLOSING_KEY)
    sessionStorage.setItem(PICKER_NAV_OPENING_KEY, '1')
  } catch {
    // ignore
  }
}

export function markAdmissaoSubsistemasPickerClosing(): void {
  try {
    sessionStorage.removeItem(PICKER_NAV_OPENING_KEY)
    sessionStorage.setItem(PICKER_NAV_CLOSING_KEY, '1')
  } catch {
    // ignore
  }
}

export function clearAdmissaoSubsistemasPickerOpeningFlag(): void {
  try {
    sessionStorage.removeItem(PICKER_NAV_OPENING_KEY)
  } catch {
    // ignore
  }
}

export function clearAdmissaoSubsistemasPickerClosingFlag(): void {
  try {
    sessionStorage.removeItem(PICKER_NAV_CLOSING_KEY)
  } catch {
    // ignore
  }
}

export function isAdmissaoSubsistemasPickerOpening(): boolean {
  try {
    return sessionStorage.getItem(PICKER_NAV_OPENING_KEY) === '1'
  } catch {
    return false
  }
}

export function isAdmissaoSubsistemasPickerClosing(): boolean {
  try {
    return sessionStorage.getItem(PICKER_NAV_CLOSING_KEY) === '1'
  } catch {
    return false
  }
}

function contextKey(admissaoInstanceId: string): string {
  return `${CONTEXT_PREFIX}${admissaoInstanceId}`
}

function pendingKey(admissaoInstanceId: string): string {
  return `${PENDING_PREFIX}${admissaoInstanceId}`
}

export function persistAdmissaoSubsistemasPickerContext(
  admissaoInstanceId: string,
  ctx: AdmissaoSubsistemasPickerContext
): void {
  if (!admissaoInstanceId) return
  try {
    sessionStorage.setItem(contextKey(admissaoInstanceId), JSON.stringify(ctx))
  } catch {
    // ignore
  }
}

export function readAdmissaoSubsistemasPickerContext(
  admissaoInstanceId: string
): AdmissaoSubsistemasPickerContext | null {
  if (!admissaoInstanceId) return null
  try {
    const raw = sessionStorage.getItem(contextKey(admissaoInstanceId))
    if (!raw) return null
    return JSON.parse(raw) as AdmissaoSubsistemasPickerContext
  } catch {
    return null
  }
}

export function clearAdmissaoSubsistemasPickerContext(admissaoInstanceId: string): void {
  if (!admissaoInstanceId) return
  sessionStorage.removeItem(contextKey(admissaoInstanceId))
}

export function writePendingLinhasParaAdmissao(
  admissaoInstanceId: string,
  linhas: LinhaServicoForm[]
): void {
  if (!admissaoInstanceId) return
  try {
    sessionStorage.setItem(pendingKey(admissaoInstanceId), JSON.stringify(linhas))
  } catch {
    // ignore
  }
}

export function readPendingLinhasParaAdmissao(
  admissaoInstanceId: string
): LinhaServicoForm[] | null {
  if (!admissaoInstanceId) return null
  try {
    const raw = sessionStorage.getItem(pendingKey(admissaoInstanceId))
    if (!raw) return null
    return JSON.parse(raw) as LinhaServicoForm[]
  } catch {
    return null
  }
}

export function clearPendingLinhasParaAdmissao(admissaoInstanceId: string): void {
  if (!admissaoInstanceId) return
  sessionStorage.removeItem(pendingKey(admissaoInstanceId))
}

/**
 * Grava linhas no rascunho da admissão antes do reload da rota.
 * O React StrictMode consome `pending` no 1.º mount; o rascunho sobrevive ao reload.
 */
function mergeLinhasIntoAdmissaoFormDraft(
  admissaoInstanceId: string,
  linhas: LinhaServicoForm[]
): void {
  const draft = readAdmissaoFormSessionDraft(admissaoInstanceId)
  if (!draft?.form || linhas.length === 0) return
  persistAdmissaoFormSessionDraft(admissaoInstanceId, {
    ...draft,
    activeTab: 'registo-servicos',
    form: {
      ...draft.form,
      linhasServico: [...(draft.form.linhasServico ?? []), ...linhas],
    },
  })
}

export function publishLinhasParaAdmissaoViaBroadcast(
  admissaoInstanceId: string,
  linhas: LinhaServicoForm[]
): void {
  writePendingLinhasParaAdmissao(admissaoInstanceId, linhas)
  try {
    const bc = new BroadcastChannel(ADMISSAO_SUBSISTEMAS_BC)
    bc.postMessage({
      type: 'linhas-servicos',
      admissaoInstanceId,
      linhas,
    })
    bc.close()
  } catch {
    // ignore
  }
}

export function sendSubsistemasPickerResult(
  admissaoInstanceId: string,
  rows: SubsistemaServicoTableDTO[]
):
  | { ok: true; count: number }
  | { ok: false; error: string } {
  const ctx = readAdmissaoSubsistemasPickerContext(admissaoInstanceId)
  if (!ctx) {
    return {
      ok: false,
      error:
        'Contexto da admissão não encontrado. Abra «Serviços» novamente a partir do formulário de Nova admissão.',
    }
  }
  const active = rows.filter((r) => !r.inativo)
  if (active.length === 0) {
    return { ok: false, error: 'Seleccione pelo menos um subsistema activo.' }
  }
  const linhas = buildLinhasFromSubsistemasSelecionados(
    active,
    ctx.numLinhasInserir,
    ctx.servicosLight,
    ctx.taxaModeradora,
    ctx.taxaModeradoraAtiva
  )
  if (linhas.length === 0) {
    return { ok: false, error: 'Não foi possível gerar linhas de serviço.' }
  }
  publishLinhasParaAdmissaoViaBroadcast(admissaoInstanceId, linhas)
  mergeLinhasIntoAdmissaoFormDraft(admissaoInstanceId, linhas)
  clearAdmissaoSubsistemasPickerContext(admissaoInstanceId)
  return { ok: true, count: linhas.length }
}

/**
 * Escuta linhas enviadas pela listagem de subsistemas (BroadcastChannel + fallback sessionStorage ao focar).
 */
export function subscribeLinhasFromSubsistemasPicker(
  admissaoInstanceId: string,
  onLinhas: (linhas: LinhaServicoForm[]) => void
): () => void {
  const drainPending = () => {
    const pending = readPendingLinhasParaAdmissao(admissaoInstanceId)
    if (pending && pending.length > 0) {
      clearPendingLinhasParaAdmissao(admissaoInstanceId)
      onLinhas(pending)
    }
  }

  // Não fazer drain aqui no mount: o efeito de hidratação do formulário de admissão
  // (rascunho em sessionStorage) corre depois e sobrescrevia `linhasServico`.

  const onMsg = (ev: MessageEvent) => {
    const d = ev.data as {
      type?: string
      admissaoInstanceId?: string
      linhas?: LinhaServicoForm[]
    }
    if (
      d?.type === 'linhas-servicos' &&
      d.admissaoInstanceId === admissaoInstanceId &&
      Array.isArray(d.linhas) &&
      d.linhas.length > 0
    ) {
      clearPendingLinhasParaAdmissao(admissaoInstanceId)
      onLinhas(d.linhas)
    }
  }

  let bc: BroadcastChannel | null = null
  try {
    bc = new BroadcastChannel(ADMISSAO_SUBSISTEMAS_BC)
    bc.addEventListener('message', onMsg)
  } catch {
    bc = null
  }

  window.addEventListener('focus', drainPending)

  return () => {
    window.removeEventListener('focus', drainPending)
    if (bc) {
      bc.removeEventListener('message', onMsg)
      bc.close()
    }
  }
}
