import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { PageHead } from '@/components/shared/page-head'
import { FechoDiarioModal } from '../modals/fecho-diario-modal'

export function FechoDiarioPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  return (
    <>
      <PageHead title='Fecho Diário | CliCloud' />
      <FechoDiarioModal
        open
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeWindowTab()
          }
        }}
      />
    </>
  )
}
