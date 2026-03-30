import { useState } from 'react'
import { printReport } from '@/utils/report-print-utils'

/**
 * Custom hook for printing reports
 * Provides a reusable print handler with loading state management
 *
 * @param reportName - The name of the report file (e.g., 'listagem-paises', 'listar-pais')
 * @returns Object with print handler and loading state
 */
export function useReportPrint(reportName: string) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async (data: any[]) => {
    if (!reportName) {
      console.error('Report name is required')
      return
    }

    setIsPrinting(true)
    try {
      await printReport(reportName, data)
    } catch (error) {
      console.error('Error printing report:', error)
      throw error
    } finally {
      setIsPrinting(false)
    }
  }

  return {
    handlePrint,
    isPrinting,
  }
}
