import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ReportsService } from '@/lib/services/reports/reports-service'
import { invalidateQueriesGlobally } from '@/utils/query-sync'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'

export interface SaveReportDTO {
  filename: string
  content: string
}

export const useRevertReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reportName: string) => {
      const response =
        await ReportsService('reportsList').revertReport(reportName)
      return handleApiResponse(
        response,
        'Relatório revertido para a versão original com sucesso',
        'Erro ao reverter relatório',
        'Relatório revertido com avisos'
      )
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate reports list to refresh
        invalidateQueriesGlobally(queryClient, [['reports-list']])
      }
    },
    onError: () => {
      toast.error('Falha ao reverter relatório')
    },
  })
}

export const useDeleteReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reportName: string) => {
      const response =
        await ReportsService('reportsList').deleteReport(reportName)
      return handleApiResponse(
        response,
        'Relatório apagado com sucesso',
        'Erro ao apagar relatório',
        'Relatório apagado com avisos'
      )
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate reports list to refresh
        invalidateQueriesGlobally(queryClient, [['reports-list']])
      }
    },
    onError: () => {
      toast.error('Falha ao apagar relatório')
    },
  })
}

export const useGetOriginalReports = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await ReportsService('reportsList').getOriginalReports()
      const result = handleApiResponse(
        response,
        'Relatórios originais obtidos com sucesso',
        'Erro ao obter relatórios originais',
        'Relatórios originais obtidos com avisos'
      )
      // Return both the result and the original response data
      return {
        ...result,
        originalResponse: response,
      }
    },
    onSuccess: async (result) => {
      if (result.success) {
        // Get current reports count before operation
        const currentReports =
          queryClient.getQueryData<string[]>(['reports-list']) || []
        const reportsBefore = currentReports.length

        // Get the list of added reports from the original response
        const addedReportsFromResponse =
          result.originalResponse?.info?.data || []

        // Invalidate and refetch reports list
        invalidateQueriesGlobally(queryClient, [['reports-list']])
        const updatedReports = await queryClient.fetchQuery<string[]>({
          queryKey: ['reports-list'],
          queryFn: async () => {
            const response = await ReportsService('reportsList').getAllReports()
            const reportData = response.info?.data || []
            return Array.isArray(reportData) ? reportData : []
          },
        })

        // Calculate how many reports were added
        const reportsAfter = updatedReports.length
        const reportsAdded = reportsAfter - reportsBefore

        // Show feedback based on what happened
        if (
          Array.isArray(addedReportsFromResponse) &&
          addedReportsFromResponse.length > 0
        ) {
          // API returned the list of copied reports
          toast.success(
            `${addedReportsFromResponse.length} relatório(s) original(is) adicionado(s)`
          )
        } else if (reportsAdded > 0) {
          // API didn't return the list, but we detected new reports
          toast.success(
            `${reportsAdded} relatório(s) original(is) adicionado(s)`
          )
        } else {
          // No new reports found
          toast.warning('Nenhum relatório original novo encontrado')
        }
      }
    },
    onError: () => {
      toast.error('Falha ao obter relatórios originais')
    },
  })
}

export const useSaveReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SaveReportDTO) => {
      const response = await ReportsService('reportsList').saveReport(data)
      return handleApiResponse(
        response,
        'Relatório guardado com sucesso',
        'Erro ao guardar relatório',
        'Relatório guardado com avisos'
      )
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Extract report name from filename (remove .mrt extension)
        const reportName = variables.filename.replace(/\.mrt$/i, '')

        // Invalidate the specific report query and reports list
        invalidateQueriesGlobally(queryClient, [
          ['report', reportName],
          ['reports-list'],
        ])
      }
    },
    onError: () => {
      toast.error('Falha ao guardar relatório')
    },
  })
}
