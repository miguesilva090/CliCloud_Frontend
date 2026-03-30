import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | '2xl'

interface EnhancedModalProps {
  title?: string
  description?: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: ModalSize
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'sm:max-w-[500px]',
  md: 'sm:max-w-[600px]',
  lg: 'sm:max-w-[800px]',
  xl: 'sm:max-w-[1140px]',
  '2xl': 'sm:max-w-[1400px]',
  full: 'sm:max-w-[calc(100vw-40px)] sm:max-h-[calc(100vh-40px)]',
}

const heightClasses: Record<ModalSize, string> = {
  sm: 'max-h-[500px]',
  md: 'max-h-[600px]',
  lg: 'max-h-[700px]',
  xl: 'max-h-[800px]',
  '2xl': 'max-h-[900px]',
  full: 'max-h-[calc(100vh-40px)]',
}

export function EnhancedModal({
  title,
  description,
  isOpen,
  onClose,
  children,
  size = 'md',
  className,
}: EnhancedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-h-[calc(100vh-40px)] gap-0 overflow-y-auto',
          sizeClasses[size],
          heightClasses[size],
          className
        )}
      >
        <DialogHeader className='px-6 pt-6'>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className='flex h-full flex-col'>
          <div className='flex-1 overflow-y-auto px-6 py-4'>{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
