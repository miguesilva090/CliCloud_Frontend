import { useGetPais } from '@/pages/base/paises/queries/paises-queries'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { handleWindowClose } from '@/utils/window-utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { PageContainer } from '@/components/shared/page-container'
import { PageHead } from '@/components/shared/page-head'
import { PaisUpdateForm } from '../components/paises-forms/pais-update-form'

const PAISES_BASE_PATH_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas/paises'
const PAISES_BASE_PATH_UTILITARIOS = '/utilitarios/tabelas/geograficas/paises'
const GEOGRAFICAS_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas'
const GEOGRAFICAS_UTILITARIOS = '/utilitarios/tabelas/geograficas'

export function PaisesUpdatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { removeFormState } = useFormsStore()
  const { findWindowByPathAndInstanceId, removeWindow } = useWindowsStore()
  const searchParams = new URLSearchParams(location.search)
  const paisId = searchParams.get('paisId')
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = instanceId
  const isAreaComum = location.pathname.startsWith(PAISES_BASE_PATH_AREACOMUM)
  const basePath = isAreaComum ? PAISES_BASE_PATH_AREACOMUM : PAISES_BASE_PATH_UTILITARIOS
  const geograficasPath = isAreaComum ? GEOGRAFICAS_AREACOMUM : GEOGRAFICAS_UTILITARIOS

  const { data: paisData, isLoading } = useGetPais(paisId || '')

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

  // If no paisId is provided, redirect to paises page
  if (!paisId) {
    navigate('/utilitarios/tabelas/geograficas/paises')
    return null
  }

  const currentPais = paisData?.info?.data

  return (
    <PageContainer>
      <PageHead title='Atualizar País | Luma' />

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
            { title: 'Geográficas', link: geograficasPath },
            { title: 'Países', link: basePath },
            {
              title: 'Atualizar',
              link: `${basePath}/update?paisId=${paisId}&instanceId=${instanceId}`,
            },
          ]}
        />
      </div>

      <div className='rounded-lg border bg-card'>
        <div className='border-b px-6 py-4'>
          <h2 className='text-base font-medium'>Atualizar País</h2>
        </div>
        <div className='p-6'>
          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : currentPais ? (
            <PaisUpdateForm
              paisId={paisId}
              modalClose={handleClose}
              initialData={{
                nome: currentPais.nome || '',
                codigo: currentPais.codigo || '',
                prefixo: currentPais.prefixo || '',
              }}
            />
          ) : (
            <div className='text-center text-gray-500'>País não encontrado</div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
