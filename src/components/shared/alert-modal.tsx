import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface TAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title?: string
  description?: string
}

export const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = 'Tem certeza?',
  description = 'Tem certeza que deseja continuar?',
}: TAlertModalProps) => {
  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          Cancelar
        </Button>
        <Button
          disabled={loading}
          variant='destructive'
          onClick={onConfirm}
          className='min-w-[100px]'
        >
          {loading ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Aguarde...
            </div>
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
    </Modal>
  )
}
