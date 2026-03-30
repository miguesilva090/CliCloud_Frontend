import { useEffect, useRef } from 'react'
import { useFormsStore } from '@/stores/use-forms-store'

// ============================================================================
// FORM INITIALIZATION HOOK - Reusable form initialization logic
// ============================================================================

interface FormInitializationConfig {
  // Form identification
  formId: string
  effectiveWindowId: string

  // Form state management
  hasBeenVisited: boolean
  hasFormData: (formId: string) => boolean
  resetFormState: (formId: string) => void
  setFormState: (formId: string, state: any) => void

  // Optional initial form data (for update forms or forms with pre-selected values)
  initialFormData?: any

  // Optional initial validation state (for update forms, usually true)
  initialIsValid?: boolean

  // Optional flag to enable/disable the hook (defaults to true)
  enabled?: boolean
}

/**
 * Custom hook that handles the common form initialization pattern.
 * This hook extracts the repetitive first-render setup logic that was duplicated
 * across all create and update forms.
 *
 * The pattern handles:
 * - First render detection using useRef
 * - Form state reset if form hasn't been visited or has no data
 * - Initial form state setup with proper window association
 * - Different behavior for create vs update forms
 *
 * @param config Configuration object containing all necessary parameters
 */
export const useFormInitialization = ({
  formId,
  effectiveWindowId,
  hasBeenVisited,
  hasFormData,
  resetFormState,
  setFormState,
  initialFormData = {},
  initialIsValid = false,
  enabled = true,
}: FormInitializationConfig) => {
  // Use a ref to track if this is the first render - prevents unnecessary re-initialization
  const isFirstRender = useRef(true)

  // Initialize form state on first render - ensures proper form state setup
  useEffect(() => {
    if (!enabled) return // Skip if disabled

    if (isFirstRender.current) {
      // CRITICAL: Check store directly to get current state (not stale props)
      // useFormState's useLayoutEffect should have run by now (it runs before useEffect)
      const store = useFormsStore.getState()
      const formInStore = store.forms[formId]
      const actuallyHasBeenVisited =
        formInStore?.hasBeenVisited ?? hasBeenVisited
      const actuallyHasFormData = hasFormData(formId)

      // If this form has never been visited before AND doesn't have data, reset it
      if (!actuallyHasBeenVisited && !actuallyHasFormData) {
        resetFormState(formId)
        // Set initial form data with windowId for proper window-form association
        setFormState(formId, {
          formData: initialFormData,
          isDirty: false,
          isValid: initialIsValid,
          isSubmitting: false,
          hasBeenModified: false,
          windowId: effectiveWindowId,
        })
      }
      isFirstRender.current = false
    }
  }, [
    formId,
    effectiveWindowId,
    hasBeenVisited,
    hasFormData,
    resetFormState,
    setFormState,
    initialFormData,
    initialIsValid,
    enabled,
  ])

  return {
    isFirstRender: isFirstRender.current,
  }
}
