import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type CredenciaisSnsOperacaoTipo = 'verbete' | 'relacao-lotes'

const TITLES: Record<CredenciaisSnsOperacaoTipo, string> = {
  verbete: 'Verbete',
  'relacao-lotes': 'Relação de Lotes',
}

const DESCRIPTIONS: Record<CredenciaisSnsOperacaoTipo, string> = {
  verbete:
    'Emissão de verbete (legado CredenciaisSnsLst — Verbete). Integração em curso.',
  'relacao-lotes':
    'Relação de lotes para faturação (legado CredenciaisSnsLst — Relação Lotes). Integração em curso.',
}

type CredenciaisSnsOperacoesModalProps = {
  open: boolean
  tipo: CredenciaisSnsOperacaoTipo | null
  onClose: () => void
}

export function CredenciaisSnsOperacoesModal({
  open,
  tipo,
  onClose,
}: CredenciaisSnsOperacoesModalProps) {
  if (!tipo) return null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{TITLES[tipo]}</DialogTitle>
          <DialogDescription>{DESCRIPTIONS[tipo]}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
