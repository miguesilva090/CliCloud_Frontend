import { MedicamentosInfarmedService } from '@/lib/services/prescricao/medicamentos-infarmed-service'
import { calcularTotaisLinha } from '@/pages/area-clinica/processo-clinico/atendimento/ficha-clinica/utils/calcular-totais-linha'
import { ResponseStatus } from '@/types/api/responses'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import { extrairDiplomaDePrescricao } from './diploma-despacho'

/** Se a linha tem embId e ainda sem PVP, completa via ficha Infarmed. */
export async function enrichLinhasPrecos<T extends CreateReceitaLinhaRequest>(
  linhas: T[],
  patologias?: string
): Promise<T[]> {
  const client = MedicamentosInfarmedService()

  return Promise.all(
    linhas.map(async (l) => {
      if (l.pvp != null || !l.embId?.trim()) return l

      try {
        const res = await client.getPrescricaoByEmbId(l.embId, patologias)
        const envelope = res.info
        if (
          !envelope ||
          envelope.status !== ResponseStatus.Success ||
          !envelope.data
        ) {
          return l
        }

        const totais = calcularTotaisLinha(envelope.data, l.quantidade || 1)
        if (!totais) return l

        return {
          ...l,
          pvp: totais.pvp,
          comparticipacao: totais.psns,
          valorUtente: totais.put,
          cnpem: l.cnpem ?? envelope.data.cnpem ?? null,
          descricaoEmbalagem:
            l.descricaoEmbalagem ?? envelope.data.embalagem ?? null,
          diploma:
            l.diploma ??
            extrairDiplomaDePrescricao(
              envelope.data,
              l.codTipoPrescricao === 2
            ),
        }
      } catch {
        return l
      }
    })
  )
}
