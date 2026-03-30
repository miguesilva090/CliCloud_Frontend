import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icons } from '@/components/ui/icons'

interface PreparationStep {
  label: string
  status: 'pending' | 'processing' | 'completed' | 'error'
}

/**
 * Professional app preparation component that handles post-update setup.
 * Shows a smooth, professional loading experience while preparing the app.
 */
export function AppPreparation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isPreparing, setIsPreparing] = useState(false)
  const [steps, setSteps] = useState<PreparationStep[]>([
    { label: 'A limpar cache...', status: 'pending' },
    { label: 'A verificar atualizações...', status: 'pending' },
    { label: 'A preparar aplicação...', status: 'pending' },
  ])

  const updated = searchParams.get('updated')
  const cacheBust = searchParams.get('_cb')
  const hasProcessedRef = useRef(false)

  const updateStep = (index: number, status: PreparationStep['status']) => {
    setSteps((prev) => {
      const newSteps = [...prev]
      newSteps[index] = { ...newSteps[index], status }
      return newSteps
    })
  }

  useEffect(() => {
    // If we have cache-busting parameter but no updated parameter,
    // it means we just reloaded and the app is ready - clean up URL
    if (cacheBust && !updated) {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('_cb')
      const cleanUrl = newSearchParams.toString()
        ? `/login?${newSearchParams.toString()}`
        : '/login'
      navigate(cleanUrl, { replace: true })
      return
    }

    // Only process if updated=true and hasn't been processed yet
    if (updated === 'true' && !hasProcessedRef.current) {
      hasProcessedRef.current = true
      setIsPreparing(true)

      const prepareApp = async () => {
        try {
          // Step 1: Clear Cache API
          updateStep(0, 'processing')
          if ('caches' in window) {
            try {
              const cacheNames = await caches.keys()
              await Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
              )
            } catch (error) {
              console.warn('[AppPreparation] Cache clearing failed:', error)
              // Continue anyway - cache clearing is best effort
            }
          }
          // Small delay for visual feedback
          await new Promise((resolve) => setTimeout(resolve, 300))
          updateStep(0, 'completed')

          // Step 2: Verify app is ready by checking if we can fetch fresh HTML
          updateStep(1, 'processing')
          try {
            // Fetch index.html with cache-busting to ensure we get fresh version
            const cacheBuster = `?_cb=${Date.now()}`
            const response = await fetch(
              `${window.location.origin}${cacheBuster}`,
              {
                method: 'HEAD',
                cache: 'no-store',
              }
            )
            if (!response.ok) {
              throw new Error('Failed to verify app readiness')
            }
          } catch (error) {
            console.warn('[AppPreparation] App verification failed:', error)
            // Continue anyway - verification is best effort
          }
          await new Promise((resolve) => setTimeout(resolve, 300))
          updateStep(1, 'completed')

          // Step 3: Final preparation
          updateStep(2, 'processing')
          // Small delay to show the step
          await new Promise((resolve) => setTimeout(resolve, 400))
          updateStep(2, 'completed')

          // All steps completed - wait a moment for visual feedback
          await new Promise((resolve) => setTimeout(resolve, 300))

          // Reload page with cache-busting to ensure fresh HTML/JS are loaded
          // This is necessary because the old JS bundle might still reference old chunks
          const newSearchParams = new URLSearchParams(searchParams.toString())
          newSearchParams.delete('updated')
          newSearchParams.set('_cb', Date.now().toString())
          const reloadUrl = `/login?${newSearchParams.toString()}`

          // Reload with cache-busting - this will load fresh HTML that references new chunks
          window.location.replace(reloadUrl)
        } catch (error) {
          console.error('[AppPreparation] Error during preparation:', error)
          // Even on error, try to redirect to login
          navigate('/login', { replace: true })
        } finally {
          setIsPreparing(false)
        }
      }

      prepareApp()
    }
  }, [updated, cacheBust, searchParams, navigate, updateStep])

  if (!isPreparing) {
    return null
  }

  return (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-8 max-w-md w-full px-6'>
        {/* Logo/Icon */}
        <div className='relative'>
          <div className='w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20'>
            <Icons.settings className='h-10 w-10 text-primary animate-spin' />
          </div>
          <div className='absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping'></div>
        </div>

        {/* Title */}
        <div className='text-center space-y-2'>
          <h2 className='text-2xl font-semibold text-foreground'>
            A preparar aplicação
          </h2>
          <p className='text-sm text-muted-foreground'>
            A sua aplicação foi atualizada com sucesso
          </p>
        </div>

        {/* Steps */}
        <div className='w-full space-y-4'>
          {steps.map((step, index) => (
            <div
              key={index}
              className='flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all'
            >
              {/* Status Icon */}
              <div className='flex-shrink-0'>
                {step.status === 'completed' && (
                  <Icons.check className='h-5 w-5 text-green-500' />
                )}
                {step.status === 'processing' && (
                  <Icons.spinner className='h-5 w-5 text-primary animate-spin' />
                )}
                {step.status === 'pending' && (
                  <div className='h-5 w-5 rounded-full border-2 border-muted-foreground/30' />
                )}
                {step.status === 'error' && (
                  <Icons.close className='h-5 w-5 text-destructive' />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-sm flex-1 ${
                  step.status === 'completed'
                    ? 'text-foreground'
                    : step.status === 'processing'
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className='w-full'>
          <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
            <div
              className='h-full bg-primary transition-all duration-500 ease-out'
              style={{
                width: `${
                  (steps.filter((s) => s.status === 'completed').length /
                    steps.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
