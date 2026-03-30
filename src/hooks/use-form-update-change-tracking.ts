import { useEffect } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'

// ============================================================================
// FORM UPDATE CHANGE TRACKING HOOK - Reusable update form change tracking logic
// ============================================================================

interface FormUpdateChangeTrackingConfig<T extends FieldValues> {
  // Form identification and state
  formId: string
  effectiveWindowId: string

  // Form instance
  form: UseFormReturn<T>

  // Form state management
  setFormState: (formId: string, state: any) => void

  // Original data for change detection
  normalizedOriginalData: any

  // Window management
  setWindowHasFormData: (windowId: string, hasData: boolean) => void
  updateWindowFormData: (
    windowId: string,
    hasChanges: boolean,
    setWindowHasFormData: (windowId: string, hasData: boolean) => void
  ) => void
  updateUpdateWindowTitle: (
    windowId: string,
    nome: string,
    updateWindowState: (windowId: string, updates: any) => void
  ) => void
  updateWindowState: (windowId: string, updates: any) => void

  // Change detection utility
  detectUpdateFormChanges: (value: any, originalData: any) => boolean

  // Optional callback to get display name for window title
  // If provided, this will be used to determine the window title
  getDisplayName?: (value: T) => string

  // Optional flag to enable/disable the hook (defaults to true)
  enabled?: boolean
}

/**
 * Custom hook that handles the common update form change tracking pattern.
 * This hook extracts the repetitive change tracking logic that was duplicated
 * across all update forms.
 *
 * The pattern handles:
 * - Watching form changes using form.watch()
 * - Detecting changes by comparing with normalized original data from API
 * - Updating form state (isDirty, isValid, isSubmitting, hasBeenModified)
 * - Updating window state (hasFormData flag, window title)
 * - Proper cleanup of subscriptions
 *
 * @param config Configuration object containing all necessary parameters
 */
export const useFormUpdateChangeTracking = <T extends FieldValues>({
  formId,
  effectiveWindowId,
  form,
  setFormState,
  normalizedOriginalData,
  setWindowHasFormData,
  updateWindowFormData,
  updateUpdateWindowTitle,
  updateWindowState,
  detectUpdateFormChanges,
  getDisplayName,
  enabled = true,
}: FormUpdateChangeTrackingConfig<T>) => {
  // Save form data when it changes - this is the core of form persistence
  useEffect(() => {
    if (!enabled) return // Skip if disabled

    const subscription = form.watch((value) => {
      if (value) {
        // Use proper change detection by comparing with normalized original values
        const hasChanges = detectUpdateFormChanges(
          value,
          normalizedOriginalData
        )

        // Update the form store with current form state
        setFormState(formId, {
          formData: value as T,
          isDirty: hasChanges, // Whether form has unsaved changes
          isValid: form.formState.isValid, // Whether form passes validation
          isSubmitting: form.formState.isSubmitting, // Whether form is currently submitting
          hasBeenModified: hasChanges, // Whether form has been modified
        })

        // Update window hasFormData flag
        updateWindowFormData(
          effectiveWindowId,
          hasChanges,
          setWindowHasFormData
        )

        // Update window title using display name callback
        if (getDisplayName) {
          const displayName = getDisplayName(value as T)
          updateUpdateWindowTitle(
            effectiveWindowId,
            displayName,
            updateWindowState
          )
        }
      }
    })

    return () => subscription.unsubscribe() // Cleanup subscription on unmount
  }, [
    formId,
    effectiveWindowId,
    normalizedOriginalData,
    detectUpdateFormChanges,
    getDisplayName,
    enabled,
    // Note: We intentionally exclude 'form' and function references from dependencies
    // to prevent infinite loops. The form.watch subscription will handle updates.
  ])
}
