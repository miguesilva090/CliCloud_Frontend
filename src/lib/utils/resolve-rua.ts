import { AddressQuickCreateService } from '@/lib/services/utility/lookups/address-quick-create-client'
import { UtilityLookupsService } from '@/lib/services/utility/lookups'

/**
 * Normaliza o nome da rua para comparação (evita duplicados por maiúsculas/espaços).
 * - trim
 * - colapsa espaços múltiplos em um
 * - lowercase para comparação case-insensitive
 */
export function normalizeRuaForCompare(nome: string): string {
  return (nome ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

/**
 * Normaliza o nome da rua para gravar na BD (formatação consistente).
 * - trim
 * - colapsa espaços múltiplos em um
 */
export function normalizeRuaForStore(nome: string): string {
  return (nome ?? '').trim().replace(/\s+/g, ' ')
}

interface RuaLightItem {
  id: string
  nome?: string | null
  freguesiaId?: string | null
  codigoPostalId?: string | null
}

/**
 * Resolve nome da rua para ruaId:
 * - Procura rua existente (freguesiaId+CP ou só CP) com nome normalizado (case-insensitive, espaços)
 * - Se não existir, cria nova rua
 *
 * @param ruaNome - nome da rua (escrita livre)
 * @param codigoPostalId - obrigatório
 * @param freguesiaId - obrigatório para criar nova rua; se omitido, tenta obter da primeira rua com o mesmo CP
 */
export async function resolveRuaNomeToId(
  ruaNome: string,
  codigoPostalId: string,
  freguesiaId?: string
): Promise<string> {
  const nomeNorm = normalizeRuaForCompare(ruaNome)
  const nomeParaGravar = normalizeRuaForStore(ruaNome)
  if (!nomeParaGravar) throw new Error('Nome da rua é obrigatório.')

  const lookups = UtilityLookupsService('utility')
  const res = await lookups.getRuasLight('')
  const list = (res.info?.data ?? []) as RuaLightItem[]

  const guidEq = (a?: string | null, b?: string | null) =>
    (a ?? '').toLowerCase() === (b ?? '').toLowerCase()

  const filtered = list.filter((r) => {
    if (!guidEq(r.codigoPostalId, codigoPostalId)) return false
    if (freguesiaId && !guidEq(r.freguesiaId, freguesiaId)) return false
    return true
  })
  const found = filtered.find(
    (r) => normalizeRuaForCompare(r.nome ?? '') === nomeNorm
  )
  if (found) return found.id

  let fregParaCriar = freguesiaId
  if (!fregParaCriar) {
    const firstWithSameCp = filtered[0]
    fregParaCriar = firstWithSameCp?.freguesiaId ?? undefined
  }
  if (!fregParaCriar) {
    throw new Error(
      'Não existe nenhuma rua para este Código Postal. Adicione primeiro uma rua com este código postal ou selecione outro.'
    )
  }

  // Não bloqueamos aqui caso o formato venha inesperado:
  // deixamos o backend falhar com uma mensagem clara se os IDs não forem válidos.
  if (!codigoPostalId?.trim() || !fregParaCriar?.trim()) {
    throw new Error(
      'Não é possível criar a rua automaticamente: código postal e freguesia são obrigatórios.'
    )
  }

  const createService = AddressQuickCreateService('utility')
  const createRes = await createService.createRua({
    nome: nomeParaGravar,
    freguesiaId: fregParaCriar,
    codigoPostalId,
  })
  if (createRes.info?.data) return createRes.info.data as string
  const msg = createRes.info?.messages
    ? Object.values(createRes.info.messages).flat().join(', ')
    : 'Falha ao criar rua'
  throw new Error(msg)
}
