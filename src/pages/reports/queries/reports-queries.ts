import { useQuery } from '@tanstack/react-query'
import { ReportsService } from '@/lib/services/reports/reports-service'

export const useGetAllReports = () => {
  return useQuery({
    queryKey: ['reports-list'],
    queryFn: async () => {
      const response = await ReportsService('reportsList').getAllReports()
      const reportData = response.info?.data || []
      return Array.isArray(reportData) ? reportData : []
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: (query) => {
      // If there's an error, retry every 5 seconds
      if (query.state.error) {
        return 5000
      }
      // Otherwise, don't auto-refetch
      return false
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useGetReport = (
  reportName: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['report', reportName],
    queryFn: async () => {
      if (!reportName) {
        throw new Error('Report name is required')
      }
      const response = await ReportsService('reportsList').getReport(reportName)
      return response
    },
    enabled: enabled && !!reportName,
    // Aggressive caching for fast loading
    staleTime: 10 * 60 * 1000, // 10 minutes - reports don't change often
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    // Use placeholder data to show cached data immediately
    placeholderData: (previousData) => previousData,
    // Retry on error
    retry: 2,
    retryDelay: 1000,
  })
}
