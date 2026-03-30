import { useEffect, useState, useRef } from 'react'
import { useGetReport } from '@/pages/reports/queries/reports-queries'
import { ResponseStatus } from '@/types/api/responses'
import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import 'stimulsoft-reports-js/Css/stimulsoft.viewer.office2013.whiteblue.css'
import { Stimulsoft } from 'stimulsoft-reports-js/Scripts/stimulsoft.viewer'
import { toast } from '@/utils/toast-utils'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/shared/breadcrumbs'
import { PageHead } from '@/components/shared/page-head'

// Set Portuguese (Portugal) localization at module level (before component renders)
// First add the localization file (loads from server), then set it as active
try {
  Stimulsoft.Base.Localization.StiLocalization.addLocalizationFile(
    '/Localizations/pt-PT.xml',
    true, // load from server
    'Portuguese (Portugal)'
  )
  Stimulsoft.Base.Localization.StiLocalization.setLocalizationFile(
    '/Localizations/pt-PT.xml'
  )
} catch (error) {
  console.warn('Failed to set Portuguese (Portugal) localization:', error)
}

export function ReportViewerPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const viewerRef = useRef<Stimulsoft.Viewer.StiViewer | null>(null)

  const reportName = searchParams.get('reportName') || ''

  // Get data from location state or URL params
  const data = (location.state as { data?: any })?.data || null

  // Use query to fetch report (with caching for fast loading)
  const {
    data: reportResponse,
    isLoading: isLoadingReport,
    error: reportError,
  } = useGetReport(reportName, !!reportName)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize viewer only once
    if (!viewerRef.current) {
      // Ensure localization is set before creating viewer
      try {
        Stimulsoft.Base.Localization.StiLocalization.addLocalizationFile(
          '/Localizations/pt-PT.xml',
          true, // load from server
          'Portuguese (Portugal)'
        )
        Stimulsoft.Base.Localization.StiLocalization.setLocalizationFile(
          '/Localizations/pt-PT.xml'
        )
      } catch (error) {
        console.warn('Failed to set Portuguese (Portugal) localization:', error)
      }

      const options = new Stimulsoft.Viewer.StiViewerOptions()
      viewerRef.current = new Stimulsoft.Viewer.StiViewer(
        options,
        'StiViewer',
        false
      )
    }

    if (!reportName || !viewerRef.current) {
      setIsLoading(false)
      return
    }

    // If we're still loading, wait
    if (isLoadingReport) {
      setIsLoading(true)
      return
    }

    // If there's an error, show it but don't try to load report
    if (reportError) {
      console.error('Error loading report:', reportError)
      toast.error('Erro ao carregar relatório', 'Erro')
      setIsLoading(false)
      return
    }

    // If we have the report response, process it
    if (reportResponse) {
      try {
        setIsLoading(true)

        if (!reportResponse.info) {
          throw new Error('Formato de resposta inválido')
        }

        // Extract report JSON string from the new response format
        // response.info = { data: string, messages: Record<string, string[]>, status: 0|1|2 }
        const responseInfo = reportResponse.info
        let reportSrc: string | null = null

        if (
          typeof responseInfo === 'object' &&
          responseInfo !== null &&
          'data' in responseInfo &&
          'status' in responseInfo
        ) {
          // New standard format: response.info = { data, messages, status }
          const apiResponse = responseInfo as {
            data: string
            messages: Record<string, string[]>
            status: ResponseStatus
          }

          // Check status: 0 = Success, 1 = PartialSuccess, 2 = Failure
          if (
            apiResponse.status !== ResponseStatus.Success ||
            !apiResponse.data
          ) {
            // Extract error messages from the messages object
            const errorMessages: string[] = []
            if (apiResponse.messages) {
              Object.values(apiResponse.messages).forEach((msgArray) => {
                if (Array.isArray(msgArray)) {
                  errorMessages.push(...msgArray)
                }
              })
            }
            const errorMessage =
              errorMessages.length > 0
                ? errorMessages.join(', ')
                : 'Erro ao carregar relatório'
            toast.error(errorMessage, 'Erro')
            setIsLoading(false)
            return
          }

          reportSrc = apiResponse.data
        } else if (typeof responseInfo === 'string') {
          // Legacy fallback: if info is directly a string
          reportSrc = responseInfo
        } else {
          throw new Error('Formato de resposta inválido do servidor')
        }

        if (!reportSrc) {
          throw new Error('Relatório não encontrado')
        }

        const report = Stimulsoft.Report.StiReport.createNewReport()
        report.load(reportSrc)

        viewerRef.current.report = report
        viewerRef.current.report.culture = 'pt-PT'

        // Always use real data in viewer (never sample data)
        if (data) {
          // Determine the correct data source name
          // For JSON data sources, Stimulsoft uses "root" as the data source name
          let dataSourceName = 'root' // Default for JSON data sources
          if (viewerRef.current.report.dictionary.dataSources.count > 0) {
            const firstDataSource =
              viewerRef.current.report.dictionary.dataSources.getByIndex(0)
            if (firstDataSource?.name) {
              dataSourceName = firstDataSource.name
            }
          }

          // Remove existing data source if it exists to ensure fresh registration
          const existingDataSource =
            viewerRef.current.report.dictionary.dataSources.getByName(
              dataSourceName
            )
          if (existingDataSource) {
            const index =
              viewerRef.current.report.dictionary.dataSources.indexOf(
                existingDataSource
              )
            if (index >= 0) {
              viewerRef.current.report.dictionary.dataSources.removeAt(index)
            }
          }

          // Register real data
          viewerRef.current.report.regData(dataSourceName, dataSourceName, data)
        }

        viewerRef.current.report.setVariable(
          'nomeEntidade',
          'Junta de Freguesia XPTO'
        )
        viewerRef.current.report.setVariable(
          'Licenciado',
          'Licenciado à Junta de Freguesia XPTO'
        )
        viewerRef.current.report.setVariable(
          'utilizadorPlataforma',
          'Utilizador da Junta de Freguesia XPTO'
        )

        viewerRef.current.report.dictionary.synchronize()
        viewerRef.current.renderHtml('viewerContent')
      } catch (error) {
        console.error('Error loading report:', error)
        toast.error('Erro ao carregar relatório', 'Erro')
      } finally {
        setIsLoading(false)
      }
    }
  }, [reportName, data, reportResponse, isLoadingReport, reportError])

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className='px-4 md:px-8 md:pb-8 md:pt-20 pt-4 md:mx-0 md:my-4 md:mr-4 md:rounded-xl pb-24'>
      <PageHead title='Report Viewer | Luma' />
      <Breadcrumbs
        items={[
          { title: 'Relatórios', link: '/reports' },
          { title: 'Viewer', link: location.pathname },
        ]}
      />
      <div className='mt-4 mb-4'>
        <Button variant='outline' onClick={handleBack}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
      </div>
      <div className='mt-4'>
        {isLoading ? (
          <div className='flex items-center justify-center h-[600px]'>
            <p>A carregar relatório...</p>
          </div>
        ) : (
          <div id='viewerContent' className='min-h-[600px]' />
        )}
      </div>
    </div>
  )
}
