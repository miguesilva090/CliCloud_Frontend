import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const URL_CHANGE_EVENT = 'urlchange'

/**
 * Garante uma key de pathname que está sempre em sync com o URL real do browser.
 * Quando o React Router não re-renderiza após navigate() (ex.: após interagir com DataTable
 * em Sinistrados), o URL muda mas a vista não. Este hook escuta pushState/replaceState e
 * popstate, força um state update e sincroniza o Router com navigate() para a vista actualizar.
 */
export function usePathnameKey(): string {
  const location = useLocation()
  const navigate = useNavigate()
  const [pathKey, setPathKey] = useState(() => window.location.pathname)
  const isSyncingRef = useRef(false)

  const syncRouterFromBrowser = useCallback(() => {
    const browserFull =
      window.location.pathname +
      window.location.search +
      window.location.hash
    const routerFull =
      location.pathname + location.search + location.hash

    setPathKey(window.location.pathname)

    if (browserFull !== routerFull && !isSyncingRef.current) {
      isSyncingRef.current = true
      navigate(browserFull, { replace: true })
      setTimeout(() => {
        isSyncingRef.current = false
      }, 0)
    }
  }, [
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ])

  // Sync a partir do React Router quando coincide com o browser
  useEffect(() => {
    if (window.location.pathname === location.pathname) {
      setPathKey(location.pathname)
    }
  }, [location.pathname])

  // Sync pathKey e Router quando o URL do browser muda (pushState/replaceState ou popstate)
  useEffect(() => {
    const onPopstate = () => syncRouterFromBrowser()

    window.addEventListener(URL_CHANGE_EVENT, syncRouterFromBrowser)
    window.addEventListener('popstate', onPopstate)

    const origPush = history.pushState
    const origReplace = history.replaceState

    history.pushState = function (
      this: History,
      ...args: Parameters<History['pushState']>
    ) {
      origPush.apply(this, args)
      window.dispatchEvent(new Event(URL_CHANGE_EVENT))
    }
    history.replaceState = function (
      this: History,
      ...args: Parameters<History['replaceState']>
    ) {
      origReplace.apply(this, args)
      window.dispatchEvent(new Event(URL_CHANGE_EVENT))
    }

    return () => {
      window.removeEventListener(URL_CHANGE_EVENT, syncRouterFromBrowser)
      window.removeEventListener('popstate', onPopstate)
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [syncRouterFromBrowser])

  return pathKey
}
