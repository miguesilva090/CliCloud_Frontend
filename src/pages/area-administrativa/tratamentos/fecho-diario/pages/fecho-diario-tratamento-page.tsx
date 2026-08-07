import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'
import { PageHead } from '@/components/shared/page-head'
import { FechoDiarioTratamentoModal } from '../modals/fecho-diario-tratamento-modal'

export function FechoDiarioTratamentoPage() {
  const closeWindowTab = useCloseCurrentWindowLikeTabBar()

  return (
    <>
      <PageHead title='Fecho Diário — Tratamentos | CliCloud' />
      <FechoDiarioTratamentoModal
        open
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeWindowTab()
        }}
      />
    </>
  )
}