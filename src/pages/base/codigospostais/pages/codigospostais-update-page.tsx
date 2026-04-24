import { ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { handleWindowClose, navigateManagedWindow } from '@/utils/window-utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { PageContainer } from '@/components/shared/page-container'
import { PageHead } from '@/components/shared/page-head'
import { useGetCodigoPostal } from '../queries/codigospostais-queries'
import { CodigoPostalUpdateForm } from '../components/codigospostais-forms/codigopostal-update-form'

export function CodigosPostaisUpdatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { removeFormState } = useFormsStore()
  const { findWindowByPathAndInstanceId, removeWindow } = useWindowsStore()
  const searchParams = new URLSearchParams(location.search)
  const codigoPostalId = searchParams.get('codigoPostalId')
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = instanceId

  const { data: codigoPostalData, isLoading } = useGetCodigoPostal(
    codigoPostalId || ''
  )

  const handleClose = () => {
    // Remove form data from the form store
    removeFormState(formId)

    // Find the current window and remove it
    const currentWindow = findWindowByPathAndInstanceId(
      location.pathname,
      instanceId
    )

    if (currentWindow) {
      handleWindowClose(currentWindow.id, navigate, removeWindow)
    }
  }

  // If no codigoPostalId is provided, redirect to codigospostais page
  if (!codigoPostalId) {
    navigateManagedWindow(
      navigate,
      '/utilitarios/tabelas/geograficas/codigospostais'
    )
    return null
  }

  const currentCodigoPostal = codigoPostalData

  return (
    <PageContainer>
      <PageHead title='Atualizar Código Postal | Luma' />

      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={handleClose}
          className='h-8 w-8'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <Breadcrumbs
          items={[
            {
              title: 'Geográficas',
              link: '/utilitarios/tabelas/geograficas',
            },
            {
              title: 'Códigos Postais',
              link: '/utilitarios/tabelas/geograficas/codigospostais',
            },
            {
              title: 'Atualizar',
              link: `/utilitarios/tabelas/geograficas/codigospostais/update?codigoPostalId=${codigoPostalId}&instanceId=${instanceId}`,
            },
          ]}
        />
      </div>

      <div className='rounded-lg border bg-card'>
        <div className='border-b px-6 py-4'>
          <h2 className='text-base font-medium'>Atualizar Código Postal</h2>
        </div>
        <div className='p-6'>
          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : currentCodigoPostal ? (
            <CodigoPostalUpdateForm
              modalClose={handleClose}
              codigoPostalId={codigoPostalId}
              initialData={{
                codigo: currentCodigoPostal.codigo || '',
                localidade: currentCodigoPostal.localidade || '',
              }}
            />
          ) : (
            <div className='text-center text-gray-500'>
              Código Postal não encontrado
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
