import { useEffect, useRef } from 'react'

// ============================================================================
// FORM UPDATE INITIALIZATION HOOK - Reusable form update initialization logic
// ============================================================================

interface FormUpdateInitializationConfig<T> {
  // Form identification
  formId: string
  windowId: string

  // Form state management
  hasBeenVisited: boolean
  hasFormData: (formId: string) => boolean
  resetFormState: (formId: string) => void
  setFormState: (formId: string, state: any) => void
  initializeForm: (formId: string) => void

  // API data
  apiData?: T

  // Window management
  updateWindowState: (windowId: string, updates: any) => void
  updateUpdateWindowTitle: (
    windowId: string,
    nome: string,
    updateWindowState: any
  ) => void
}

/**
 * Custom hook that handles the common form update initialization pattern.
 * This hook extracts the repetitive first-render setup logic that was duplicated
 * across all update forms.
 *
 * The pattern handles:
 * - First render detection using useRef
 * - Form state reset if form hasn't been visited or has no data
 * - Initial form state setup with proper window association
 * - Window title updates for update forms
 *
 * @param config Configuration object containing all necessary parameters
 */
export const useFormUpdateInitialization = <T extends { nome: string }>({
  formId,
  windowId,
  hasBeenVisited,
  hasFormData,
  resetFormState,
  setFormState,
  initializeForm,
  apiData,
  updateWindowState,
  updateUpdateWindowTitle,
}: FormUpdateInitializationConfig<T>) => {
  // Use a ref to track if this is the first render - prevents unnecessary re-initialization
  const isFirstRender = useRef(true)

  // Initialize form state on first render - ensures proper form state setup
  useEffect(() => {
    if (isFirstRender.current) {
      // If this form has never been visited before AND doesn't have data, reset it
      if (!hasBeenVisited && !hasFormData(formId)) {
        resetFormState(formId)
        // CRITICAL: Re-initialize the form after reset to ensure isInitialized is true
        // This allows the data loader to run properly
        initializeForm(formId)
        // Set initial form data with windowId for proper window-form association
        setFormState(formId, {
          formData: {},
          isDirty: false,
          isValid: false,
          isSubmitting: false,
          hasBeenModified: false,
          windowId: windowId,
        })
      }
      isFirstRender.current = false
    }
  }, [
    formId,
    windowId,
    hasBeenVisited,
    resetFormState,
    initializeForm,
    hasFormData,
    setFormState,
  ])

  // Update window title when API data is available
  // BUT only if there's no saved form data (unsaved changes should be preserved)
  useEffect(() => {
    if (
      apiData?.nome &&
      windowId &&
      updateUpdateWindowTitle &&
      updateWindowState &&
      !hasFormData(formId) // Only update title if no unsaved changes exist
    ) {
      updateUpdateWindowTitle(windowId, apiData.nome, updateWindowState)
    }
  }, [
    apiData?.nome,
    windowId,
    updateUpdateWindowTitle,
    updateWindowState,
    hasFormData,
    formId,
  ])

  return {
    isFirstRender: isFirstRender.current,
  }
}
