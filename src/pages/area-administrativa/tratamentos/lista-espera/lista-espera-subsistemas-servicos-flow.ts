import type { SubsistemaServicoTableDTO } from '@/types/dtos/servicos/subsistema-servico.dtos'
import type { ServicoLightDTO } from '@/types/dtos/servicos/servico.dtos'
import type { ListaEsperaTratamentoServicoForm } from './modals/lista-espera-tratamento-form-utils'
import { buildServicosFromSubsistemasSelecionados } from './modals/lista-espera-subsistemas-selecao-utils'
import {
  persistListaEsperaTratamentoFormSessionDraft,
  readListaEsperaTratamentoFormSessionDraft,
} from './modals/lista-espera-tratamento-form-draft'

export type ListaEsperaSubsistemasPickerContext = {
  proximaOrdem: number
  servicosLight: ServicoLightDTO[]
}

const CONTEXT_PREFIX = 'lista-espera-subsistemas-picker-context:'
const PENDING_PREFIX = 'lista-espera-subsistemas-servicos-pending:'

export const LISTA_ESPERA_SUBSISTEMAS_BC = 'clicloud-lista-espera-subsistemas'

const PICKER_NAV_OPENING_KEY = 'lista-espera-subsistemas-picker-opening'
const PICKER_NAV_CLOSING_KEY = 'lista-espera-subsistemas-picker-closing'

export function markListaEsperaSubsistemasPickerOpening(): void {
  try {
    sessionStorage.removeItem(PICKER_NAV_CLOSING_KEY)
    sessionStorage.setItem(PICKER_NAV_OPENING_KEY, '1')
  } catch {
    // ignore
  }
}

export function markListaEsperaSubsistemasPickerClosing(): void {
  try {
    sessionStorage.removeItem(PICKER_NAV_OPENING_KEY)
    sessionStorage.setItem(PICKER_NAV_CLOSING_KEY, '1')
  } catch {
    // ignore
  }
}

export function clearListaEsperaSubsistemasPickerOpeningFlag(): void {
  try {
    sessionStorage.removeItem(PICKER_NAV_OPENING_KEY)
  } catch {
    // ignore
  }
}

export function clearListaEsperaSubsistemasPickerClosingFlag(): void {
  try {
    sessionStorage.removeItem(PICKER_NAV_CLOSING_KEY)
  } catch {
    // ignore
  }
}

function contextKey(instanceId: string): string {
  return `${CONTEXT_PREFIX}${instanceId}`
}

function pendingKey(instanceId: string): string {
  return `${PENDING_PREFIX}${instanceId}`
}

export function persistListaEsperaSubsistemasPickerContext(
  instanceId: string,
  ctx: ListaEsperaSubsistemasPickerContext
): void {
  if (!instanceId) return
  try {
    sessionStorage.setItem(contextKey(instanceId), JSON.stringify(ctx))
  } catch {
    // ignore
  }
}

export function readListaEsperaSubsistemasPickerContext(
  instanceId: string
): ListaEsperaSubsistemasPickerContext | null {
  if (!instanceId) return null
  try {
    const raw = sessionStorage.getItem(contextKey(instanceId))
    if (!raw) return null
    return JSON.parse(raw) as ListaEsperaSubsistemasPickerContext
  } catch {
    return null
  }
}

export function clearListaEsperaSubsistemasPickerContext(instanceId: string): void {
  if (!instanceId) return
  sessionStorage.removeItem(contextKey(instanceId))
}

function writePendingServicos(
  instanceId: string,
  servicos: ListaEsperaTratamentoServicoForm[]
): void {
  if (!instanceId) return
  try {
    sessionStorage.setItem(pendingKey(instanceId), JSON.stringify(servicos))
  } catch {
    // ignore
  }
}

