import state from '@/states/state'
import { GSResponse, GSGenericResponse } from '@/types/api/responses'
import { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import { ReportsError } from './reports-errors'

export interface SaveReportDTO {
  filename: string
  content: string
}

export class ReportsClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  /**
   * Get all reports
   */
  public async getAllReports(): Promise<ResponseApi<GSResponse<string[]>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.getRequest<GSResponse<string[]>>(
          state.URL,
          '/client/reports'
        )

        if (!response.info) {
          throw new ReportsError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ReportsError('Falha ao obter relatórios', undefined, error)
      }
    })
  }

  /**
   * Get a report by name
   */
  public async getReport(
    reportName: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.getRequest<GSResponse<string>>(
          state.URL,
          `/client/reports/${reportName}`
        )

        if (!response.info) {
          throw new ReportsError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ReportsError('Falha ao obter relatório', undefined, error)
      }
    })
  }

  /**
   * Save a report
   */
  public async saveReport(
    data: SaveReportDTO
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.postRequest<
          SaveReportDTO,
          GSResponse<string>
        >(state.URL, '/client/reports', data)

        if (!response.info) {
          throw new ReportsError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ReportsError('Falha ao gravar relatório', undefined, error)
      }
    })
  }

  /**
   * Revert a report to its original version
   * Copies the report from reports-originais folder to reports folder
   */
  public async revertReport(
    reportName: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.postRequest<
          { reportName: string },
          GSResponse<string>
        >(state.URL, '/client/reports/revert', { reportName })

        if (!response.info) {
          throw new ReportsError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ReportsError('Falha ao reverter relatório', undefined, error)
      }
    })
  }

  /**
   * Get original reports that don't exist in reports folder
   * Copies reports from reports-originais folder to reports folder
   * Only copies reports that don't already exist in reports folder
   */
  public async getOriginalReports(): Promise<
    ResponseApi<GSResponse<string[]>>
  > {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.postRequest<
          {},
          GSResponse<string[]>
        >(state.URL, '/client/reports/get-originals', {})

        if (!response.info) {
          throw new ReportsError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ReportsError(
          'Falha ao obter relatórios originais',
          undefined,
          error
        )
      }
    })
  }

  /**
   * Delete a report
   * Deletes the report from the reports folder
   */
  public async deleteReport(
    reportName: string
  ): Promise<ResponseApi<GSGenericResponse>> {
    return this.withRetry(async () => {
      try {
        const response = await this.httpClient.deleteRequest<GSGenericResponse>(
          state.URL,
          `/client/reports/${reportName}`
        )

        if (!response.info) {
          throw new ReportsError('Formato de resposta inválido')
        }

        return response
      } catch (error) {
        throw new ReportsError('Falha ao apagar relatório', undefined, error)
      }
    })
  }
}
