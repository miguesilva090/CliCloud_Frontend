import { useState, useMemo } from 'react'
import {
  useRevertReport,
  useDeleteReport,
  useGetOriginalReports,
} from '@/pages/reports/queries/reports-mutations'
import { useGetAllReports } from '@/pages/reports/queries/reports-queries'
import {
  FileText,
  Loader2,
  RotateCcw,
  Search,
  X,
  Download,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlertModal } from '@/components/shared/alert-modal'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { PageHead } from '@/components/shared/page-head'

export function ReportsListPage() {
  const [confirmRevertOpen, setConfirmRevertOpen] = useState(false)
  const [reportToRevert, setReportToRevert] = useState<string | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Use queries and mutations
  const {
    data: reports = [],
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
    failureCount,
  } = useGetAllReports()

  const revertReportMutation = useRevertReport()
  const deleteReportMutation = useDeleteReport()
  const getOriginalReportsMutation = useGetOriginalReports()

  // Filter reports by search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) {
      return reports
    }
    const query = searchQuery.toLowerCase().trim()
    return reports.filter((reportName) =>
      reportName.toLowerCase().includes(query)
    )
  }, [reports, searchQuery])

  const handleReportClick = (reportName: string) => {
    // Open designer in a new browser tab with the report loaded
    const designerPath = '/reports/designer'
    const fullUrl = `${window.location.origin}${designerPath}?reportName=${encodeURIComponent(reportName)}`
    window.open(fullUrl, '_blank', 'noopener,noreferrer')
  }

  const handleRevertReport = (e: React.MouseEvent, reportName: string) => {
    // Prevent the card click from opening the designer
    e.stopPropagation()
    setReportToRevert(reportName)
    setConfirmRevertOpen(true)
  }

  const handleRevertConfirm = async () => {
    if (!reportToRevert) return

    revertReportMutation.mutate(reportToRevert, {
      onSuccess: () => {
        setConfirmRevertOpen(false)
        setReportToRevert(null)
      },
    })
  }

  const handleDeleteReport = (e: React.MouseEvent, reportName: string) => {
    // Prevent the card click from opening the designer
    e.stopPropagation()
    setReportToDelete(reportName)
    setConfirmDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return

    deleteReportMutation.mutate(reportToDelete, {
      onSuccess: () => {
        setConfirmDeleteOpen(false)
        setReportToDelete(null)
      },
    })
  }

  const handleGetOriginals = () => {
    getOriginalReportsMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className='px-4 md:px-8 md:pb-24 md:pt-20 pt-4 md:mx-0 md:my-4 md:mr-4 md:rounded-xl pb-24'>
        <PageHead title='Relatórios | Luma' />
        <Breadcrumbs
          items={[
            {
              title: 'Relatórios',
              link: '/reports',
            },
          ]}
        />
        <div className='mt-10 flex items-center justify-center min-h-[400px]'>
          <div className='flex flex-col items-center gap-4'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <p className='text-muted-foreground'>A carregar relatórios...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state with improved layout and auto-retry
  if (queryError) {
    return (
      <div className='px-4 md:px-8 md:pb-24 md:pt-20 pt-4 md:mx-0 md:my-4 md:mr-4 md:rounded-xl pb-24'>
        <PageHead title='Relatórios | Luma' />
        <Breadcrumbs
          items={[
            {
              title: 'Relatórios',
              link: '/reports',
            },
          ]}
        />
        <div className='mt-10 flex items-center justify-center min-h-[500px]'>
          <div className='text-center max-w-md'>
            <div className='relative mx-auto w-24 h-24 mb-6'>
              <div className='absolute inset-0 bg-destructive/10 rounded-full blur-xl'></div>
              <div className='relative bg-destructive/5 border border-destructive/20 rounded-full p-6 flex items-center justify-center'>
                <AlertCircle className='h-12 w-12 text-destructive' />
              </div>
            </div>
            <h3 className='text-lg font-semibold mb-2 text-foreground'>
              Erro ao carregar relatórios
            </h3>
            <p className='text-muted-foreground text-sm mb-2'>
              Não foi possível estabelecer ligação com o servidor.
            </p>
            {isRefetching ? (
              <div className='flex items-center justify-center gap-2 mt-4'>
                <Loader2 className='h-4 w-4 animate-spin text-primary' />
                <p className='text-sm text-muted-foreground'>
                  A tentar novamente...
                </p>
              </div>
            ) : (
              <div className='flex flex-col items-center gap-3 mt-6'>
                <p className='text-xs text-muted-foreground'>
                  {failureCount > 0 &&
                    `Tentativa ${failureCount} de 3. A tentar novamente automaticamente...`}
                </p>
                <Button
                  onClick={() => refetch()}
                  variant='outline'
                  size='sm'
                  className='gap-2'
                >
                  <RefreshCw className='h-4 w-4' />
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='px-4 md:px-8 md:pb-24 md:pt-20 pt-4 md:mx-0 md:my-4 md:mr-4 md:rounded-xl pb-24'>
      <PageHead title='Relatórios | Luma' />
      <Breadcrumbs
        items={[
          {
            title: 'Relatórios',
            link: '/reports',
          },
        ]}
      />

      <AlertModal
        isOpen={confirmRevertOpen}
        onClose={() => {
          setConfirmRevertOpen(false)
          setReportToRevert(null)
        }}
        onConfirm={handleRevertConfirm}
        loading={revertReportMutation.isPending}
        title='Reverter Relatório'
        description={
          reportToRevert
            ? `Tem certeza que deseja reverter o relatório "${reportToRevert.replace(/\.mrt$/i, '')}" para a versão original? Todas as alterações não salvas serão perdidas.`
            : 'Tem certeza que deseja reverter este relatório para a versão original?'
        }
      />

      <AlertModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false)
          setReportToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteReportMutation.isPending}
        title='Apagar Relatório'
        description={
          reportToDelete
            ? `Tem certeza que deseja apagar o relatório "${reportToDelete.replace(/\.mrt$/i, '')}"? Esta ação não pode ser desfeita.`
            : 'Tem certeza que deseja apagar este relatório?'
        }
      />

      <div className='mt-10'>
        {/* Header Section */}
        <div className='mb-6'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>
                Relatórios
              </h1>
              <p className='text-muted-foreground mt-2'>
                Gerencie e edite os seus relatórios
              </p>
            </div>
            <div className='flex items-center gap-3'>
              {filteredReports.length > 0 && (
                <div className='hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50'>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium'>
                    {filteredReports.length}{' '}
                    {filteredReports.length === 1 ? 'relatório' : 'relatórios'}
                    {searchQuery &&
                      reports.length !== filteredReports.length && (
                        <span className='text-muted-foreground ml-1'>
                          de {reports.length}
                        </span>
                      )}
                  </span>
                </div>
              )}
              <Button
                variant='outline'
                size='sm'
                onClick={handleGetOriginals}
                disabled={getOriginalReportsMutation.isPending}
                className='gap-2'
              >
                {getOriginalReportsMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Obtendo...
                  </>
                ) : (
                  <>
                    <Download className='h-4 w-4' />
                    Obter Originais
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Search Filter */}
          <div className='relative max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Pesquisar por nome...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 pr-9'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                aria-label='Limpar pesquisa'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
        </div>

        {reports.length === 0 ? (
          <div className='flex items-center justify-center min-h-[500px]'>
            <div className='text-center max-w-md'>
              <div className='relative mx-auto w-24 h-24 mb-6'>
                <div className='absolute inset-0 bg-primary/10 rounded-full blur-xl'></div>
                <div className='relative bg-muted/50 border border-border/50 rounded-full p-6 flex items-center justify-center'>
                  <FileText className='h-12 w-12 text-muted-foreground' />
                </div>
              </div>
              <h3 className='text-lg font-semibold mb-2'>
                Nenhum relatório encontrado
              </h3>
              <p className='text-muted-foreground text-sm'>
                Os relatórios aparecerão aqui quando estiverem disponíveis
              </p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='text-center max-w-md'>
              <div className='relative mx-auto w-16 h-16 mb-4'>
                <div className='absolute inset-0 bg-primary/10 rounded-full blur-xl'></div>
                <div className='relative bg-muted/50 border border-border/50 rounded-full p-4 flex items-center justify-center'>
                  <Search className='h-8 w-8 text-muted-foreground' />
                </div>
              </div>
              <h3 className='text-lg font-semibold mb-2'>
                Nenhum relatório encontrado
              </h3>
              <p className='text-muted-foreground text-sm mb-4'>
                Não foram encontrados relatórios que correspondam à pesquisa "
                {searchQuery}"
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setSearchQuery('')}
              >
                Limpar pesquisa
              </Button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3'>
            {filteredReports.map((reportName) => (
              <Card
                key={reportName}
                className='group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 hover:scale-[1.02] hover:bg-card cursor-pointer flex flex-col'
                onClick={() => handleReportClick(reportName)}
              >
                {/* Modern glassmorphism background */}
                <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                {/* Floating particles effect */}
                <div className='absolute top-2 right-2 w-1.5 h-1.5 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75 shadow-lg shadow-primary/50'></div>

                {/* Shine effect on hover */}
                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 opacity-0 group-hover:opacity-100'></div>

                <CardHeader className='relative pb-2 pt-3 px-3'>
                  <div className='flex items-start justify-between mb-2'>
                    <div className='relative p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-primary/25 group-hover:scale-105'>
                      <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'></div>
                      <FileText className='h-4 w-4 text-primary relative z-10' />
                    </div>
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0'>
                      <div className='p-1 bg-primary/10 group-hover:bg-primary/20 border border-primary/20 rounded-md transition-all duration-300'>
                        <svg
                          className='h-3 w-3 text-primary'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <CardTitle className='text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300'>
                    {reportName.replace(/\.mrt$/i, '')}
                  </CardTitle>
                </CardHeader>

                <CardContent className='relative flex-1 flex flex-col justify-end pt-0 px-3 pb-3'>
                  <div className='space-y-2'>
                    <div className='h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50'></div>
                    <div className='flex items-center gap-1.5'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 text-[10px] h-7 font-medium border-border/50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200 px-2'
                        onClick={(e) => handleRevertReport(e, reportName)}
                        disabled={
                          revertReportMutation.isPending ||
                          deleteReportMutation.isPending
                        }
                      >
                        {revertReportMutation.isPending &&
                        reportToRevert === reportName ? (
                          <>
                            <Loader2 className='h-2.5 w-2.5 mr-1 animate-spin' />
                            <span className='hidden sm:inline'>
                              Revertendo...
                            </span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className='h-2.5 w-2.5 mr-1' />
                            <span className='hidden sm:inline'>Reverter</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-[10px] h-7 w-7 p-0 font-medium border-border/50 hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive transition-all duration-200'
                        onClick={(e) => handleDeleteReport(e, reportName)}
                        disabled={
                          revertReportMutation.isPending ||
                          deleteReportMutation.isPending
                        }
                        title='Apagar relatório'
                      >
                        {deleteReportMutation.isPending &&
                        reportToDelete === reportName ? (
                          <Loader2 className='h-2.5 w-2.5 animate-spin' />
                        ) : (
                          <Trash2 className='h-2.5 w-2.5' />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>

                {/* Gradient border bottom */}
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
