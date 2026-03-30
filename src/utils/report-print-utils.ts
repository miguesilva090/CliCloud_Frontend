import { ResponseStatus } from '@/types/api/responses'
import 'stimulsoft-reports-js/Css/stimulsoft.viewer.office2013.whiteblue.css'
import { Stimulsoft } from 'stimulsoft-reports-js/Scripts/stimulsoft.viewer'
import { ReportsService } from '@/lib/services/reports/reports-service'
import { toast } from './toast-utils'

// IMPORTANT: Do NOT import sample data utilities here
// The print function should ONLY use real data passed as parameter

/**
 * Recursively flattens nested objects into a single level
 * Uses the immediate nested object name as prefix (not the full path)
 *
 * Examples:
 * - { pais: { nome: "Portugal" } } → { paisNome: "Portugal" }
 * - { concelho: { distrito: { nome: "Lisboa" } } } → { distritoNome: "Lisboa" }
 * - { concelho: { distrito: { pais: { nome: "PT" } } } } → { paisNome: "PT" }
 *
 * This makes it easier to access in reports:
 * - root.distritoNome (not root.concelhoDistritoNome)
 * - root.paisNome (not root.concelhoDistritoPaisNome)
 *
 * @param obj - The object to flatten
 * @param result - Accumulator object for flattened properties
 * @returns Flattened object with all nested properties at root level
 */
function flattenObject(
  obj: any,
  result: Record<string, any> = {}
): Record<string, any> {
  if (obj === null || obj === undefined) {
    return result
  }

  // Handle Date objects - keep them as is
  if (obj instanceof Date) {
    return result
  }

  // Handle arrays - don't flatten arrays in report data
  if (Array.isArray(obj)) {
    return result
  }

  // Handle primitive values (string, number, boolean)
  if (typeof obj !== 'object') {
    return result
  }

  // Handle objects - recursively flatten nested properties
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      // Skip nested "id" fields that would conflict with existing foreign key fields
      // e.g., if we have "paisId" at root and "pais.id" in nested object,
      // skip "pais.id" to avoid conflict (paisId vs paisId)
      if (key === 'id' && result[`${key}Id`] !== undefined) {
        // Skip this nested id field as it conflicts with an existing foreign key field
        continue
      }

      // If value is an object (but not Date or Array), recursively flatten it
      // Use the immediate key name as prefix (not the full path)
      if (
        value !== null &&
        value !== undefined &&
        typeof value === 'object' &&
        !(value instanceof Date) &&
        !Array.isArray(value)
      ) {
        // Recursively flatten the nested object, using the key name as the prefix
        flattenNestedObject(value, key, result)
      } else {
        // Primitive value, array, Date, null, or undefined - add directly at root level
        // Only add if it doesn't conflict with an existing field (unless it's the same value)
        if (result[key] === undefined || result[key] === value) {
          result[key] = value
        }
      }
    }
  }

  return result
}

/**
 * Flattens a nested object using the parent key as prefix
 *
 * @param nestedObj - The nested object to flatten
 * @param parentKey - The key name of the parent (e.g., "pais", "distrito")
 * @param result - Accumulator object for flattened properties
 */
function flattenNestedObject(
  nestedObj: any,
  parentKey: string,
  result: Record<string, any> = {}
): void {
  if (nestedObj === null || nestedObj === undefined) {
    return
  }

  // Handle Date objects
  if (nestedObj instanceof Date) {
    result[parentKey] = nestedObj
    return
  }

  // Handle arrays
  if (Array.isArray(nestedObj)) {
    result[parentKey] = nestedObj
    return
  }

  // Handle primitive values
  if (typeof nestedObj !== 'object') {
    result[parentKey] = nestedObj
    return
  }

  // Handle nested objects - flatten each property with parentKey as prefix
  for (const key in nestedObj) {
    if (Object.prototype.hasOwnProperty.call(nestedObj, key)) {
      const value = nestedObj[key]
      const newKey = `${parentKey}${key.charAt(0).toUpperCase()}${key.slice(1)}`

      // Skip nested "id" fields that would conflict with existing foreign key fields
      if (key === 'id' && result[`${parentKey}Id`] !== undefined) {
        continue
      }

      // If value is an object (but not Date or Array), recursively flatten it
      // Use the immediate key name as prefix (not the full path)
      if (
        value !== null &&
        value !== undefined &&
        typeof value === 'object' &&
        !(value instanceof Date) &&
        !Array.isArray(value)
      ) {
        // Recursively flatten, but use the nested object's key name as prefix
        // e.g., if we have concelho.distrito.pais, use "pais" as prefix, not "distritoPais"
        flattenNestedObject(value, key, result)
      } else {
        // Primitive value - add with parentKey prefix
        // Only add if it doesn't conflict with an existing field (unless it's the same value)
        if (result[newKey] === undefined || result[newKey] === value) {
          result[newKey] = value
        }
      }
    }
  }
}

