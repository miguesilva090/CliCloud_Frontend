import type { EntidadeContactoDTO } from '@/types/dtos/saude/utentes.dtos'

/** Contacto principal do utente para SMS (legado: tipo 1 = telefone). */
export function pickUtenteTelefone(
  contactos?: EntidadeContactoDTO[] | null
): string {
  if (!contactos?.length) return ''

  const comValor = contactos.filter((c) => c.valor?.trim())
  const principal = comValor.find((c) => c.principal)
  if (principal?.valor?.trim()) return principal.valor.trim()

  const telefone = comValor.find((c) => c.entidadeContactoTipoId === 1)
  if (telefone?.valor?.trim()) return telefone.valor.trim()

  return comValor[0]?.valor?.trim() ?? ''
}
