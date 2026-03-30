import { useState } from 'react'
import { ConcelhoTableDTO } from '@/types/dtos/base/concelhos.dtos'
import { Eye, Pencil, Trash2, Map, Printer } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { generateInstanceId } from '@/utils/window-utils'
import { useReportPrint } from '@/hooks/use-report-print'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/shared/alert-modal'
import { useDeleteConcelho } from '../../queries/concelhos-mutations'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CONCELHOS_BASE_PATH_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas/concelhos'
const CONCELHOS_BASE_PATH_UTILITARIOS = '/utilitarios/tabelas/geograficas/concelhos'

interface CellActionProps {
  data: ConcelhoTableDTO
  /** Quando definido (ex.: listagem área-comum), "Ver" abre o modal na página em vez do local */
  onOpenView?: (data: ConcelhoTableDTO) => void
  /** Quando definido (ex.: listagem área-comum), "Editar" abre o mesmo modal em modo edição */
  onOpenEdit?: (data: ConcelhoTableDTO) => void
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  onOpenView,
  onOpenEdit,
}) => {
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const basePath = location.pathname.startsWith(CONCELHOS_BASE_PATH_AREACOMUM)
    ? CONCELHOS_BASE_PATH_AREACOMUM
    : CONCELHOS_BASE_PATH_UTILITARIOS

  const deleteConcelhoMutation = useDeleteConcelho()
  const { handlePrint, isPrinting } = useReportPrint('listar-concelho')

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteConcelhoMutation.mutateAsync(data.id || '')

      const result = handleApiResponse(
        response,
        'Concelho removido com sucesso',
        'Erro ao remover o concelho',
        'Concelho removido com avisos'
      )

      if (result.success) {
        setOpen(false)
      }
    } catch (error) {
      toast.error('Erro ao remover o concelho')
      setOpen(false)
    }
  }

  const handleViewClick = () => {
    if (onOpenView) {
      onOpenView(data)
    } else {
      setViewOpen(true)
    }
  }

  const handleUpdateClick = (concelho: ConcelhoTableDTO) => {
    if (onOpenEdit) {
      onOpenEdit(concelho)
    } else {
      const instanceId = generateInstanceId()
      navigate(
        `${basePath}/update?concelhoId=${concelho.id}&instanceId=${instanceId}`
      )
    }
  }

  const handleViewFreguesias = (concelho: string) => {
    const instanceId = generateInstanceId()
    navigate(
      `${basePath.replace('/concelhos', '/freguesias')}?instanceId=${instanceId}`,
      {
        state: {
          initialFilters: [{ id: 'concelho.nome', value: concelho }],
          instanceId,
        },
      }
    )
  }

  const handlePrintConcelho = () => {
    handlePrint([data])
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteConcelhoMutation.isPending}
        title='Remover Concelho'
        description='Tem certeza que deseja remover este concelho?'
      />
      {!onOpenView && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Concelhos</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label>Nome</Label>
                <Input
                  readOnly
                  value={data.nome ?? ''}
                  className='bg-muted'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Distrito</Label>
                <Input
                  readOnly
                  value={data.distrito?.nome ?? '-'}
                  className='bg-muted'
                />
              </div>
            </div>
            <DialogFooter>
              <Button type='button' onClick={() => setViewOpen(false)}>
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <div className='flex items-center justify-end gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={handleViewClick}
          title='Ver'
        >
          <Eye className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={() => handleUpdateClick(data)}
          title='Editar'
        >
          <Pencil className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-destructive hover:text-destructive'
          disabled={deleteConcelhoMutation.isPending}
          onClick={() => setOpen(true)}
          title='Apagar'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
        {!onOpenView && (
          <>
            <Button
              onClick={handlePrintConcelho}
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={isPrinting}
              title='Imprimir relatório do concelho'
            >
              <Printer className='h-4 w-4' />
            </Button>
            <Button
              onClick={() => handleViewFreguesias(data.nome || '')}
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Ver Freguesias'
            >
              <Map className='h-4 w-4' />
            </Button>
          </>
        )}
      </div>
    </>
  )
}
