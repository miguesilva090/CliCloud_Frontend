import { useLayoutEffect, useMemo, useRef } from 'react'
import { create } from 'zustand'
import { persist, StorageValue } from 'zustand/middleware'
import { useCurrentWindowId } from '@/utils/window-utils'

export interface FormState {
  // Form data - limit size to prevent memory bloat
  formData: Record<string, any>
  // Form validation state
  isValid: boolean
  // Form submission state
  isSubmitting: boolean
  // Form dirty state
  isDirty: boolean
  // Form instance identifier
  formId: string
  // Window ID to track which window this form belongs to
  windowId: string
  // Last active timestamp
  lastActive: number
  // Flag to indicate if the form has been initialized
  isInitialized: boolean
  // Flag to indicate if the form has been visited
  hasBeenVisited: boolean
  // Flag to indicate if the form has been modified
  hasBeenModified: boolean
  // Data size tracking for cleanup
  dataSize: number
}

interface FormsState {
  forms: Record<string, FormState>
  setFormState: (formId: string, newState: Partial<FormState>) => void
  resetFormState: (formId: string) => void
  removeFormState: (formId: string) => void
  getFormState: (formId: string) => FormState | null
  updateFormState: (
    formId: string,
    updater: (state: FormState) => Partial<FormState>
  ) => void
  // Helper methods
  cleanupOrphanedFormStates: () => void
  // New method to ensure form isolation
  ensureFormIsolation: (formId: string) => void
  // New method to initialize a form with clean state
  initializeForm: (formId: string) => void
  // New method to mark a form as visited
  markFormAsVisited: (formId: string) => void
  // New method to check if form has data
  hasFormData: (formId: string) => boolean
  // New method to clean up all form instances for a specific entity type
  cleanupEntityFormStates: (entityType: string) => void
  // New method to clear all form data
  clearAllFormData: () => void
  // New method to get memory usage
  getMemoryUsage: () => { totalForms: number; totalSize: number }
  // New method to cleanup old forms
  cleanupOldForms: (maxAge: number) => void
}

const defaultFormState: FormState = {
  formData: {},
  isValid: false,
  isSubmitting: false,
  isDirty: false,
  formId: '',
  windowId: '',
  lastActive: Date.now(),
  isInitialized: false,
  hasBeenVisited: false,
  hasBeenModified: false,
  dataSize: 0,
}

// Helper function to calculate data size
const calculateDataSize = (data: any): number => {
  try {
    return new Blob([JSON.stringify(data)]).size
  } catch {
    return 0
  }
}

// Helper function to check if data has actually changed
const hasDataChanged = (oldData: any, newData: any): boolean => {
  if (oldData === newData) return false
  if (!oldData && !newData) return false
  if (!oldData || !newData) return true

  try {
    return JSON.stringify(oldData) !== JSON.stringify(newData)
  } catch {
    return true
  }
}

// Create a selector factory for memoized state access
const createFormStateSelector = (formId: string) => (state: FormsState) =>
  state.forms[formId] || null

