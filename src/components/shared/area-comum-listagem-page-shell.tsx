import type { ReactNode } from 'react'
import { AreaComumDashboardCard } from '@/components/shared/area-comum-dashboard-card'
import { ListagemPageHeaderProvider } from '@/contexts/listagem-page-header-context'

export type AreaComumListagemPageShellProps = {
  title: ReactNode
  /** Conteúdo extra à direita no cabeçalho (opcional). */
  headerTrailing?: ReactNode
  children: ReactNode
  showBackButton?: boolean
  onBack?: () => void
  cardClassName?: string
}

/** Padding horizontal simétrico para alinhar com as margens do viewport (evitar desvio visual). */
const listagemContentPadding =
  'px-3 pb-5 pt-3 sm:px-4 sm:pb-6 sm:pt-4 md:px-5'

/**
 * Listagens da Área Comum: título + seta na mesma linha que «Procurar» e botões (via DataTable).
 */
export function AreaComumListagemPageShell({
  title,
  headerTrailing,
  children,
  showBackButton = true,
  onBack,
  cardClassName,
}: AreaComumListagemPageShellProps) {
  return (
    <ListagemPageHeaderProvider
      title={title}
      showBackButton={showBackButton}
      onBack={onBack}
      headerTrailing={headerTrailing}
    >
      <AreaComumDashboardCard
        omitHeader
        cardClassName={cardClassName}
        contentClassName={listagemContentPadding}
      >
        {children}
      </AreaComumDashboardCard>
    </ListagemPageHeaderProvider>
  )
}
