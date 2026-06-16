import { useState } from 'react'
import { RuaTableDTO } from '@/types/dtos/base/ruas.dtos'
import { Map, Eye, Edit, Printer, Trash } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import { navigateManagedWindow } from '@/utils/window-utils'
import { useReportPrint } from '@/hooks/use-report-print'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/shared/alert-modal'
import { useDeleteRua } from '../../queries/ruas-mutations'
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

const RUAS_BASE_PATH_AREACOMUM = '/area-comum/tabelas/tabelas/geograficas/ruas'
const RUAS_BASE_PATH_UTILITARIOS = '/utilitarios/tabelas/geograficas/ruas'

interface CellActionProps {
  data: RuaTableDTO
  /** Quando definido (ex.: listagem área-comum), "Ver" abre o modal na página em vez do local */
  onOpenView?: (data: RuaTableDTO) => void
  /** Quando definido (ex.: listagem área-comum), "Editar" abre o mesmo modal em modo edição */
  onOpenEdit?: (data: RuaTableDTO) => void
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
  const basePath = location.pathname.startsWith(RUAS_BASE_PATH_AREACOMUM)
    ? RUAS_BASE_PATH_AREACOMUM
    : RUAS_BASE_PATH_UTILITARIOS

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
    if (onOpenEdit) {
      onOpenEdit(rua)
    } else {
      navigateManagedWindow(navigate, `${basePath}/update?ruaId=${rua.id}`)
    }
  }

  const handleViewClick = () => {
    if (onOpenView) {
      onOpenView(data)
    } else {
      setViewOpen(true)
    }
  }

  const handleViewFreguesias = (rua: string) => {
    navigateManagedWindow(
      navigate,
      `${basePath.replace('/ruas', '/freguesias')}`,
      {
        state: {
          initialFilters: [{ id: 'rua.nome', value: rua }],
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
      {!onOpenView && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Ruas</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label>Nome</Label>
                <Input readOnly value={data.nome ?? ''} className='bg-muted' />
              </div>
              <div className='grid gap-2'>
                <Label>Freguesia</Label>
                <Input
                  readOnly
                  value={data.freguesia?.nome ?? '-'}
                  className='bg-muted'
                />
              </div>
              <div className='grid gap-2'>
                <Label>Código Postal</Label>
                <Input
                  readOnly
                  value={data.codigoPostal?.codigo ?? '-'}
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
            <Edit className='h-4 w-4' />
          </Button>
        ) : null}
        {canDelete ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-destructive hover:text-destructive'
            disabled={deleteRuaMutation.isPending}
            onClick={() => setOpen(true)}
            title='Apagar'
          >
            <Trash className='h-4 w-4' />
          </Button>
        ) : null}
        {!onOpenView && (
          <>
            <Button
              onClick={handlePrintRua}
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              disabled={isPrinting}
              title='Imprimir relatório da rua'
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
