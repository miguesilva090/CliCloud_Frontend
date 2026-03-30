import { toast as baseToast } from '@/components/ui/use-toast'

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning'

interface ToastOptions {
  title?: string
  description: string
  variant?: ToastVariant
}

export const toast = {
  success: (description: string, title: string = 'Sucesso') => {
    baseToast({
      title,
      description,
      variant: 'success',
      // Garantir que o toast de sucesso desaparece automaticamente
      duration: 3000,
    })
  },

  error: (
    description: string | string[],
    title: string = 'Ocorreu um erro'
  ) => {
    const errorMessage = Array.isArray(description)
      ? description.join(', ')
      : description

    baseToast({
      title,
      description: errorMessage,
      variant: 'destructive',
      // Validações de formulário: desaparecer mais rápido
      duration: 3000,
    })
  },

  warning: (description: string, title: string = 'Atenção') => {
    baseToast({
      title,
      description,
      variant: 'warning',
      duration: 3000,
    })
  },

  info: (description: string, title: string = 'Informação') => {
    baseToast({
      title,
      description,
      variant: 'default',
      duration: 3000,
    })
  },

  partialSuccess: (description: string, title: string = 'Sucesso Parcial') => {
    baseToast({
      title,
      description,
      variant: 'warning',
      duration: 3000,
    })
  },

  custom: ({ title, description, variant = 'default' }: ToastOptions) => {
    baseToast({
      title,
      description,
      variant,
      duration: 3000,
    })
  },
}
