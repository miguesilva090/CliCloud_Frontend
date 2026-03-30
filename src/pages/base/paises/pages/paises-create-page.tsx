import { ArrowLeft } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFormsStore } from '@/stores/use-forms-store'
import { useWindowsStore } from '@/stores/use-windows-store'
import { handleWindowClose } from '@/utils/window-utils'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { PageContainer } from '@/components/shared/page-container'
import { PageHead } from '@/components/shared/page-head'
import PaisCreateForm from '../components/paises-forms/pais-create-form'

const PAISES_BASE_PATH_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas/paises'
const PAISES_BASE_PATH_UTILITARIOS = '/utilitarios/tabelas/geograficas/paises'
const GEOGRAFICAS_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas'
const GEOGRAFICAS_UTILITARIOS = '/utilitarios/tabelas/geograficas'

export function PaisesCreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { removeFormState } = useFormsStore()
  const { windows, removeWindow } = useWindowsStore()
  const searchParams = new URLSearchParams(location.search)
  const instanceId = searchParams.get('instanceId') || 'default'
  const formId = instanceId
  const isAreaComum = location.pathname.startsWith(PAISES_BASE_PATH_AREACOMUM)
  const basePath = isAreaComum ? PAISES_BASE_PATH_AREACOMUM : PAISES_BASE_PATH_UTILITARIOS
  const geograficasPath = isAreaComum ? GEOGRAFICAS_AREACOMUM : GEOGRAFICAS_UTILITARIOS

  const handleClose = () => {
    // Remove form data from the form store
    removeFormState(formId)

    // Find the current window and remove it
    const currentWindow = windows.find(
      (w) => w.path === location.pathname && w.instanceId === instanceId
    )

    if (currentWindow) {
      handleWindowClose(currentWindow.id, navigate, removeWindow)
    }
  }

  return (
    <PageContainer>
      <PageHead title='Criar País | Luma' />

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
              title: 'Criar',
              link: `${basePath}/create?instanceId=${instanceId}`,
            },
          ]}
        />
      </div>

      <div className='rounded-lg border bg-card'>
        <div className='border-b px-6 py-4'>
          <h2 className='text-base font-medium'>Criar País</h2>
        </div>
        <div className='p-6'>
          <PaisCreateForm modalClose={handleClose} />
        </div>
      </div>
    </PageContainer>
  )
}
