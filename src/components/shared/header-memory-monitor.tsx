import React, { useState, useEffect } from 'react'
import { AlertTriangle, Trash2, RefreshCw, Database } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFormsStore } from '@/stores/use-forms-store'
import { usePagesStore } from '@/stores/use-pages-store'
import { useMemoryManager } from '@/utils/memory-manager'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { AppLoader } from '@/components/shared/app-loader'

interface MemoryStats {
  formStates: number
  pageStates: number
  windowCache: number
  mapStates: number
  localStorageSize: number
  formMemoryUsage: { totalForms: number; totalSize: number }
  pageMemoryUsage: { totalPages: number; totalSize: number }
}

export const HeaderMemoryMonitor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const navigate = useNavigate()

  const { performCleanup, getMemoryStats, forceCleanup } = useMemoryManager()

  // CRITICAL: Don't subscribe to stores - use getState() instead to avoid re-renders
  // This prevents the "Cannot update a component while rendering a different component" warning
  // We only read stats when needed (popover opens, cleanup completes), not on every store update
  const updateStats = () => {
    const memoryStats = getMemoryStats()
    const formMemoryUsage = useFormsStore.getState().getMemoryUsage()
    const pageMemoryUsage = usePagesStore.getState().getMemoryUsage()

    setStats({
      ...memoryStats,
      formMemoryUsage,
      pageMemoryUsage,
    })
  }

  // Update stats when popover opens
  // useEffect already runs after render, so no need for setTimeout
  useEffect(() => {
    if (isOpen) {
      updateStats()
    }
  }, [isOpen])

  // Listen for delayed cleanup completion
  useEffect(() => {
    const handleMemoryCleanupComplete = () => {
      // Force a fresh stats update after delayed cleanup
      // Since we use getState(), we can read the current state directly
      updateStats()
      setIsCleaningUp(false) // Stop cleanup loading when complete
    }

    window.addEventListener(
      'memoryCleanupComplete',
      handleMemoryCleanupComplete
    )

    return () => {
      window.removeEventListener(
        'memoryCleanupComplete',
        handleMemoryCleanupComplete
      )
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    // Stats will be updated in useEffect when isOpen changes
  }

  const handleCleanup = async () => {
    setIsLoading(true)
    setIsOpen(false) // Close the popover
    try {
      await performCleanup()
      updateStats()
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceCleanup = async () => {
    setIsCleaningUp(true)
    setIsOpen(false) // Close the popover
    try {
      await forceCleanup(navigate)
      // Keep cleanup loading state active until delayed cleanup completes
      // The loading will be stopped by the event handler
    } catch (error) {
      setIsCleaningUp(false)
    }
  }

  const getTotalMemoryUsage = () => {
    if (!stats) return 0
    return (
      stats.localStorageSize +
      stats.formMemoryUsage.totalSize / 1024 + // Convert to KB
      stats.pageMemoryUsage.totalSize / 1024
    )
  }

  const getMemoryLevel = (usage: number) => {
    if (usage < 2000) return 'low' // Increased from 100KB to 2MB
    if (usage < 10000) return 'medium' // Increased from 500KB to 10MB
    return 'high' // Now triggers above 10MB
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='transition-all duration-150 hover:scale-105 active:scale-95'
          >
            <Database className='h-[1.2rem] w-[1.2rem]' />
            <span className='sr-only'>Monitor de Memória</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80' align='end'>
          <Card className='border-0 shadow-none'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm flex items-center'>
                <Database className='w-4 h-4 mr-2' />
                Monitor de Memória
              </CardTitle>
            </CardHeader>

            <CardContent className='space-y-3'>
              {!stats ? (
                <div className='text-center text-sm text-gray-500'>
                  A carregar estatísticas de memória...
                </div>
              ) : (
                <>
                  {/* Total Memory Usage */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span>Utilização Total</span>
                      <Badge
                        variant={
                          getMemoryLevel(getTotalMemoryUsage()) === 'high'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {getTotalMemoryUsage().toFixed(1)} KB
                      </Badge>
                    </div>
                    <Progress
                      value={Math.min(
                        (getTotalMemoryUsage() / 10000) * 100,
                        100
                      )}
                      className='h-2'
                    />
                  </div>

                  {/* Store Statistics */}
                  <div className='space-y-2 text-xs'>
                    <div className='flex justify-between'>
                      <span>Estados de Formulários:</span>
                      <span>
                        {stats.formStates} ({stats.formMemoryUsage.totalSize}{' '}
                        bytes)
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Estados de Páginas:</span>
                      <span>
                        {stats.pageStates} ({stats.pageMemoryUsage.totalSize}{' '}
                        bytes)
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Cache de Janelas:</span>
                      <span>{stats.windowCache} itens</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Estados de Mapas:</span>
                      <span>{stats.mapStates} itens</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>LocalStorage:</span>
                      <span>{stats.localStorageSize} KB</span>
                    </div>
                  </div>

                  {/* Memory Level Alert */}
                  {getMemoryLevel(getTotalMemoryUsage()) === 'high' && (
                    <Alert variant='destructive' className='text-xs'>
                      <AlertTriangle className='h-3 w-3' />
                      <AlertDescription>
                        Detetada utilização elevada de memória. Considere limpar
                        dados não utilizados.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  <div className='flex gap-2 pt-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={handleCleanup}
                      disabled={isLoading}
                      className='flex-1'
                    >
                      <RefreshCw
                        className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`}
                      />
                      Limpar
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={handleForceCleanup}
                      disabled={isLoading}
                      className='flex-1'
                    >
                      <Trash2 className='w-3 h-3 mr-1' />
                      Limpar Tudo
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      <AppLoader
        isLoading={isCleaningUp}
        title='Limpando dados...'
        description='Removendo todos os dados e janelas'
        icon='trash'
      />
    </>
  )
}
