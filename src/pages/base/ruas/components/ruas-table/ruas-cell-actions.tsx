import { useState } from 'react'
import { RuaTableDTO } from '@/types/dtos/base/ruas.dtos'
import { Map, Edit, Printer, Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { generateInstanceId } from '@/utils/window-utils'
import { useReportPrint } from '@/hooks/use-report-print'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/shared/alert-modal'
import { useDeleteRua } from '../../queries/ruas-mutations'

interface CellActionProps {
  data: RuaTableDTO
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const deleteRuaMutation = useDeleteRua()
  const { handlePrint, isPrinting } = useReportPrint('listar-rua')

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteRuaMutation.mutateAsync(data.id || '')

      const result = handleApiResponse(
        response,
        'Rua removida com sucesso',
        'Erro ao remover a rua',
        'Rua removida com avisos'
      )

      if (result.success) {
        // Success or partial success - close modal
        setOpen(false)
      }
    } catch (error) {
      toast.error('Erro ao remover a rua')
      setOpen(false)
    }
  }

  const handleUpdateClick = (rua: RuaTableDTO) => {
    const instanceId = generateInstanceId()
    navigate(
      `/utilitarios/tabelas/geograficas/ruas/update?ruaId=${rua.id}&instanceId=${instanceId}`
    )
  }

  const handleViewFreguesias = (rua: string) => {
    const instanceId = generateInstanceId()
    navigate(
      `/utilitarios/tabelas/geograficas/freguesias?instanceId=${instanceId}`,
      {
        state: {
          initialFilters: [{ id: 'rua.nome', value: rua }],
          instanceId,
        },
      }
    )
  }

  const handlePrintRua = () => {
    handlePrint([data])
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteRuaMutation.isPending}
        title='Remover Rua'
        description='Tem certeza que deseja remover esta rua?'
      />

      <div className='flex items-center gap-2'>
        <Button
          onClick={handlePrintRua}
          variant='ghost'
          className='h-8 w-8 p-0'
          disabled={isPrinting}
          title='Imprimir relatório da rua'
        >
          <Printer
            color={
              isPrinting
                ? 'hsl(var(--muted-foreground))'
                : 'hsl(var(--primary))'
            }
            className='h-4 w-4'
          />
          <span className='sr-only'>Imprimir</span>
        </Button>
        <Button
          onClick={() => handleUpdateClick(data)}
          variant='ghost'
          className='h-8 w-8 p-0'
        >
          <Edit color='hsl(var(--primary))' className='h-4 w-4' />
          <span className='sr-only'>Atualizar</span>
        </Button>
        <Button
          onClick={() => setOpen(true)}
          variant='ghost'
          className='h-8 w-8 p-0'
        >
          <Trash color='hsl(var(--destructive))' className='h-4 w-4' />
          <span className='sr-only'>Apagar</span>
        </Button>
        <Button
          onClick={() => handleViewFreguesias(data.nome || '')}
          variant='ghost'
          className='h-8 w-8 p-0'
        >
          <Map color='hsl(var(--primary))' className='h-4 w-4' />
          <span className='sr-only'>Ver Freguesias</span>
        </Button>
      </div>
    </>
  )
}
