import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  clearAdmissaoSubsistemasPickerClosingFlag,
  isAdmissaoSubsistemasPickerClosing,
  isAdmissaoSubsistemasPickerOpening,
} from '@/pages/area-comum/tabelas/consultas/servicos/subsistemas-servicos/subsistemas-servicos-admissao-flow'
import { getWindowShellResetFromState } from '@/utils/window-utils'

const URL_CHANGE_EVENT = 'urlchange'

/** Evita loop: `navigate()` do sync dispara `replaceState` → `urlchange` → sync outra vez. */
let suppressUrlChangeUntil = 0
let lastSyncNavigateTo: { full: string; at: number } | null = null

function scheduleSuppressUrlChange(ms = 500): void {
  suppressUrlChangeUntil = Date.now() + ms
}

function shouldIgnoreUrlChangeEvent(): boolean {
  return Date.now() < suppressUrlChangeUntil
}

function pathAndQuery(full: string): { path: string; query: string } {
  const q = full.indexOf('?')
  if (q < 0) return { path: full, query: '' }
  return { path: full.slice(0, q), query: full.slice(q) }
}

type RouterLoc = { pathname: string; search: string; hash: string }

type PathnameKeyCtrl = {
  syncGen: number
  router: RouterLoc
}

/**
 * Key do layout alinhada ao React Router. O patch de `history` + evento `urlchange` corrige
 * casos em que o URL do browser muda mas o Outlet não remonta (ex. Sinistrados).
 *
 * Fluxo admissão ↔ subsistemas: flags `opening`/`closing` + supressão após `navigate()` do
 * próprio sync para não entrar em loop quando o Router ainda não actualizou o ref.
 */
export function usePathnameKey(): string {
  const location = useLocation()
  const navigate = useNavigate()
  const [pathKey, setPathKey] = useState(
    () =>
      typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : ''
  )
  const ctrlRef = useRef<PathnameKeyCtrl>({
    syncGen: 0,
    router: { pathname: '', search: '', hash: '' },
  })
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  useLayoutEffect(() => {
    ctrlRef.current.router = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    }
    const routerFull =
      location.pathname + location.search + location.hash
    const browserFull =
      window.location.pathname +
      window.location.search +
      window.location.hash
    if (routerFull === browserFull) {
      lastSyncNavigateTo = null
    }
  }, [location.pathname, location.search, location.hash])

  const syncRouterFromBrowser = useCallback(() => {
    if (shouldIgnoreUrlChangeEvent()) return

    const gen = ++ctrlRef.current.syncGen

    queueMicrotask(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (gen !== ctrlRef.current.syncGen) return
          if (shouldIgnoreUrlChangeEvent()) return

          const browserFull =
            window.location.pathname +
            window.location.search +
            window.location.hash
          const loc = ctrlRef.current.router
          const routerFull = loc.pathname + loc.search + loc.hash

          setPathKey(window.location.pathname + window.location.search)

          if (browserFull === routerFull) {
            lastSyncNavigateTo = null
            if (isAdmissaoSubsistemasPickerClosing()) {
              clearAdmissaoSubsistemasPickerClosingFlag()
            }
            return
          }

          const now = Date.now()
          const pending = lastSyncNavigateTo
          if (
            pending?.full === browserFull &&
            now - pending.at < 1200 &&
            routerFull === browserFull
          ) {
            return
          }

          const { path: bPath, query: bQuery } = pathAndQuery(browserFull)
          const { path: rPath } = pathAndQuery(routerFull)
          const stalePickerBrowserAheadOfRouter =
            rPath.includes('/admissoes/novo') &&
            bPath.includes('subsistemas-servicos') &&
            bQuery.includes('fromAdmissao=')

          const pickerOpening = isAdmissaoSubsistemasPickerOpening()
          const pickerClosing = isAdmissaoSubsistemasPickerClosing()

          const closingBackToAdmissao =
            pickerClosing &&
            bPath.includes('/admissoes/novo') &&
            rPath.includes('subsistemas-servicos')

          let target = browserFull
          if (closingBackToAdmissao) {
            target = browserFull
            lastSyncNavigateTo = null
          } else if (stalePickerBrowserAheadOfRouter && pickerClosing) {
            target = routerFull
          } else if (stalePickerBrowserAheadOfRouter && !pickerOpening) {
            target = browserFull
          }

          if (import.meta.env.DEV) {
            console.info('[route-debug] usePathnameKey sync → navigate', {
              target,
              browserFull,
              routerFull,
              stalePickerBrowserAheadOfRouter,
              pickerOpening,
              pickerClosing,
            })
          }

          lastSyncNavigateTo = { full: target, at: now }
          scheduleSuppressUrlChange(600)
          navigateRef.current(target, { replace: true })
        })
      })
    })
  }, [])

  const shellReset = getWindowShellResetFromState(location.state)

  useEffect(() => {
    const next = `${location.pathname}${location.search}-${location.key}${
      shellReset ? `-${shellReset}` : ''
    }`
    setPathKey(next)
    ctrlRef.current.syncGen += 1
  }, [location.pathname, location.search, location.key, shellReset])

  useEffect(() => {
    const onPopstate = () => syncRouterFromBrowser()

    const onUrlChange = () => {
      if (!shouldIgnoreUrlChangeEvent()) {
        syncRouterFromBrowser()
      }
    }

    window.addEventListener(URL_CHANGE_EVENT, onUrlChange)
    window.addEventListener('popstate', onPopstate)

    const origPush = history.pushState
    const origReplace = history.replaceState

    history.pushState = function (
      this: History,
      ...args: Parameters<History['pushState']>
    ) {
      origPush.apply(this, args)
      if (!shouldIgnoreUrlChangeEvent()) {
        window.dispatchEvent(new Event(URL_CHANGE_EVENT))
      }
    }
    history.replaceState = function (
      this: History,
      ...args: Parameters<History['replaceState']>
    ) {
      origReplace.apply(this, args)
      if (!shouldIgnoreUrlChangeEvent()) {
        window.dispatchEvent(new Event(URL_CHANGE_EVENT))
      }
    }

    return () => {
      window.removeEventListener(URL_CHANGE_EVENT, onUrlChange)
      window.removeEventListener('popstate', onPopstate)
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [syncRouterFromBrowser])

  return pathKey
}

/** Chamar antes de `navigate()` programático (ex. fechar tab) para não reentrar no sync. */
export function suppressPathnameKeyUrlChange(ms = 600): void {
  scheduleSuppressUrlChange(ms)
}

/** Limpa dedup do sync (ex. após fechar picker subsistemas → admissão). */
export function clearPathnameKeySyncPending(): void {
  lastSyncNavigateTo = null
}