function readPendingServicos(
  instanceId: string
): ListaEsperaTratamentoServicoForm[] | null {
  if (!instanceId) return null
  try {
    const raw = sessionStorage.getItem(pendingKey(instanceId))
    if (!raw) return null
    return JSON.parse(raw) as ListaEsperaTratamentoServicoForm[]
  } catch {
    return null
  }
}

export function readPendingServicosParaListaEspera(
  instanceId: string
): ListaEsperaTratamentoServicoForm[] | null {
  return readPendingServicos(instanceId)
}

export function clearPendingServicosParaListaEspera(instanceId: string): void {
  clearPendingServicos(instanceId)
}

function clearPendingServicos(instanceId: string): void {
  if (!instanceId) return
  sessionStorage.removeItem(pendingKey(instanceId))
}

function publishServicosViaBroadcast(
  instanceId: string,
  servicos: ListaEsperaTratamentoServicoForm[]
): void {
  writePendingServicos(instanceId, servicos)
  try {
    const bc = new BroadcastChannel(LISTA_ESPERA_SUBSISTEMAS_BC)
    bc.postMessage({
      type: 'servicos',
      listaEsperaInstanceId: instanceId,
      servicos,
    })
    bc.close()
  } catch {
    // ignore
  }
}

/**
 * Grava serviços no rascunho antes do reload da rota.
 * O React StrictMode consome `pending` no 1.º mount; o rascunho sobrevive ao reload.
 */
function mergeServicosIntoListaEsperaFormDraft(
  instanceId: string,
  servicos: ListaEsperaTratamentoServicoForm[]
): void {
  const draft = readListaEsperaTratamentoFormSessionDraft(instanceId)
  if (!draft?.form || servicos.length === 0) return
  persistListaEsperaTratamentoFormSessionDraft(instanceId, {
    ...draft,
    activeTab: 'servicos',
    servicos: [...(draft.servicos ?? []), ...servicos],
  })
}

export function sendSubsistemasPickerResultForListaEspera(
  instanceId: string,
  rows: SubsistemaServicoTableDTO[]
): { ok: true; count: number } | { ok: false; error: string } {
  const ctx = readListaEsperaSubsistemasPickerContext(instanceId)
  if (!ctx) {
    return {
      ok: false,
      error:
        'Contexto da lista de espera não encontrado. Abra «Inserir» novamente a partir do formulário.',
    }
  }
  const active = rows.filter((r) => !r.inativo)
  if (active.length === 0) {
    return { ok: false, error: 'Seleccione pelo menos um subsistema activo.' }
  }
  const servicos = buildServicosFromSubsistemasSelecionados(
    active,
    ctx.proximaOrdem,
    ctx.servicosLight
  )
  if (servicos.length === 0) {
    return { ok: false, error: 'Não foi possível gerar linhas de serviço.' }
  }
  publishServicosViaBroadcast(instanceId, servicos)
  mergeServicosIntoListaEsperaFormDraft(instanceId, servicos)
  clearListaEsperaSubsistemasPickerContext(instanceId)
  return { ok: true, count: servicos.length }
}

export function subscribeServicosFromSubsistemasPicker(
  instanceId: string,
  onServicos: (servicos: ListaEsperaTratamentoServicoForm[]) => void
): () => void {
  const drainPending = () => {
    const pending = readPendingServicos(instanceId)
    if (pending && pending.length > 0) {
      clearPendingServicos(instanceId)
      onServicos(pending)
    }
  }

  const onMsg = (ev: MessageEvent) => {
    const d = ev.data as {
      type?: string
      listaEsperaInstanceId?: string
      servicos?: ListaEsperaTratamentoServicoForm[]
    }
    if (
      d?.type === 'servicos' &&
      d.listaEsperaInstanceId === instanceId &&
      Array.isArray(d.servicos) &&
      d.servicos.length > 0
    ) {
      clearPendingServicos(instanceId)
      onServicos(d.servicos)
    }
  }

  let bc: BroadcastChannel | null = null
  try {
    bc = new BroadcastChannel(LISTA_ESPERA_SUBSISTEMAS_BC)
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
