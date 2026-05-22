import type { PedidoConsultaUtentesCandidatosDTO } from '@/types/dtos/consultas/pedidos-consulta-administrativo.dtos'

export function buildUtenteCandidatosConfirmMessage(
  data: PedidoConsultaUtentesCandidatosDTO
): string {
  const lines: string[] = []
  if (data.existeNif) lines.push('Este NIF está associado a uma ficha de utente.')
  if (data.existeNome) lines.push('Já existe um nome igual numa ficha de utente.')
  if (data.existeEmail) lines.push('Este email está associado a uma ficha de utente.')
  if (data.existeTelemovel) {
    lines.push('Este contacto está associado a uma ficha de utente.')
  }

  const u = data.utentes[0]
  if (u) {
    lines.push('')
    if (u.numeroUtente) lines.push(`Código: ${u.numeroUtente}`)
    if (u.nome) lines.push(`Nome: ${u.nome}`)
    if (u.numeroContribuinte) lines.push(`NIF: ${u.numeroContribuinte}`)
  }

  lines.push('', 'Pretende guardar novo registo mesmo assim?')
  return lines.join('\n')
}