export const useFormsStore = create<FormsState>()(
  persist(
    (set, get) => ({
      forms: {},

      setFormState: (formId, newState) => {
        set((state) => {
          // CRITICAL: Ensure form exists in store before updating
          // If form doesn't exist, create it with proper initialization
          let currentState = state.forms[formId]

          if (!currentState) {
            // Form doesn't exist, create it first
            currentState = {
              ...defaultFormState,
              formId,
              lastActive: Date.now(),
              isInitialized: true,
              hasBeenVisited: true,
            }
            // Update state to include the new form
            state = {
              ...state,
              forms: {
                ...state.forms,
                [formId]: currentState,
              },
            }
          }

          // Only update changed fields to reduce unnecessary re-renders
          const updatedState = Object.entries(newState).reduce(
            (acc, [key, value]) => {
              const currentValue = currentState[key as keyof FormState]

              // Use optimized change detection
              if (hasDataChanged(currentValue, value)) {
                // Type-safe assignment based on the key
                switch (key) {
                  case 'formData':
                    acc.formData = value as Record<string, any>
                    acc.hasBeenModified = true
                    acc.dataSize = calculateDataSize(value)
                    break
                  case 'isValid':
                    acc.isValid = value as boolean
                    break
                  case 'isSubmitting':
                    acc.isSubmitting = value as boolean
                    break
                  case 'isDirty':
                    acc.isDirty = value as boolean
                    break
                  case 'formId':
                    acc.formId = value as string
                    break
                  case 'windowId':
                    acc.windowId = value as string
                    break
                  case 'lastActive':
                    acc.lastActive = value as number
                    break
                  case 'isInitialized':
                    acc.isInitialized = value as boolean
                    break
                  case 'hasBeenVisited':
                    acc.hasBeenVisited = value as boolean
                    break
                  case 'hasBeenModified':
                    acc.hasBeenModified = value as boolean
                    break
                  case 'dataSize':
                    acc.dataSize = value as number
                    break
                  default:
                    // Skip unknown keys
                    break
                }
              }
              return acc
            },
            {} as Partial<FormState>
          )

          if (Object.keys(updatedState).length === 0) {
            return state
          }

          return {
            forms: {
              ...state.forms,
              [formId]: {
                ...currentState,
                ...updatedState,
                formId, // Always ensure formId is set
                lastActive: Date.now(), // Update last active timestamp
              },
            },
          }
        })
      },

      resetFormState: (formId) => {
        set((state) => ({
          forms: {
            ...state.forms,
            [formId]: {
              ...defaultFormState,
              formId, // Always ensure formId is set
              lastActive: Date.now(),
            },
          },
        }))
      },

      removeFormState: (formId) => {
        set((state) => {
          const { [formId]: removed, ...remainingForms } = state.forms
          return {
            forms: remainingForms,
          }
        })
      },

      getFormState: (formId) => {
        const state = get().forms[formId]
        if (!state) return null
        return state
      },

      updateFormState: (formId, updater) => {
        set((state) => {
          const currentState = state.forms[formId] || defaultFormState
          const updates = updater(currentState)

          // Only update if there are actual changes
          const hasChanges = Object.entries(updates).some(([key, value]) =>
            hasDataChanged(currentState[key as keyof FormState], value)
          )

          if (!hasChanges) return state

          return {
            forms: {
              ...state.forms,
              [formId]: {
                ...currentState,
                ...updates,
                lastActive: Date.now(), // Update last active timestamp
              },
            },
          }
        })
      },

      cleanupOrphanedFormStates: () => {
        set((state) => {
          // Get all form IDs from the current state
          const formIds = Object.keys(state.forms)

          // Create a new state with only the active form instances
          const cleanedForms = formIds.reduce(
            (acc, formId) => {
              const form = state.forms[formId]

              // Keep the form if it has been visited and has data
              if (form.hasBeenVisited && form.hasBeenModified) {
                acc[formId] = form
              }

              return acc
            },
            {} as Record<string, FormState>
          )

          // Also clean up the old format instances if they exist
          const cleanedState = { forms: cleanedForms }
          if ('instances' in state) {
            // Remove the old instances property
            delete (cleanedState as any).instances
          }

          return cleanedState
        })
      },

      ensureFormIsolation: (formId) => {
        set((state) => {
          // If the form doesn't exist, initialize it with default state
          if (!state.forms[formId]) {
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  ...defaultFormState,
                  formId,
                  lastActive: Date.now(),
                },
              },
            }
          }
          return state
        })
      },

      initializeForm: (formId) => {
        set((state) => {
          const currentState = state.forms[formId]

          // Only initialize if form doesn't exist
          // Don't reset if form has data (even if isInitialized is false)
          if (!currentState) {
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  ...defaultFormState,
                  formId,
                  lastActive: Date.now(),
                  isInitialized: true,
                },
              },
            }
          }

          // If form exists but not marked as initialized, just mark it
          if (!currentState.isInitialized) {
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  ...currentState,
                  isInitialized: true,
                  lastActive: Date.now(),
                },
              },
            }
          }

          return state
        })
      },

      markFormAsVisited: (formId) => {
        set((state) => {
          const currentState = state.forms[formId]

          if (!currentState) {
            return {
              forms: {
                ...state.forms,
                [formId]: {
                  ...defaultFormState,
                  formId,
                  lastActive: Date.now(),
                  isInitialized: true,
                  hasBeenVisited: true,
                },
              },
            }
          }

          return {
            forms: {
              ...state.forms,
              [formId]: {
                ...currentState,
                hasBeenVisited: true,
                lastActive: Date.now(),
              },
            },
          }
        })
      },

      hasFormData: (formId) => {
        const state = get().forms[formId]
        return !!(
          state &&
          state.formData &&
          Object.keys(state.formData).length > 0 &&
          state.hasBeenVisited &&
          state.hasBeenModified
        )
      },

      cleanupEntityFormStates: (entityType) => {
        set((state) => {
          // Create a new state with only the form instances that don't match the entity type
          const cleanedForms = Object.entries(state.forms).reduce(
            (acc, [formId, form]) => {
              // Keep forms that don't match the entity type
              if (!formId.startsWith(`${entityType}-`)) {
                acc[formId] = form
              }
              return acc
            },
            {} as Record<string, FormState>
          )

          return { forms: cleanedForms }
        })
      },

      clearAllFormData: () => {
        set(() => ({
          forms: {},
        }))
      },

      getMemoryUsage: () => {
        const state = get()
        const forms = Object.values(state.forms)
        const totalForms = forms.length
        const totalSize = forms.reduce((sum, form) => sum + form.dataSize, 0)

        return { totalForms, totalSize }
      },

      cleanupOldForms: (maxAge) => {
        set((state) => {
          const now = Date.now()
          const cleanedForms = Object.entries(state.forms).reduce(
            (acc, [formId, form]) => {
              // Keep forms that are recent or have been modified
              if (now - form.lastActive < maxAge || form.hasBeenModified) {
                acc[formId] = form
              }
              return acc
            },
            {} as Record<string, FormState>
          )

          return { forms: cleanedForms }
        })
      },
    }),
    {
      name: 'form-instances-storage',
      storage: {
        getItem: (name): StorageValue<FormsState> | null => {
          const value = localStorage.getItem(name)
          if (!value) return null
          try {
            const parsed = JSON.parse(value)
            // Convert date strings back to Date objects recursively
            // Only convert strings that match ISO date patterns and are valid dates
            const reviveDates = (obj: any): any => {
              if (obj === null || obj === undefined) return obj

              // Check if it's a string that looks like an ISO date string
              if (typeof obj === 'string') {
                // Match ISO 8601 date patterns (with or without time, with or without timezone)
                const isoDatePattern =
                  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/
                if (isoDatePattern.test(obj)) {
                  const date = new Date(obj)
                  // Only convert if it's a valid date and matches ISO format
                  if (!isNaN(date.getTime())) {
                    // Check if round-trip conversion matches (with tolerance for timezone differences)
                    const isoString = date.toISOString()
                    if (
                      isoString === obj ||
                      isoString.slice(0, 10) === obj.slice(0, 10)
                    ) {
                      return date
                    }
                  }
                }
              }

              if (Array.isArray(obj)) {
                return obj.map(reviveDates)
              }

              if (typeof obj === 'object' && obj.constructor === Object) {
                return Object.entries(obj).reduce((acc, [key, val]) => {
                  acc[key] = reviveDates(val)
                  return acc
                }, {} as any)
              }

              return obj
            }
            return reviveDates(parsed) as StorageValue<FormsState>
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          // JSON.stringify already converts Date objects to ISO strings
          // No special handling needed for storage
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
      // Add migration to handle old data format
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // If we have old format data, convert it to new format
          if (persistedState && persistedState.instances) {
            const newState = {
              forms: Object.entries(persistedState.instances).reduce(
                (acc, [key, value]) => {
                  const formData = value as Record<string, any>
                  acc[key] = {
                    ...defaultFormState,
                    formId: key,
                    formData,
                    lastActive: Date.now(),
                    isInitialized: true,
                    hasBeenVisited: true,
                    hasBeenModified: true,
                    isDirty: true, // Ensure migrated data is marked as dirty
                    dataSize: calculateDataSize(formData),
                  }
                  return acc
                },
                {} as Record<string, FormState>
              ),
            }
            return newState
          }
        }

        // Ensure loaded forms have all required fields with defaults
        if (persistedState && persistedState.forms) {
          const forms = persistedState.forms
          Object.keys(forms).forEach((formId) => {
            const form = forms[formId]
            // Fill in missing fields with defaults
            forms[formId] = {
              ...defaultFormState,
              ...form,
              formId, // Ensure formId is set
            }
          })
        }

        return persistedState
      },
      // Only persist essential data to reduce storage size
      partialize: (state) => ({
        forms: Object.entries(state.forms).reduce(
          (acc, [formId, form]) => {
            // Only persist forms that have been visited and modified
            if (form.hasBeenVisited && form.hasBeenModified) {
              acc[formId] = {
                formData: form.formData,
                formId: form.formId,
                windowId: form.windowId,
                lastActive: form.lastActive,
                hasBeenVisited: form.hasBeenVisited,
                hasBeenModified: form.hasBeenModified,
                isInitialized: form.isInitialized,
                isDirty: form.isDirty, // ← Added to prevent MemoryManager deletion
                dataSize: form.dataSize,
              }
            }
            return acc
          },
          {} as Record<string, Partial<FormState>>
        ),
      }),
    }
  )
)

