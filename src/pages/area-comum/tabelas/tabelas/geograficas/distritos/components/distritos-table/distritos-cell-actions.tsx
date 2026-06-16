import { useState } from 'react'
import { DistritoTableDTO } from '@/types/dtos/base/distritos.dtos'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { navigateManagedWindow } from '@/utils/window-utils'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/shared/alert-modal'
import { useDeleteDistrito } from '../../queries/distritos-mutations'
import { useGeograficasListRowPermissions } from '@/hooks/use-geograficas-list-row-permissions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DISTRITOS_BASE_PATH_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas/distritos'
const DISTRITOS_BASE_PATH_UTILITARIOS = '/utilitarios/tabelas/geograficas/distritos'

interface CellActionProps {
  data: DistritoTableDTO
  /** Quando definido (ex.: listagem área-comum), "Ver" abre o modal na página em vez do local */
  onOpenView?: (data: DistritoTableDTO) => void
  /** Quando definido (ex.: listagem área-comum), "Editar" chama este callback em vez de navegar */
  onOpenEdit?: (data: DistritoTableDTO) => void
  funcionalidadeId?: string
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  onOpenView,
  onOpenEdit,
  funcionalidadeId,
}) => {
  const { canView, canChange, canDelete } =
    useGeograficasListRowPermissions(funcionalidadeId)
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const basePath = location.pathname.startsWith(DISTRITOS_BASE_PATH_AREACOMUM)
    ? DISTRITOS_BASE_PATH_AREACOMUM
    : DISTRITOS_BASE_PATH_UTILITARIOS

  const deleteDistritoMutation = useDeleteDistrito()

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteDistritoMutation.mutateAsync(data.id || '')

      const result = handleApiResponse(
        response,
        'Distrito removido com sucesso',
        'Erro ao remover o distrito',
        'Distrito removido com avisos'
      )

      if (result.success) {
        setOpen(false)
      }
    } catch (error) {
      toast.error('Erro ao remover o distrito')
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

  const handleUpdateClick = (distrito: DistritoTableDTO) => {
    if (onOpenEdit) {
      onOpenEdit(distrito)
    } else {
      navigateManagedWindow(
        navigate,
        `${basePath}/update?distritoId=${distrito.id}`
      )
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteDistritoMutation.isPending}
        title='Remover Distrito'
        description='Tem certeza que deseja remover este distrito?'
      />
      {!onOpenView && (
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Distritos</DialogTitle>
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
              <Label>País</Label>
              <Input
                readOnly
                value={data.pais?.nome ?? '-'}
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
        {canView ? (
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
        ) : null}
        {canChange ? (
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
        ) : null}
        {canDelete ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-destructive hover:text-destructive'
            disabled={deleteDistritoMutation.isPending}
            onClick={() => setOpen(true)}
            title='Apagar'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        ) : null}
      </div>
    </>
  )
}
