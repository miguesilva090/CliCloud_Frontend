import { useEffect, useState } from 'react'
import { loadAppVersion } from '@/lib/app-version'
import { VersionService } from '@/lib/services/base/version-service'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Icons } from '@/components/ui/icons'

interface VersionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VersionModal({ open, onOpenChange }: VersionModalProps) {
  const [appVersion, setAppVersion] = useState<string>('')
  const [apiVersion, setApiVersion] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const fetchVersions = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get app version from version.json
        const appVer = await loadAppVersion()
        setAppVersion(appVer)

        // Get API version from API endpoint
        const versionService = VersionService('version')
        const response = await versionService.getVersion()

        if (response.info?.status === 0 && response.info?.data?.apiVersion) {
          setApiVersion(response.info.data.apiVersion)
        } else {
          const errorMessage =
            response.info?.messages?.$?.[0] ||
            'Não foi possível obter a versão da API'
          setError(errorMessage)
        }
      } catch (err) {
        console.error('Erro ao obter versões:', err)
        setError('Erro ao carregar informações de versão')
        // Still try to get app version even if API fails
        try {
          const appVer = await loadAppVersion()
          setAppVersion(appVer)
        } catch (appErr) {
          console.error('Erro ao obter versão da aplicação:', appErr)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchVersions()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-md bg-primary/10'>
              <Icons.help className='h-5 w-5 text-primary' />
            </div>
            <div>
              <DialogTitle>Informações de Versão</DialogTitle>
              <DialogDescription>
                Versões do Frontend e da API
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='mt-4'>
          {loading ? (
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                  <span className='ml-3 text-muted-foreground'>
                    A carregar informações...
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className='border-destructive/50'>
              <CardHeader>
                <CardTitle className='text-destructive'>Erro</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-4'>
              <Card className='border-primary/20'>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <Icons.laptop className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <CardTitle>Versão do Frontend</CardTitle>
                      <CardDescription>
                        Versão atual do servidor
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-2xl font-bold text-primary'>
                      {appVersion || 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-primary/20'>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <Icons.application className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <CardTitle>Versão da API</CardTitle>
                      <CardDescription>
                        Versão atual do servidor
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-2xl font-bold text-primary'>
                      {apiVersion || 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
