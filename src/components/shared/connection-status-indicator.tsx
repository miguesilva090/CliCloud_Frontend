import React, { useEffect, useState, useRef } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { useConnectionStatusStore } from '@/stores/connection-status-store'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const ConnectionStatusIndicator: React.FC = () => {
  const { isClientApiDown, isLicensesApiDown } = useConnectionStatusStore()
  const [showReconnected, setShowReconnected] = useState(false)
  const previousClientDown = useRef(isClientApiDown)
  const previousLicensesDown = useRef(isLicensesApiDown)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detect when connection is restored (transitions from down to up)
  useEffect(() => {
    const wasClientDown = previousClientDown.current
    const wasLicensesDown = previousLicensesDown.current
    const isNowDown = isClientApiDown || isLicensesApiDown
    const wasDown = wasClientDown || wasLicensesDown

    // If connection goes down, clear reconnected indicator
    if (isNowDown) {
      setShowReconnected(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
    // If connection was down and is now up, show reconnected indicator
    else if (wasDown && !isNowDown) {
      setShowReconnected(true)

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Hide after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setShowReconnected(false)
      }, 3000)
    }

    // Update previous values
    previousClientDown.current = isClientApiDown
    previousLicensesDown.current = isLicensesApiDown

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isClientApiDown, isLicensesApiDown])

  const getStatusMessage = () => {
    if (isClientApiDown && isLicensesApiDown) {
      return 'API do Cliente e API de Licenças indisponíveis'
    }
    if (isClientApiDown) {
      return 'API do Cliente indisponível'
    }
    if (isLicensesApiDown) {
      return 'API de Licenças indisponível'
    }
    return ''
  }

  const isDown = isClientApiDown || isLicensesApiDown

  // Show disconnected indicator (red) when connection is down - prioritize this
  if (isDown) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center justify-center h-9 w-9 rounded-md transition-all duration-200',
                'bg-destructive/10 hover:bg-destructive/20',
                'border border-destructive/20',
                'animate-pulse'
              )}
            >
              <WifiOff className='h-4 w-4 text-destructive' />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side='bottom'
            className='max-w-xs bg-background text-foreground border border-border shadow-md'
          >
            <div className='space-y-1'>
              <p className='font-semibold text-sm'>Conexão Interrompida</p>
              <p className='text-xs text-muted-foreground'>
                {getStatusMessage()}
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Verifique se o servidor está em execução
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Show reconnected indicator (green) when connection is restored
  if (showReconnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center justify-center h-9 w-9 rounded-md transition-all duration-200',
                'bg-green-500/10 hover:bg-green-500/20',
                'border border-green-500/30',
                'animate-pulse'
              )}
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              <Wifi className='h-4 w-4 text-green-600 dark:text-green-400' />
            </div>
          </TooltipTrigger>
          <TooltipContent
            side='bottom'
            className='max-w-xs bg-background text-foreground border border-border shadow-md'
          >
            <div className='space-y-1'>
              <p className='font-semibold text-sm text-green-600 dark:text-green-400'>
                Conexão Restaurada
              </p>
              <p className='text-xs text-muted-foreground'>
                A conexão com o servidor foi restaurada com sucesso
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Don't show anything when connection is up and reconnected indicator has faded
  return null
}
