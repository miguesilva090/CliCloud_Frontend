import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openUtenteCreationInApp } from '@/utils/window-utils'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import {
  CreditCard,
  MessageSquare,
  Plus,
  List,
  RotateCw,
} from 'lucide-react'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { usePageData } from '@/utils/page-data-utils'
import {
  useConsultarUtenteRnu,
  UTENTE_LIST_ALLOWED_SORT_IDS,
  useGetUtentesPaginated,
  usePrefetchAdjacentUtentes,
  useDeleteUtente,
} from '@/pages/utentes/queries/utentes-queries'
import { UtentesTable } from '@/pages/utentes/components/utentes-table/utentes-table'
import type { DataTableAction } from '@/components/shared/data-table'
import type { UtenteTableDTO } from '@/types/dtos/saude/utentes.dtos'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'

const LISTAGEM_PATH = '/area-comum/tabelas/entidades/utentes'
const utentesPermId = modules.areaComum.permissions.utentes.id

export function ListagemUtentesPage() {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const { canAdd } = useAreaComumEntityListPermissions(utentesPermId)
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<UtenteTableDTO | null>(null)
  const del = useDeleteUtente({ onSuccessNavigateTo: LISTAGEM_PATH })
  const consultarRnu = useConsultarUtenteRnu()
  const [rnuModalOpen, setRnuModalOpen] = useState(false)
  const [rnuConfirmAddOpen, setRnuConfirmAddOpen] = useState(false)
  const [rnuTipo, setRnuTipo] = useState<'sns' | 'cartao'>('sns')
  const [rnuNumeroSns, setRnuNumeroSns] = useState('')
  const [rnuNumeroCartao, setRnuNumeroCartao] = useState('')
  const [rnuPayloadParaAdicionar, setRnuPayloadParaAdicionar] = useState<Record<string, unknown> | null>(null)
  const handleOpenDelete = (row: UtenteTableDTO) => {
    setItemToDelete(row)
    setDeleteDialogOpen(true)
  }
  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    try {
      await del.mutateAsync(itemToDelete.id)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch {
      toast.error('Falha ao eliminar utente.')
    }
  }

  const handleOpenRnuModal = () => {
    setRnuTipo('sns')
    setRnuNumeroSns('')
    setRnuNumeroCartao('')
    setRnuModalOpen(true)
  }

  const handleConsultarRnu = async () => {
    const numeroSns = rnuNumeroSns.trim()
    const numeroCartao = rnuNumeroCartao.trim()

    if (rnuTipo === 'sns' && !numeroSns) {
      toast.error('Introduza o Número de Utente', 'RNU')
      return
    }

    if (rnuTipo === 'cartao' && !numeroCartao) {
      toast.error('Introduza o Número do Cartão', 'RNU')
      return
    }

    try {
      const info = await consultarRnu.mutateAsync({
        numeroSns: rnuTipo === 'sns' ? numeroSns : null,
        numeroCartao: rnuTipo === 'cartao' ? numeroCartao : null,
        tipoCartao: rnuTipo === 'cartao' ? 'CNS' : null,
      })

      if (info.status !== ResponseStatus.Success || !info.data) {
        const msg =
          info.messages?.['$']?.[0] ||
          Object.values(info.messages || {})?.[0]?.[0] ||
          'Falha ao consultar RNU'
        toast.error(msg, 'RNU')
        return
      }

      const nome = info.data.nomeCompleto || info.data.nomesProprios || 'Utente'
      const numeroSnsEncontrado = (info.data.numeroSns ?? '').trim()
      if (numeroSnsEncontrado) {
        const existente = await UtentesService('utentes').getUtenteByNumeroUtente(numeroSnsEncontrado)
        if (existente.info?.status === ResponseStatus.Success && existente.info?.data?.id) {
          toast.success(`${nome} já existe na lista de utentes`, 'RNU')
          setRnuModalOpen(false)
          return
        }
      }

      const entidadeResponsavelDescricao = info.data.entidadesResponsaveis?.[0]?.descricao ?? ''
      const condicaoSns =
        entidadeResponsavelDescricao.toLowerCase().includes('sns')
          ? 0
          : entidadeResponsavelDescricao.toLowerCase().includes('terceiro')
            ? 1
            : entidadeResponsavelDescricao
              ? 2
              : null

      setRnuPayloadParaAdicionar({
        nome: info.data.nomeCompleto ?? info.data.nomesProprios ?? '',
        numeroUtente: info.data.numeroSns ?? '',
        dataNascimento: info.data.dataNascimento ? String(info.data.dataNascimento).slice(0, 10) : '',
        sexoCodigo: info.data.sexo ?? '',
        paisNacionalidade: info.data.paisNacionalidade ?? '',
        condicaoSns,
        entidadeResponsavelCodigo: info.data.entidadesResponsaveis?.[0]?.codigo ?? '',
        entidadeResponsavelDescricao,
      })
      setRnuModalOpen(false)
      setRnuConfirmAddOpen(true)
    } catch {
      // onError do mutation já mostra toast; evita Uncaught (in promise)
    }
  }

  const handleConfirmarAdicionarRnu = () => {
    if (rnuPayloadParaAdicionar) {
      sessionStorage.setItem('rnu-prefill-utente-create', JSON.stringify(rnuPayloadParaAdicionar))
    }
    setRnuConfirmAddOpen(false)
    openUtenteCreationInApp(navigate, addWindow)
  }

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: (p, ps, f, s) => useGetUtentesPaginated(p, ps, f, s),
    usePrefetchAdjacentData: (p, ps, f) => usePrefetchAdjacentUtentes(p, ps, f),
  })

  useEffect(() => {
    const cleaned = sorting.filter((s) =>
      UTENTE_LIST_ALLOWED_SORT_IDS.has(s.id)
    )
    const same =
      cleaned.length === sorting.length &&
      cleaned.every(
        (s, i) => s.id === sorting[i]?.id && s.desc === sorting[i]?.desc
      )
    if (!same) {
      handleSortingChange(cleaned)
    }
  }, [sorting, handleSortingChange])

  const utentes = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const toolbarActions: DataTableAction[] = [
    {
      label: 'RNU',
      icon: null,
      onClick: handleOpenRnuModal,
      variant: 'outline',
    },
    {
      label: 'Cartão de Cidadão',
      icon: <CreditCard className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
    {
      label: 'Enviar Mensagens',
      icon: <MessageSquare className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
    ...(canAdd
      ? [
          {
            label: 'Adicionar',
            icon: <Plus className='h-4 w-4' />,
            onClick: () => openUtenteCreationInApp(navigate, addWindow),
            variant: 'destructive' as const,
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          },
        ]
      : []),
    {
      label: 'Listagens',
      icon: <List className='h-4 w-4' />,
      onClick: () => {},
      variant: 'outline',
    },
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: () => {
        handleFiltersChange([])
        handlePaginationChange(1, pageSize)
        queryClient.invalidateQueries({ queryKey: ['utentes-paginated'] })
      },
      variant: 'outline',
    },
  ]

  return (
    <>
      <PageHead title='CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title='Utentes'
          onRefresh={() =>
            queryClient.invalidateQueries({ queryKey: ['utentes-paginated'] })
          }
        >
        {isError ? (
          <Alert variant='destructive' className='mb-4'>
            <AlertTitle>Falha ao carregar utentes</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao pedir a lista de utentes.'}
            </AlertDescription>
          </Alert>
        ) : null}

        <UtentesTable
          data={utentes}
          isLoading={isLoading}
          pageCount={pageCount}
          totalRows={totalRows}
          page={page}
          pageSize={pageSize}
          filters={filters}
          sorting={sorting}
          onPaginationChange={handlePaginationChange}
          onFiltersChange={handleFiltersChange}
          onSortingChange={handleSortingChange}
          deleteReturnPath={LISTAGEM_PATH}
          onOpenDelete={handleOpenDelete}
          toolbarActions={toolbarActions}
          expandableSearch
          globalSearchColumnId='nome'
          globalSearchPlaceholder='Procurar por nome...'
        />
        </AreaComumListagemPageShell>
        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            if (!del.isPending) {
              setDeleteDialogOpen(open)
              if (!open) setItemToDelete(null)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar Utente</AlertDialogTitle>
              <AlertDialogDescription>
                Tem a certeza que pretende eliminar o utente &quot;
                {itemToDelete?.nome ?? itemToDelete?.id ?? ''}
                &quot;? Esta ação não pode ser revertida.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={del.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleConfirmDelete()
                }}
                disabled={del.isPending}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {del.isPending ? 'A eliminar...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={rnuModalOpen} onOpenChange={setRnuModalOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Obter informação do RNU</DialogTitle>
              <DialogDescription className='sr-only'>
                Modal para consultar dados do utente no RNU por número SNS ou cartão.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <RadioGroup
                value={rnuTipo}
                onValueChange={(value) => setRnuTipo(value === 'cartao' ? 'cartao' : 'sns')}
                className='flex items-center gap-6'
              >
                <div className='flex items-center gap-2'>
                  <RadioGroupItem id='rnu-sns' value='sns' />
                  <Label htmlFor='rnu-sns'>Nº SNS</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem id='rnu-cartao' value='cartao' />
                  <Label htmlFor='rnu-cartao'>Cartão</Label>
                </div>
              </RadioGroup>

              {rnuTipo === 'sns' ? (
                <div className='space-y-2'>
                  <Label htmlFor='rnu-numero-sns'>Número de Utente</Label>
                  <Input
                    id='rnu-numero-sns'
                    value={rnuNumeroSns}
                    onChange={(e) => setRnuNumeroSns(e.target.value)}
                    placeholder='Introduza o Número de Utente'
                  />
                </div>
              ) : (
                <div className='space-y-2'>
                  <Label htmlFor='rnu-numero-cartao'>Número do Cartão</Label>
                  <Input
                    id='rnu-numero-cartao'
                    value={rnuNumeroCartao}
                    onChange={(e) => setRnuNumeroCartao(e.target.value)}
                    placeholder='Introduza o Número do Cartão'
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setRnuModalOpen(false)}
                disabled={consultarRnu.isPending}
              >
                Cancelar
              </Button>
              <Button
                type='button'
                onClick={handleConsultarRnu}
                disabled={consultarRnu.isPending}
              >
                {consultarRnu.isPending ? 'A consultar...' : 'OK'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={rnuConfirmAddOpen} onOpenChange={setRnuConfirmAddOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogDescription>
                O utente não existe no formulário dos utentes.
                <br />
                Deseja inserir com a informação do RNU?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmarAdicionarRnu}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardPageContainer>
    </>
  )
}
