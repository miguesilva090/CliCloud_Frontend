import { UpdateInfo, AppUpdateDTO } from '@/types/api/responses'
import { useAuthStore } from '@/stores/auth-store'
import { getRuntimeConfig } from '@/lib/config/runtime-config'
import { updaterEnv } from '@/lib/config/updater-env'
import { isProduction } from '@/utils/env-utils'
import { clearAllWindowData } from '@/utils/window-utils'

const PENDING_UPDATE_KEY = 'pendingUpdate'
const LICENCA_ID_KEY = 'pendingUpdateLicencaId'

interface UpdaterApplyRequest {
  licencaId: string
  updateId: string
  updateType: number
  updateVersion: string | null
  isMandatory: boolean
  downloadUrl: string | null
  description: string | null
  releaseNotes: string | null
  hashFicheiroApi?: string | null
  hashFicheiroFrontend?: string | null
}

interface UpdaterApplyBatchRequest {
  licencaId: string
  updates: UpdaterApplyRequest[]
}

const getUpdaterKey = (): string | undefined => {
  const config = getRuntimeConfig()
  return config.updaterApiKey || import.meta.env.VITE_UPDATER_API_KEY
}

const getLicencaId = (): string => {
  // Resolve the license identifier from runtime config or env variable.
  // Each deployed frontend instance should set licencaId in config.json differently.
  const config = getRuntimeConfig()
  const fromConfig = config.licencaId
  const fromEnv = import.meta.env.VITE_LICENCA_ID as string | undefined

  if (fromConfig && fromConfig.trim().length > 0) {
    return fromConfig.trim()
  }

  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv.trim()
  }

  // Fallback to auth store (decoded from JWT token)
  const authStore = useAuthStore.getState()
  let licencaId = authStore.licencaId

  // If available in auth store, update sessionStorage to keep it in sync
  if (licencaId && licencaId.trim().length > 0) {
    try {
      sessionStorage.setItem(LICENCA_ID_KEY, licencaId.trim())
    } catch (error) {
      console.error('Failed to store licencaId in sessionStorage', error)
    }
    return licencaId.trim()
  }

  // If not available in auth store, try to get it from sessionStorage
  // (stored before clearing auth during update handling)
  try {
    const storedLicencaId = sessionStorage.getItem(LICENCA_ID_KEY)
    if (storedLicencaId && storedLicencaId.trim().length > 0) {
      return storedLicencaId.trim()
    }
  } catch (error) {
    console.error('Failed to read licencaId from sessionStorage', error)
  }

  // Fallback to a sensible default to avoid calling updater without a key.
  return 'DEFAULT_LICENCA'
}

export const updateStorage = {
  getPendingUpdate(): UpdateInfo | null {
    try {
      const raw = sessionStorage.getItem(PENDING_UPDATE_KEY)
      return raw ? (JSON.parse(raw) as UpdateInfo) : null
    } catch (error) {
      console.error('Failed to read pending update from sessionStorage', error)
      return null
    }
  },

  setPendingUpdate(update: UpdateInfo | null): void {
    try {
      if (update) {
        sessionStorage.setItem(PENDING_UPDATE_KEY, JSON.stringify(update))
      } else {
        sessionStorage.removeItem(PENDING_UPDATE_KEY)
      }
    } catch (error) {
      console.error('Failed to write pending update to sessionStorage', error)
    }
  },
}

interface StartUpdateResponse {
  trackingId?: string
  lastUpdateStatus?: string
}

