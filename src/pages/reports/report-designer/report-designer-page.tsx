import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { useSaveReport } from '@/pages/reports/queries/reports-mutations'
import { useGetReport } from '@/pages/reports/queries/reports-queries'
import { useLocation } from 'react-router-dom'
import 'stimulsoft-reports-js/Css/stimulsoft.designer.office2013.whiteblue.css'
import { Stimulsoft } from 'stimulsoft-reports-js/Scripts/stimulsoft.designer'
import { AppLoader } from '@/components/shared/app-loader'

function b64EncodeUnicode(str: string) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_match, p1) {
      return String.fromCharCode(parseInt(p1, 16))
    })
  )
}

export function ReportDesignerPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const designerRef = useRef<Stimulsoft.Designer.StiDesigner | null>(null)

  const reportName = searchParams.get('reportName') || ''
  const newReport = searchParams.get('newReport') === 'true'

  // Set white background IMMEDIATELY on mount (before any rendering)
  // Use useLayoutEffect to run synchronously before browser paint
  useLayoutEffect(() => {
    // Apply styles synchronously before React renders
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#ffffff'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.backgroundColor = '#ffffff'
    const rootEl = document.getElementById('root')
    if (rootEl) {
      rootEl.style.margin = '0'
      rootEl.style.padding = '0'
      rootEl.style.backgroundColor = '#ffffff'
    }

    // Also inject critical CSS into head for immediate application
    let style = document.getElementById(
      'report-designer-critical-css'
    ) as HTMLStyleElement
    if (!style) {
      style = document.createElement('style')
      style.id = 'report-designer-critical-css'
      style.textContent = `
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background-color: #ffffff !important;
        }
        html {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background-color: #ffffff !important;
        }
        #root {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #ffffff !important;
        }
      `
      document.head.insertBefore(style, document.head.firstChild)
    }

    return () => {
      // Remove critical CSS on unmount
      const existingStyle = document.getElementById(
        'report-designer-critical-css'
      )
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle)
      }
    }
  }, [])

  // Debug: Log the report name to verify it's being read correctly
  useEffect(() => {
    console.log('Report Designer - reportName:', reportName)
    console.log('Report Designer - newReport:', newReport)
  }, [reportName, newReport])

  // Get data from location state or URL params
  const data = (location.state as { data?: any })?.data || null

  // Use query to fetch report (with caching for fast loading)
  const {
    data: reportResponse,
    isLoading: isLoadingReport,
    error: reportError,
  } = useGetReport(reportName, !newReport && !!reportName)

  const saveReportMutation = useSaveReport()

  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

  useEffect(() => {
    // Initialize designer only once
    if (!designerRef.current) {
      // Set Portuguese (Portugal) localization BEFORE creating designer
      // This must be done before the designer is instantiated
      try {
        console.log('Setting Portuguese (Portugal) localization...')
        // Add and load the localization file from server
        Stimulsoft.Base.Localization.StiLocalization.addLocalizationFile(
          '/Localizations/pt-PT.xml',
          true, // load from server
          'Portuguese (Portugal)'
        )
        // Set it as the active localization
        Stimulsoft.Base.Localization.StiLocalization.setLocalizationFile(
          '/Localizations/pt-PT.xml'
        )
        console.log('Portuguese (Portugal) localization set successfully')
      } catch (error) {
        console.error(
          'Failed to set Portuguese (Portugal) localization:',
          error
        )
      }

      const options = new Stimulsoft.Designer.StiDesignerOptions()
      designerRef.current = new Stimulsoft.Designer.StiDesigner(
        options,
        'StiDesigner',
        false
      )
    }

    const refreshReport = async () => {
      try {
        setIsLoading(true)

        if (!designerRef.current) return

        // Don't proceed if we're still loading the report (unless it's a new report)
        if (reportName && !newReport && isLoadingReport) {
          setIsLoading(false)
          return
        }

        // Save As handler - allows user to specify a new name
        designerRef.current.onSaveAsReport = function (args: any) {
          const report = args.report
          // Synchronize the report dictionary to ensure all properties (including colors) are saved
          // This ensures that all style properties, including colors, are properly serialized
          report.dictionary.synchronize()
          const str = report.saveToJsonString()

          // Get the filename from args.fileName (what user typed in the prompt)
          // This is the most important - it's what the user actually specified
          let filename = args.fileName

          // If no fileName in args, try reportName from URL, then fallback
          if (!filename) {
            filename = reportName || 'NewReport.mrt'
          }

          // Remove .mrt extension if present, then add it back to ensure consistency
          filename = filename.replace(/\.mrt$/i, '')
          const filenameWithExt = `${filename}.mrt`

          // Update the report's internal fileName and reportName
          // This ensures that the next time the user clicks Save, it uses this name
          ;(report as any).fileName = filenameWithExt
          ;(report as any).reportName = filename

          const saveData = {
            filename: filenameWithExt,
            content: b64EncodeUnicode(str),
          }

          console.log('Saving report as (Save As):', filenameWithExt)
          console.log('args.fileName:', args.fileName)
          console.log('Final filename:', filenameWithExt)

          saveReportMutation.mutate(saveData)
          // Mark as processed to prevent default behavior
          args.processed = true
        }

        // Save handler - always saves to the existing report name
        designerRef.current.onSaveReport = function (args: any) {
          const report = args.report
          // Synchronize the report dictionary to ensure all properties (including colors) are saved
          // This ensures that all style properties, including colors, are properly serialized
          report.dictionary.synchronize()
          const str = report.saveToJsonString()

          // Get the current fileName from the report (set by onSaveAsReport or when loading)
          const reportFileName = (report as any).fileName
          const reportReportName = (report as any).reportName

          // For new reports that haven't been saved yet (no fileName set),
          // don't process this event - let Stimulsoft show the Save As dialog
          if (
            !reportName &&
            !reportFileName &&
            !reportReportName &&
            !args.fileName
          ) {
            console.log('New report - letting Stimulsoft show Save As dialog')
            args.processed = false
            return
          }

          // Priority order:
          // 1. args.fileName (if user specified in prompt)
          // 2. reportName from URL (if opened from existing report)
          // 3. report.fileName (set from previous Save As)
          // 4. report.reportName (set from previous Save As)
          let filename =
            args.fileName ||
            reportName ||
            reportFileName ||
            reportReportName ||
            'NewReport.mrt'

          // Ensure .mrt extension
          const filenameWithExt = filename.endsWith('.mrt')
            ? filename
            : `${filename}.mrt`

          // Update report's internal name to keep it in sync
          ;(report as any).fileName = filenameWithExt
          const reportNameWithoutExt = filenameWithExt.replace(/\.mrt$/i, '')
          ;(report as any).reportName = reportNameWithoutExt

          const saveData = {
            filename: filenameWithExt,
            content: b64EncodeUnicode(str),
          }

          console.log('Saving report to (Save):', filenameWithExt)
          console.log('args.fileName:', args.fileName)
          console.log('reportName from URL:', reportName)
          console.log('report.fileName:', reportFileName)
          console.log('report.reportName:', reportReportName)

          saveReportMutation.mutate(saveData)
          // Prevent the default save dialog since we're handling it
          args.processed = true
        }

        const report = Stimulsoft.Report.StiReport.createNewReport()

        // Load report if reportName is provided (and it's not explicitly a new report)
        // Only proceed if we have the report data OR if it's a new report
        if (reportName && !newReport) {
          // If we're still loading, wait
          if (isLoadingReport) {
            setIsLoading(false)
            return
          }

          // If there's an error, show it but continue with empty report
          if (reportError) {
            console.error('Error loading report:', reportError)
            // Continue with empty report
          } else if (reportResponse) {
            try {
              console.log('Loading report:', reportName)
              console.log('Report API response:', reportResponse)
              console.log('response.info type:', typeof reportResponse.info)
              console.log('response.info:', reportResponse.info)

              // Extract report JSON string from response
              // The API now returns: { info: { data: string, messages: Record<string, string[]>, status: 0|1|2 } }
              // http-client wraps it, so response.info = { data: ..., messages: ..., status: ... }
              let reportJsonString: string | null = null

              if (!reportResponse.info) {
                console.error('Response has no info property:', reportResponse)
                reportJsonString = null
              } else {
                const responseInfo: any = reportResponse.info

                // Check if response.info is a GSResponse<string> with status field
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
                    status: 0 | 1 | 2
                  }

                  // Check status: 0 = Success, 1 = PartialSuccess, 2 = Failure
                  if (apiResponse.status !== 0 || !apiResponse.data) {
                    // Extract error messages from the messages object
                    const errorMessages: string[] = []
                    if (apiResponse.messages) {
                      Object.values(apiResponse.messages).forEach(
                        (msgArray) => {
                          if (Array.isArray(msgArray)) {
                            errorMessages.push(...msgArray)
                          }
                        }
                      )
                    }
                    const errorMessage =
                      errorMessages.length > 0
                        ? errorMessages.join(', ')
                        : 'Erro ao carregar relatório'
                    console.error('API returned error:', errorMessage)
                    reportJsonString = null
                  } else {
                    reportJsonString = apiResponse.data
                    console.log(
                      'Extracted report JSON string (new format, first 100 chars):',
                      reportJsonString.substring(0, 100)
                    )
                  }
                } else if (typeof responseInfo === 'string') {
                  // Legacy fallback: if info is directly a string
                  reportJsonString = responseInfo
                  console.log(
                    'Report JSON string (string type, first 100 chars):',
                    responseInfo.substring(0, 100)
                  )
                } else {
                  console.error(
                    'Unexpected response structure:',
                    reportResponse
                  )
                  reportJsonString = null
                }
              }

              if (reportJsonString) {
                console.log(
                  'Loading report into Stimulsoft, length:',
                  reportJsonString.length
                )
                report.load(reportJsonString)

                // Set the report name and fileName in Stimulsoft so it knows what file to save to
                // Keep the .mrt extension for fileName (Stimulsoft expects it)
                const reportFileName = reportName.endsWith('.mrt')
                  ? reportName
                  : `${reportName}.mrt`
                ;(report as any).fileName = reportFileName
                // Remove .mrt extension for reportName (internal name)
                const reportNameWithoutExt = reportName.replace(/\.mrt$/i, '')
                ;(report as any).reportName = reportNameWithoutExt
                console.log(
                  'Report loaded successfully into Stimulsoft, fileName set to:',
                  reportFileName
                )
              } else {
                console.error(
                  'Failed to extract report data from response:',
                  reportResponse
                )
              }
            } catch (error) {
              console.error('Error loading report:', error)
              // Show error to user (you might want to add a toast notification here)
            }
          }
        } else if (!reportName || newReport) {
          // Used to refresh the designer for new reports
          console.log('Creating new report (no reportName or newReport=true)')
          await sleep(0)
        }

        designerRef.current.report = report
        designerRef.current.report.culture = 'pt-PT'

        // Register real data if provided
        // Users can manually create data source structure in the designer if no data is provided
        if (data && data.length > 0) {
          // Determine the correct data source name
          // For JSON data sources, Stimulsoft uses "root" as the data source name
          // The template structure is: entity [json] -> root -> root.field1, root.field2, etc.
          // We'll detect it from the template or use "root" as default
          let dataSourceName = 'root' // Default for JSON data sources
          if (report.dictionary.dataSources.count > 0) {
            const firstDataSource = report.dictionary.dataSources.getByIndex(0)
            if (firstDataSource?.name) {
              dataSourceName = firstDataSource.name
            }
          }

          // Remove existing data source if it exists to ensure fresh registration
          const existingDataSource =
            designerRef.current.report.dictionary.dataSources.getByName(
              dataSourceName
            )
          if (existingDataSource) {
            const index =
              designerRef.current.report.dictionary.dataSources.indexOf(
                existingDataSource
              )
            if (index >= 0) {
              designerRef.current.report.dictionary.dataSources.removeAt(index)
            }
          }

          // Register real data - this creates the data source structure
          designerRef.current.report.regData(
            dataSourceName,
            dataSourceName,
            data
          )

          console.log('Data registered in designer:', {
            recordCount: data.length,
            firstRecord: data[0],
          })
        }

        designerRef.current.report.dictionary.synchronize()
        designerRef.current.renderHtml('designerContent')
      } catch (error) {
        console.error('Error loading report:', error)
      } finally {
        setIsLoading(false)
        setIsInitialLoad(false)
      }
    }

    refreshReport()
  }, [
    reportName,
    newReport,
    data,
    reportResponse,
    isLoadingReport,
    reportError,
  ])

  // Determine if we should show the loader
  // Show loader immediately on mount, while loading report, or while initializing designer
  const showLoader = isInitialLoad || isLoading || isLoadingReport

  // Cleanup: restore original styles on unmount
  useEffect(() => {
    const originalBodyStyle = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow,
      backgroundColor: document.body.style.backgroundColor,
    }
    const originalHtmlStyle = {
      margin: document.documentElement.style.margin,
      padding: document.documentElement.style.padding,
      overflow: document.documentElement.style.overflow,
      backgroundColor: document.documentElement.style.backgroundColor,
    }
    const originalRootStyle = {
      margin: document.getElementById('root')?.style.margin || '',
      padding: document.getElementById('root')?.style.padding || '',
      backgroundColor:
        document.getElementById('root')?.style.backgroundColor || '',
    }

    return () => {
      // Restore original styles on unmount
      document.body.style.margin = originalBodyStyle.margin
      document.body.style.padding = originalBodyStyle.padding
      document.body.style.overflow = originalBodyStyle.overflow
      document.body.style.backgroundColor = originalBodyStyle.backgroundColor
      document.documentElement.style.margin = originalHtmlStyle.margin
      document.documentElement.style.padding = originalHtmlStyle.padding
      document.documentElement.style.overflow = originalHtmlStyle.overflow
      document.documentElement.style.backgroundColor =
        originalHtmlStyle.backgroundColor
      const rootEl = document.getElementById('root')
      if (rootEl) {
        rootEl.style.margin = originalRootStyle.margin
        rootEl.style.padding = originalRootStyle.padding
        rootEl.style.backgroundColor = originalRootStyle.backgroundColor
      }
    }
  }, [])

  return (
    <>
      {/* Critical CSS - applied immediately to prevent flash */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background-color: #ffffff !important;
        }
        html {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background-color: #ffffff !important;
        }
        #root {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #ffffff !important;
        }
      `,
        }}
      />
      <div
        style={{
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          position: 'relative',
        }}
      >
        <div
          id='designerContent'
          style={{
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
          }}
        />
        <AppLoader
          isLoading={showLoader}
          title={
            newReport ? 'A preparar designer...' : 'A carregar relatório...'
          }
          description={
            newReport
              ? 'A inicializar o designer de relatórios'
              : 'Por favor aguarde enquanto o relatório é carregado'
          }
          icon='spinner'
          className='bg-white'
        />
      </div>
    </>
  )
}
