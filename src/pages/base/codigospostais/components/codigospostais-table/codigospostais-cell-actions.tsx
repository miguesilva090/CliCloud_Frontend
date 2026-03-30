import { useState } from 'react'
import { CodigoPostalTableDTO } from '@/types/dtos/base/codigospostais.dtos'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { generateInstanceId } from '@/utils/window-utils'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/shared/alert-modal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeleteCodigoPostal } from '../../queries/codigospostais-mutations'

const CODIGOSPOSTAIS_BASE_PATH_AREACOMUM =
  '/area-comum/tabelas/tabelas/geograficas/codigospostais'
const CODIGOSPOSTAIS_BASE_PATH_UTILITARIOS =
  '/utilitarios/tabelas/geograficas/codigospostais'

interface CellActionProps {
  data: CodigoPostalTableDTO
  /** Quando definido (ex.: listagem área-comum), "Ver" abre o modal/fluxo externo em vez do local */
  onOpenView?: (data: CodigoPostalTableDTO) => void
  /** Quando definido (ex.: listagem área-comum), "Editar" abre o mesmo modal em modo edição */
  onOpenEdit?: (data: CodigoPostalTableDTO) => void
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
  const basePath = location.pathname.startsWith(
    CODIGOSPOSTAIS_BASE_PATH_AREACOMUM
  )
    ? CODIGOSPOSTAIS_BASE_PATH_AREACOMUM
    : CODIGOSPOSTAIS_BASE_PATH_UTILITARIOS

  const deleteCodigoPostalMutation = useDeleteCodigoPostal()

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteCodigoPostalMutation.mutateAsync(
        data.id || ''
      )

      const result = handleApiResponse(
        response,
        'Código Postal removido com sucesso',
        'Erro ao remover o código postal',
        'Código Postal removido com avisos'
      )

      if (result.success) {
        setOpen(false)
      }
    } catch (error) {
      toast.error('Erro ao remover o código postal')
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

  const handleUpdateClick = (codigoPostal: CodigoPostalTableDTO) => {
    if (onOpenEdit) {
      onOpenEdit(codigoPostal)
    } else {
      const instanceId = generateInstanceId()
      navigate(
        `${basePath}/update?codigoPostalId=${codigoPostal.id}&instanceId=${instanceId}`
      )
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteCodigoPostalMutation.isPending}
        title='Remover Código Postal'
        description='Tem certeza que deseja remover este código postal?'
      />
      {!onOpenView && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Códigos Postais</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label>Código</Label>
                <Input
                  readOnly
                  value={data.codigo ?? ''}
                  className='bg-muted'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Localidade</Label>
                <Input
                  readOnly
                  value={data.localidade ?? ''}
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
          disabled={deleteCodigoPostalMutation.isPending}
          onClick={() => setOpen(true)}
          title='Apagar'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    </>
  )
}