export const updateService = {
  /**
   * Clears session/auth data and persists the pending update.
   * This should be called when the Licenses API indicates an update is available.
   */
  async handleUpdateAvailable(update: UpdateInfo): Promise<void> {
    if (!isProduction()) {
      console.log('[UpdateService] Skipping update in development mode')
      return
    }

    if (!update || !update.hasUpdate) {
      return
    }

    // Store licencaId before clearing auth store
    try {
      const authStore = useAuthStore.getState()
      const licencaId = authStore.licencaId
      if (licencaId && licencaId.trim().length > 0) {
        sessionStorage.setItem(LICENCA_ID_KEY, licencaId.trim())
      }
    } catch (error) {
      console.error('Error storing licencaId during update handling', error)
    }

    // Clear all session/auth related data
    try {
      clearAllWindowData()
    } catch (error) {
      console.error('Error clearing window data during update handling', error)
    }

    try {
      useAuthStore.getState().clearAuth()
    } catch (error) {
      console.error('Error clearing auth store during update handling', error)
    }

    // Persist update info for app restart
    updateStorage.setPendingUpdate(update)

    // Notify the running app so it can immediately show the update dialog
    if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
      const event = new CustomEvent<UpdateInfo>('pending-update-available', {
        detail: update,
      })
      window.dispatchEvent(event)
    }
  },

  /**
   * Normalize an update DTO to handle different field names from API
   */
  normalizeUpdate(upd: AppUpdateDTO): AppUpdateDTO {
    return {
      ...upd,
      updateVersion: upd.updateVersion ?? upd.version ?? null,
      updateDescription: upd.updateDescription ?? upd.description ?? null,
    }
  },

  /**
   * Get the list of updates to apply from UpdateInfo.
   * Prefers updatesDisponiveis/updates if available, otherwise falls back to legacy single update.
   */
  getUpdatesToApply(update: UpdateInfo): AppUpdateDTO[] {
    const updates = update.updatesDisponiveis ?? update.updates
    if (updates && updates.length > 0) {
      // Sort by version ASC (oldest first) and normalize field names
      return [...updates]
        .sort((a, b) => {
          const vA = a.updateVersion ?? a.version ?? ''
          const vB = b.updateVersion ?? b.version ?? ''
          return vA.localeCompare(vB, undefined, { numeric: true })
        })
        .map(this.normalizeUpdate)
    }
    // Fallback to legacy single update format
    // Note: Using deprecated fields for backward compatibility with legacy API responses
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const updateWithDeprecatedFields = update as UpdateInfo & {
      updateId: string | null
      updateVersion: string | null
      updateType: number
      updateDescription: string | null
      releaseNotes: string | null
      releaseDate: string | null
      ficheiroUpdateApi: string | null
      tamanhoFicheiroApi: number | null
      hashFicheiroApi: string | null
      ficheiroUpdateFrontend: string | null
      tamanhoFicheiroFrontend: number | null
      hashFicheiroFrontend: string | null
    }
    return [
      {
        updateId: updateWithDeprecatedFields.updateId,
        updateVersion: updateWithDeprecatedFields.updateVersion,
        updateType: updateWithDeprecatedFields.updateType,
        isMandatory: update.isMandatory,
        updateDescription: updateWithDeprecatedFields.updateDescription,
        releaseNotes: updateWithDeprecatedFields.releaseNotes,
        releaseDate: updateWithDeprecatedFields.releaseDate,
        ficheiroUpdateApi: updateWithDeprecatedFields.ficheiroUpdateApi,
        tamanhoFicheiroApi: updateWithDeprecatedFields.tamanhoFicheiroApi,
        hashFicheiroApi: updateWithDeprecatedFields.hashFicheiroApi,
        ficheiroUpdateFrontend:
          updateWithDeprecatedFields.ficheiroUpdateFrontend,
        tamanhoFicheiroFrontend:
          updateWithDeprecatedFields.tamanhoFicheiroFrontend,
        hashFicheiroFrontend: updateWithDeprecatedFields.hashFicheiroFrontend,
      },
    ]
  },

  /**
   * Starts the update by calling Globalsoft.Updater.
   * Returns the trackingId so the caller can redirect to the updater's static page.
   * Handles multiple updates by sending them in order (oldest first).
   */
  async startUpdate(update: UpdateInfo): Promise<string> {
    if (!isProduction()) {
      console.log('[UpdateService] Skipping update in development mode')
      throw new Error('Updates are disabled in development mode')
    }

    if (!update || !update.hasUpdate) {
      throw new Error('Cannot start update without a valid update payload')
    }

    const updates = this.getUpdatesToApply(update)

    if (updates.length === 0 || !updates[0].updateId) {
      console.error(
        'Update is missing updateId while hasUpdate === true',
        update
      )
      throw new Error('Informação de atualização inválida. Contacte o suporte.')
    }

    const baseUrl = updaterEnv.updaterApiUrl
    if (!baseUrl) {
      throw new Error(
        'Serviço de atualização não está configurado. Contacte o suporte.'
      )
    }

    const updaterKey = getUpdaterKey()
    const licencaId = getLicencaId()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (updaterKey) {
      headers['X-Updater-Key'] = updaterKey
    }

    try {
      let trackingId: string | undefined

      if (updates.length === 1) {
        // Single update - use legacy endpoint for backward compatibility
        const url = `${baseUrl}/api/update/apply`
        const singleUpdate = updates[0]

        const body: UpdaterApplyRequest = {
          licencaId,
          updateId: singleUpdate.updateId!,
          updateType: singleUpdate.updateType,
          updateVersion: singleUpdate.updateVersion ?? null,
          isMandatory: singleUpdate.isMandatory,
          downloadUrl: null,
          description: singleUpdate.updateDescription ?? null,
          releaseNotes: singleUpdate.releaseNotes,
          hashFicheiroApi: singleUpdate.hashFicheiroApi ?? null,
          hashFicheiroFrontend: singleUpdate.hashFicheiroFrontend ?? null,
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          console.error('Failed to start update', await response.text())
          throw new Error(
            'Não foi possível iniciar a atualização. Contacte o suporte.'
          )
        }

        const data = (await response.json()) as StartUpdateResponse
        trackingId = data.trackingId
      } else {
        // Multiple updates - use batch endpoint
        const url = `${baseUrl}/api/update/apply-batch`

        const body: UpdaterApplyBatchRequest = {
          licencaId,
          updates: updates
            .filter((u) => u.updateId)
            .map((u) => ({
              licencaId,
              updateId: u.updateId!,
              updateType: u.updateType,
              updateVersion: u.updateVersion ?? null,
              isMandatory: u.isMandatory,
              downloadUrl: null,
              description: u.updateDescription ?? null,
              releaseNotes: u.releaseNotes,
              hashFicheiroApi: u.hashFicheiroApi ?? null,
              hashFicheiroFrontend: u.hashFicheiroFrontend ?? null,
            })),
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          console.error('Failed to start batch update', await response.text())
          throw new Error(
            'Não foi possível iniciar a atualização. Contacte o suporte.'
          )
        }

        const data = (await response.json()) as StartUpdateResponse
        trackingId = data.trackingId
      }

      if (!trackingId) {
        throw new Error(
          'O serviço de atualização não devolveu um ID de rastreamento.'
        )
      }

      // Clear pending update and licencaId from storage since we're handing off to the updater page
      updateStorage.setPendingUpdate(null)
      try {
        sessionStorage.removeItem(LICENCA_ID_KEY)
      } catch (error) {
        console.error('Error removing licencaId from sessionStorage', error)
      }

      return trackingId
    } catch (error) {
      console.error('Error while starting update', error)
      throw new Error(
        'O serviço de atualização não está disponível. Contacte o suporte.'
      )
    }
  },

  /**
   * Returns the URL of the updater's static "updating" page.
   */
  getUpdatingPageUrl(trackingId: string, returnUrl: string): string {
    const baseUrl = updaterEnv.updaterApiUrl
    const updaterKey = getUpdaterKey()

    const params = new URLSearchParams({
      trackingId,
      returnUrl,
    })

    if (updaterKey) {
      params.set('key', updaterKey)
    }

    return `${baseUrl}/updating.html?${params.toString()}`
  },
}
