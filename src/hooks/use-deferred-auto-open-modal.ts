import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Sobrevive a remounts do KeyedLayoutOutlet / tabs inferiores (useRef não). */
const claimedKeys = new Set<string>()

const DEFAULT_DELAY_MS = 150

/**
 * Abre um modal de critérios/seleção **uma vez por tab** (`claimKey` + `instanceId`),
 * só depois do WindowManager injectar `instanceId` e da tempestade de navigates/remounts.
 *
 * Usar em listagens que auto-abrem picker (local, utente, filtros histórico, etc.).
 * Aberturas manuais (botão Critérios / Nova pesquisa) continuam a usar `setOpen(true)` directo.
 */
export function useDeferredAutoOpenModal(options: {
  /** Identificador estável do fluxo, ex.: `tratamentos-marcados-local`. */
  claimKey: string
  /** Se false, não agenda abertura (ex.: já tem local/utente seleccionado). */
  enabled: boolean
  onOpen: () => void
  delayMs?: number
}): void {
  const { claimKey, enabled, onOpen, delayMs = DEFAULT_DELAY_MS } = options
  const [searchParams] = useSearchParams()
  const instanceId = searchParams.get('instanceId')
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen

  useEffect(() => {
    if (!enabled) return
    if (!instanceId) return
    if (!claimKey) return

    const fullKey = `${claimKey}:${instanceId}`
    if (claimedKeys.has(fullKey)) return

    const timer = window.setTimeout(() => {
      if (claimedKeys.has(fullKey)) return
      claimedKeys.add(fullKey)
      onOpenRef.current()
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [enabled, instanceId, claimKey, delayMs])
}
