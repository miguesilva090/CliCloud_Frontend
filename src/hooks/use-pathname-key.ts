import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const URL_CHANGE_EVENT = 'urlchange'

/**
 * Garante uma key de pathname que está sempre em sync com o URL real do browser.
 * Quando o React Router não re-renderiza após navigate() (ex.: após interagir com DataTable),
 * o URL muda mas a vista não. Este hook escuta pushState/replaceState e popstate,
 * força um state update e sincroniza o Router com navigate() para a vista actualizar.
 */
export function usePathnameKey(): string {
  const location = useLocation()
  const navigate = useNavigate()
  const [pathKey, setPathKey] = useState(() => location.pathname)
  const isSyncingRef = useRef(false)

  // Sync a partir do React Router quando actualiza
  useEffect(() => {
    setPathKey(location.pathname)
  }, [location.pathname])

  // Sync pathKey quando o URL muda (pushState/replaceState ou popstate)
  useEffect(() => {
    const syncPathKey = () => setPathKey(window.location.pathname)

    const onPopstate = () => {
      syncPathKey()
      const fullUrl =
        window.location.pathname +
        window.location.search +
        window.location.hash
      const routerFull =
        location.pathname + location.search + location.hash
      if (fullUrl !== routerFull && !isSyncingRef.current) {
        isSyncingRef.current = true
        navigate(fullUrl, { replace: true })
        setTimeout(() => {
          isSyncingRef.current = false
        }, 0)
      }
    }

    // pushState/replaceState: só sync pathKey (o React Router já fez navigate)
    window.addEventListener(URL_CHANGE_EVENT, syncPathKey)
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
      window.removeEventListener(URL_CHANGE_EVENT, syncPathKey)
      window.removeEventListener('popstate', onPopstate)
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [location.pathname, location.search, location.hash, navigate])

  return pathKey
}
