import type { GerarFicheiroEletronicoResponse } from '@/types/dtos/faturacao/ficheiros-eletronicos.dtos'

export function downloadFicheiroEletronicoGerado(res: GerarFicheiroEletronicoResponse) {
  const link = document.createElement('a')
  link.href = `data:application/octet-stream;base64,${res.ficheiroBase64}`
  link.download = `${res.nome}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buffer)
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}
