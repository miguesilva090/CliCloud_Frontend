import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/ui/icons'
import { toast } from '@/utils/toast-utils'

type Props = {
  readOnly: boolean
  onDescontos?: () => void
  onGuardar?: () => void
  onVoltar?: () => void
  isSubmitting?: boolean
}

function emBreve(label: string) {
  toast.info(`${label} — disponível em breve (legado).`)
}

export function DocumentoEditorToolbar({
  readOnly,
  onDescontos,
  onGuardar,
  onVoltar,
  isSubmitting,
}: Props) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-2 border-b pb-3'>
      <div className='flex flex-wrap items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          title='Ajuda'
          onClick={() =>
            toast.info(
              'Editor de faturação alinhado ao legado TfaturaEdt. Use Movimentos do Utente para importar admissões.',
            )
          }
        >
          <Icons.help className='h-4 w-4' />
        </Button>
        {!readOnly ? (
          <>
            {onDescontos ? (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={onDescontos}
              >
                Descontos
              </Button>
            ) : null}
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => emBreve('Fatura Global')}
            >
              Fatura Global
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => emBreve('Sinistrados')}
            >
              Sinistrados
            </Button>
          </>
        ) : null}
      </div>
      <div className='flex gap-2'>
        {onVoltar ? (
          <Button type='button' variant='outline' onClick={onVoltar}>
            Voltar
          </Button>
        ) : null}
        {!readOnly && onGuardar ? (
          <Button
            type='button'
            variant='destructive'
            disabled={isSubmitting}
            onClick={onGuardar}
          >
            Guardar
          </Button>
        ) : null}
      </div>
    </div>
  )
}