// Hook for accessing form state with memoization
export const useFormState = (formId: string) => {
  const {
    ensureFormIsolation,
    initializeForm,
    markFormAsVisited,
    setFormState,
  } = useFormsStore()
  const windowId = useCurrentWindowId()

  // Track if we've initialized to avoid double initialization
  const hasInitializedRef = useRef(false)

  // STEP 1: Check if form exists (read-only, safe during render)
  // If it doesn't exist, return a temporary initialized state
  // This ensures isInitialized is true on first render without updating store during render
  const initializedFormState = useMemo(() => {
    if (!windowId) return null

    const store = useFormsStore.getState()
    const formState = store.forms[formId] || null

    // If form exists, return it
    if (formState) {
      return formState
    }

    // If form doesn't exist, return a temporary initialized state
    // This ensures isInitialized is true on first render
    // The actual initialization happens in useLayoutEffect
    return {
      ...defaultFormState,
      formId,
      windowId,
      isInitialized: true,
      hasBeenVisited: true,
    }
  }, [formId, windowId])

  // STEP 2: Read state using selector (reactive - will update when store changes)
  const selector = useMemo(() => createFormStateSelector(formId), [formId])
  const formState = useFormsStore(selector)

  // STEP 3: Initialize form in useLayoutEffect (runs synchronously before paint)
  // This is where the actual store update happens, avoiding React warnings
  useLayoutEffect(() => {
    if (!windowId) return
    if (hasInitializedRef.current) return

    const store = useFormsStore.getState()
    const existingForm = store.forms[formId]

    // Only initialize if form doesn't exist or isn't properly initialized
    if (
      !existingForm ||
      !existingForm.isInitialized ||
      existingForm.windowId !== windowId
    ) {
      ensureFormIsolation(formId)
      initializeForm(formId)
      markFormAsVisited(formId)
      setFormState(formId, { windowId })
      hasInitializedRef.current = true
    } else {
      hasInitializedRef.current = true
    }
  }, [
    formId,
    windowId,
    ensureFormIsolation,
    initializeForm,
    markFormAsVisited,
    setFormState,
  ])

  // STEP 4: Determine which state to return
  // Priority: selector result > initialized form from useMemo > default
  const currentFormState = formState || initializedFormState

  // Return default state if no windowId is available yet
  if (!windowId) {
    return defaultFormState
  }

  // Return existing form state if available, otherwise default
  // The selector will pick up initialized state and trigger re-render
  return currentFormState || defaultFormState
}