/**
 * Flattens an array of objects, applying flattenObject to each item
 *
 * @param data - Array of objects to flatten
 * @returns Array of flattened objects
 */
function flattenData(data: any[]): any[] {
  if (!Array.isArray(data)) {
    return data
  }

  return data.map((item) => flattenObject(item))
}

/**
 * Prints a Stimulsoft report by fetching it from the server and opening the print dialog
 *
 * IMPORTANT: This function always uses REAL data (never sample data).
 * The report template may have been designed with sample data in the designer,
 * but at print time, the data source is replaced with the actual data provided.
 *
 * @param reportName - Name of the report file (e.g., "Report.mrt" or "Report")
 * @param data - Real data to pass to the report (required for reports that use data sources)
 */
export async function printReport(
  reportName: string,
  data?: any
): Promise<void> {
  try {
    // Fetch the report from the server
    const response = await ReportsService('reportsList').getReport(reportName)

    // Extract the report JSON string from the response
    // The API now returns: { info: { data: string, messages: Record<string, string[]>, status: 0|1|2 } }
    // http-client wraps it, so response.info = { data: ..., messages: ..., status: ... }
    let reportJsonString: string

    if (!response.info) {
      console.error('Response has no info property:', response)
      toast.error('Formato de resposta inválido do servidor', 'Erro')
      return
    }

    const responseInfo = response.info

    // Check if response.info is a GSResponse<string> with status field
    if (
      typeof responseInfo === 'object' &&
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
      if (apiResponse.status !== ResponseStatus.Success || !apiResponse.data) {
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
        return
      }

      reportJsonString = apiResponse.data
    } else if (typeof responseInfo === 'string') {
      // Legacy fallback: if info is directly a string
      reportJsonString = responseInfo
    } else {
      console.error('Unexpected response structure:', response)
      toast.error('Formato de resposta inválido do servidor', 'Erro')
      return
    }

    // Create a new Stimulsoft report instance
    const report = Stimulsoft.Report.StiReport.createNewReport()

    // Inspect the report JSON to see what data sources it expects
    let detectedDataSourceName: string | null = null
    try {
      const reportJson = JSON.parse(reportJsonString)
      const dataSources = reportJson.Dictionary?.DataSources
      const dataSourceList = Array.isArray(dataSources)
        ? dataSources
        : dataSources
          ? Object.values(dataSources)
          : []

      // Use the first data source we find
      if (dataSourceList.length > 0) {
        const firstDs = dataSourceList[0] as any
        detectedDataSourceName = firstDs.Name || firstDs.name || 'root'
      }
    } catch (e) {
      // If parsing fails, we'll use 'root' as default
    }

    report.load(reportJsonString)
    report.culture = 'pt-PT'

    // Detect the actual data source name from the template
    // For JSON data sources, Stimulsoft often uses "root" as the data source name
    if (!detectedDataSourceName) {
      for (let i = 0; i < report.dictionary.dataSources.count; i++) {
        const ds = report.dictionary.dataSources.getByIndex(i)
        const dsName = ds?.name || ''
        if (dsName) {
          detectedDataSourceName = dsName
          break
        }
      }
    }

    // Register data if provided
    if (data) {
      // Use the detected data source name from the template
      // For JSON data sources, Stimulsoft uses "root" as the data source name
      // The template structure is: paises [json] -> root -> root.codigo, root.nome, etc.
      const dataSourceName = detectedDataSourceName || 'root'

      // CRITICAL: Remove ALL existing data sources to ensure no embedded sample data is used
      // This is especially important for nested objects (like pais) which may have their own
      // embedded sample data in the template
      const dataSourceCount = report.dictionary.dataSources.count

      // Remove all data sources (remove from end to avoid index shifting issues)
      for (let i = dataSourceCount - 1; i >= 0; i--) {
        const ds = report.dictionary.dataSources.getByIndex(i)
        if (ds) {
          report.dictionary.dataSources.removeAt(i)
        }
      }

      // CRITICAL: Also remove ALL relations to prevent cross-joins with nested objects
      // When Stimulsoft detects nested objects, it may create relations which cause
      // the nested data (like pais) to iterate separately, creating duplicate rows
      const relationsCount = report.dictionary.relations.count

      // Remove all relations (remove from end to avoid index shifting issues)
      for (let i = relationsCount - 1; i >= 0; i--) {
        const rel = report.dictionary.relations.getByIndex(i)
        if (rel) {
          report.dictionary.relations.removeAt(i)
        }
      }

      // Flatten the data to avoid nested objects and complex relations
      // This makes it much easier to work with in the report template
      // All nested properties are flattened to root level with prefixed names
      // e.g., { pais: { nome: "Portugal" } } becomes { paisNome: "Portugal" }
      console.log('=== Flattening data for report ===')
      const flattenedData = Array.isArray(data) ? flattenData(data) : data
      console.log('Data flattened:', {
        recordCount: Array.isArray(flattenedData) ? flattenedData.length : 0,
        firstRecord:
          Array.isArray(flattenedData) && flattenedData.length > 0
            ? flattenedData[0]
            : null,
        sampleKeys:
          Array.isArray(flattenedData) && flattenedData.length > 0
            ? Object.keys(flattenedData[0])
            : [],
      })
      console.log('Flattened data (full):', flattenedData)

      // Register the flattened data
      // All properties are now at root level, making it easy to access in the template
      // e.g., root.nome, root.paisNome, root.concelhoDistritoPaisNome, etc.
      report.regData(dataSourceName, dataSourceName, flattenedData)

      // Synchronize dictionary to ensure data source is available immediately
      report.dictionary.synchronize()
    }

    // Set report variables (you can customize these as needed)
    report.setVariable('nomeEntidade', 'Junta de Freguesia XPTO')
    report.setVariable('Licenciado', 'Licenciado à Junta de Freguesia XPTO')
    report.setVariable(
      'utilizadorPlataforma',
      'Utilizador da Junta de Freguesia XPTO'
    )

    // Since we're using flattened data, we only need the main data source
    // Remove all relations and extra data sources that might have been created
    const mainDataSourceName = detectedDataSourceName || 'root'

    // Remove all relations (not needed with flattened data)
    const relationsAfterSync = report.dictionary.relations.count
    if (relationsAfterSync > 0) {
      for (let i = relationsAfterSync - 1; i >= 0; i--) {
        report.dictionary.relations.removeAt(i)
      }
    }

    // Remove all data sources except the main one (flattened data doesn't need nested sources)
    const dataSourcesAfterSync = report.dictionary.dataSources.count

    for (let i = dataSourcesAfterSync - 1; i >= 0; i--) {
      const ds = report.dictionary.dataSources.getByIndex(i)
      if (ds && ds.name !== mainDataSourceName) {
        report.dictionary.dataSources.removeAt(i)
      }
    }

    // Render the report and then print it
    report.renderAsync(() => {
      try {
        // Use the print method to open the print dialog
        report.print()
      } catch (printError) {
        console.error('Error in print method:', printError)
        toast.error(
          'Erro ao abrir diálogo de impressão. Por favor, tente novamente.',
          'Erro'
        )
      }
    })
  } catch (error: any) {
    console.error('Error printing report:', error)
    const errorMessage =
      error?.message ||
      'Erro ao imprimir relatório. Por favor, tente novamente.'
    toast.error(errorMessage, 'Erro')
  }
}
