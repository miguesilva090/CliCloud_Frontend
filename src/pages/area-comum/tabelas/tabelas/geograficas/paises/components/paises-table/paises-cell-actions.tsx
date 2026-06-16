import { useState } from 'react'
import { PaisTableDTO } from '@/types/dtos/base/paises.dtos'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { navigateManagedWindow } from '@/utils/window-utils'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/shared/alert-modal'
import { useDeletePais } from '../../queries/paises-mutations'
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

const PAISES_BASE_PATH_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas/paises'
const PAISES_BASE_PATH_UTILITARIOS = '/utilitarios/tabelas/geograficas/paises'

interface CellActionProps {
  data: PaisTableDTO
  /** Quando definido (ex.: listagem área-comum), "Ver" abre o modal na página em vez do local */
  onOpenView?: (data: PaisTableDTO) => void
  /** Quando definido (ex.: listagem área-comum), "Editar" abre o mesmo modal em modo edição */
  onOpenEdit?: (data: PaisTableDTO) => void
  /** GUID da funcionalidade na licença (ex. Gestão de Países); controla Ver/Chg/Del. */
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
  const basePath = location.pathname.startsWith(PAISES_BASE_PATH_AREACOMUM)
    ? PAISES_BASE_PATH_AREACOMUM
    : PAISES_BASE_PATH_UTILITARIOS

  const deletePaisMutation = useDeletePais()

  const handleDeleteConfirm = async () => {
    try {
      const response = await deletePaisMutation.mutateAsync(data.id || '')

      const result = handleApiResponse(
        response,
        'País removido com sucesso',
        'Erro ao remover o país',
        'País removido com avisos'
      )

      if (result.success) {
        setOpen(false)
      }
    } catch (error) {
      toast.error('Erro ao remover o país')
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

  const handleUpdateClick = (pais: PaisTableDTO) => {
    if (onOpenEdit) {
      onOpenEdit(pais)
    } else {
      navigateManagedWindow(
        navigate,
        `${basePath}/update?paisId=${pais.id}`
      )
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deletePaisMutation.isPending}
        title='Remover País'
        description='Tem certeza que deseja remover este país?'
      />
      {!onOpenView && (
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Países</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label>Sigla</Label>
              <Input
                readOnly
                value={data.codigo ?? ''}
                className='bg-muted'
              />
            </div>
            <div className='grid gap-2'>
              <Label>Nome</Label>
              <Input
                readOnly
                value={data.nome ?? ''}
                className='bg-muted'
              />
            </div>
            <div className='grid gap-2'>
              <Label>Prefixo</Label>
              <Input
                readOnly
                value={data.prefixo ?? ''}
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
            disabled={deletePaisMutation.isPending}
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
