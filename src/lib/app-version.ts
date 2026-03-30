let cachedVersion: string | null = null
let loadingPromise: Promise<string> | null = null

export async function loadAppVersion(): Promise<string> {
  if (cachedVersion) {
    return cachedVersion
  }

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    try {
      const res = await fetch('/version.json', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error('Failed to load version.json')
      }

      const data = (await res.json()) as { appVersion?: unknown }
      const version =
        typeof data.appVersion === 'string' && data.appVersion.trim().length > 0
          ? data.appVersion
          : 'unknown'

      cachedVersion = version
      return version
    } catch (error) {
      console.error('Failed to load app version from version.json', error)
      cachedVersion = 'unknown'
      return 'unknown'
    } finally {
      loadingPromise = null
    }
  })()

  return loadingPromise
}
