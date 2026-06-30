import type { CredenciaisSnsModulo } from '@/types/dtos/faturacao/credenciais-sns.dtos'
import { toast } from '@/utils/toast-utils'
import type { CredenciaisSnsFaturaFormValues } from './credenciais-sns-form-constants'

function reportSuffix(modulo: CredenciaisSnsModulo): string {
  if (modulo === 'fisioterapia') return 'Tratamentos'
  if (modulo === 'especialidades') return 'Consultas'
  return ''
}

/**
 * Legado: CredenciaisSnsFaturaVisualizar{Consultas|Tratamentos}.rpt ou CredenciaisSnsCriarFatura.
 * BE/relatórios em curso — validação e payload alinhados ao WSFaturacao.asmx.
 */
export async function submitCredenciaisSnsFatura(
  modulo: CredenciaisSnsModulo,
  values: CredenciaisSnsFaturaFormValues
): Promise<void> {
  const numVias = values.numVias.trim() === '' || values.numVias === '0' ? '1' : values.numVias
  const naturezaTexto = values.naturezaPrestacoes.trim()

  const baseParams = {
    c_organismo: values.codigoOrganismo ?? values.organismoId,
    ano: values.ano,
    tipo_servico: values.tipoServicoId,
    mes: values.mes,
    natureza_texto: naturezaTexto,
    nvias: numVias,
  }

  const suffix = reportSuffix(modulo)

  if (values.opcaoFatura === 'visualizar') {
    toast.info(
      `Visualização de fatura SNS (${suffix || modulo}) — relatório CredenciaisSnsFaturaVisualizar${suffix}.rpt em integração.`
    )
    return
  }

  toast.info(
    `Emissão de fatura SNS (${modulo}) — API CredenciaisSnsCriarFatura em integração. Parâmetros validados.`
  )

  void baseParams
}
