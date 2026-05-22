import { useSyncExternalStore } from 'react'

const URL_CHANGE_EVENT = 'urlchange'

function getBrowserPathSearch(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.pathname}${window.location.search}`
}

function subscribeBrowserPathSearch(onStoreChange: () => void): () => void {
  const notify = () => onStoreChange()
  window.addEventListener('popstate', notify)
  window.addEventListener(URL_CHANGE_EVENT, notify)
  return () => {
    window.removeEventListener('popstate', notify)
    window.removeEventListener(URL_CHANGE_EVENT, notify)
  }
}

/** Path+query do browser; re-render quando o history muda (mesmo que o Router fique preso). */
export function useBrowserPathSearch(): string {
  return useSyncExternalStore(
    subscribeBrowserPathSearch,
    getBrowserPathSearch,
    () => ''
  )
}
