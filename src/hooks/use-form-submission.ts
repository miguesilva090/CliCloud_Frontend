import { useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { handleApiError } from '@/utils/error-handlers'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { setEntityReturnDataWithToastSuppression } from '@/utils/window-utils'

// ============================================================================
// FORM SUBMISSION HOOK - Reusable form submission logic for create forms
// ============================================================================

interface FormSubmissionConfig<T> {
  // Form identification
  formId: string
  effectiveWindowId: string
  instanceId: string
  parentWindowIdFromStorage?: string | null

  // API call
  mutation: {
    mutateAsync: (values: T) => Promise<any>
    isPending: boolean
  }

  // Success messages
  successMessage: string
  errorMessage: string
  warningMessage: string

  // Entity information for return data
  entityType: string // e.g., 'freguesia', 'concelho', 'distrito'
  identifierField?: string // Field to use as identifier (defaults to 'nome')

  // Callbacks and window management
  onSuccess?: (newEntity: { id: string; [key: string]: any }) => void
  modalClose: () => void
  shouldCloseWindow?: boolean

  // Additional value preparation (for selected IDs from autocomplete)
  prepareFinalValues?: (values: T) => T
}

/**
 * Custom hook that handles the common form submission pattern for create forms.
 * This hook extracts the repetitive submission logic that was duplicated across
 * freguesia, concelho, and distrito create forms.
 *
 * @param config Configuration object containing all necessary parameters
 * @returns Object with onSubmit function and isSubmitting state
 */
export const useFormSubmission = <T extends Record<string, any>>({
  formId,
  effectiveWindowId,
  instanceId,
  parentWindowIdFromStorage,
  mutation,
  successMessage,
  errorMessage,
  warningMessage,
  entityType,
  identifierField = 'nome',
  onSuccess,
  modalClose,
  shouldCloseWindow = true,
  prepareFinalValues,
}: FormSubmissionConfig<T>) => {
  const { updateFormState } = useFormsStore()
  const { removeWindow, setWindowReturnData } = useWindowsStore()

  const onSubmit = async (values: T) => {
    console.log(`${entityType} Form Submit Values:`, values)

    try {
      // Prepare final values (e.g., merge selected IDs from autocomplete)
      const finalValues = prepareFinalValues
        ? prepareFinalValues(values)
        : values
      console.log('Final Submit Values:', finalValues)

      // Update form state to show submitting status
      updateFormState(formId, (state) => ({
        ...state,
        isSubmitting: true,
      }))

      // Call the API to create the entity
      const response = await mutation.mutateAsync(finalValues)

      console.log(`${entityType} Create Response:`, response)

      // Handle the API response and show appropriate messages
      const result = handleApiResponse(
        response,
        successMessage,
        errorMessage,
        warningMessage
      )

      if (result.success) {
        // Set return data for parent window if this window was opened from another window
        // This allows the parent form to automatically select the newly created entity
        console.log('[FORM-SUBMISSION] Setting return data:', {
          effectiveWindowId,
          entityType,
          parentWindowIdFromStorage,
          instanceId,
          entityData: { id: response.info.data, nome: values[identifierField] },
        })
        if (effectiveWindowId) {
          setEntityReturnDataWithToastSuppression(
            effectiveWindowId,
            { id: response.info.data, nome: values[identifierField] },
            entityType,
            setWindowReturnData,
            parentWindowIdFromStorage || undefined,
            instanceId
          )
        }

        // Call the onSuccess callback if provided
        if (onSuccess) {
          console.log('Calling onSuccess with:', {
            id: response.info.data,
            [identifierField]: values[identifierField],
          })
          onSuccess({
            id: response.info.data,
            [identifierField]: values[identifierField],
          })
        }

        // Only close the window if shouldCloseWindow is true
        if (effectiveWindowId && shouldCloseWindow) {
          removeWindow(effectiveWindowId)
        }
        // Always call modalClose to close the modal
        modalClose()
      }
    } catch (error) {
      // Handle any errors that occur during submission
      toast.error(handleApiError(error, errorMessage))
    } finally {
      // Always reset the submitting state, regardless of success or failure
      updateFormState(formId, (state) => ({
        ...state,
        isSubmitting: false,
      }))
    }
  }

  return {
    onSubmit,
    isSubmitting: mutation.isPending,
  }
}
