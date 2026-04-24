import { useState } from 'react'
import { FreguesiaTableDTO } from '@/types/dtos/base/freguesias.dtos'
import { Eye, Pencil, Trash2, Map, Printer } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { navigateManagedWindow } from '@/utils/window-utils'
import { useReportPrint } from '@/hooks/use-report-print'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/shared/alert-modal'
import { useDeleteFreguesia } from '../../queries/freguesias-mutations'
import { useGeograficasListRowPermissions } from '@/hooks/use-geograficas-list-row-permissions'

const FREGUESIAS_BASE_PATH_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas/freguesias'
const FREGUESIAS_BASE_PATH_UTILITARIOS = '/utilitarios/tabelas/geograficas/freguesias'

interface CellActionProps {
  data: FreguesiaTableDTO
  /** Quando definido (ex.: listagem área-comum), "Ver" abre o modal na página em vez do local */
  onOpenView?: (data: FreguesiaTableDTO) => void
  /** Quando definido (ex.: listagem área-comum), "Editar" abre o mesmo modal em modo edição */
  onOpenEdit?: (data: FreguesiaTableDTO) => void
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

  const deleteFreguesiaMutation = useDeleteFreguesia()
  const { handlePrint, isPrinting } = useReportPrint('listar-freguesia')

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteFreguesiaMutation.mutateAsync(data.id || '')

      const result = handleApiResponse(
        response,
        'Freguesia removida com sucesso',
        'Erro ao remover a freguesia',
        'Freguesia removida com avisos'
      )

      if (result.success) {
        setOpen(false)
      }
    } catch (error) {
      toast.error('Erro ao remover a freguesia')
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

  const handleUpdateClick = (freguesia: FreguesiaTableDTO) => {
    if (onOpenEdit) {
      onOpenEdit(freguesia)
    } else {
      const basePath = location.pathname.startsWith(FREGUESIAS_BASE_PATH_AREACOMUM)
        ? FREGUESIAS_BASE_PATH_AREACOMUM
        : FREGUESIAS_BASE_PATH_UTILITARIOS
      navigateManagedWindow(
        navigate,
        `${basePath}/update?freguesiaId=${freguesia.id}`
      )
    }
  }

  const handleViewRuas = (freguesia: string) => {
    const basePath = location.pathname.startsWith(FREGUESIAS_BASE_PATH_AREACOMUM)
      ? FREGUESIAS_BASE_PATH_AREACOMUM
      : FREGUESIAS_BASE_PATH_UTILITARIOS
    navigateManagedWindow(
      navigate,
      `${basePath.replace('/freguesias', '/ruas')}`,
      {
        state: {
          initialFilters: [{ id: 'freguesia.nome', value: freguesia }],
        },
      }
    )
  }

  const handlePrintFreguesia = () => {
    handlePrint([data])
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteFreguesiaMutation.isPending}
        title='Remover Freguesia'
        description='Tem certeza que deseja remover esta freguesia?'
      />
      {!onOpenView && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Freguesias</DialogTitle>
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
                <Label>Concelho</Label>
                <Input
                  readOnly
                  value={data.concelho?.nome ?? '-'}
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
            disabled={deleteFreguesiaMutation.isPending}
            onClick={() => setOpen(true)}
            title='Apagar'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        ) : null}
        {!onOpenView && (
          <>
            <Button
              onClick={handlePrintFreguesia}
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={isPrinting}
              title='Imprimir relatório da freguesia'
            >
              <Printer className='h-4 w-4' />
            </Button>
            <Button
              onClick={() => handleViewRuas(data.nome || '')}
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='Ver Ruas'
            >
              <Map className='h-4 w-4' />
            </Button>
          </>
        )}
      </div>
    </>
  )
}
