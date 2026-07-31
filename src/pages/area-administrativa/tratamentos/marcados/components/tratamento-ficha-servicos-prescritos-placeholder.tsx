import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/** Ficha-A: tab alinhada ao legado; CRUD chega na Ficha-B. */
export function TratamentoFichaServicosPrescritosPlaceholder() {
  return (
    <Alert>
      <AlertTitle>Serviços Prescritos</AlertTitle>
      <AlertDescription>
        Esta tab corresponde aos serviços prescritos do legado. A gestão
        (inserir / editar / remover) será disponibilizada na próxima fatia
        (Ficha-B).
      </AlertDescription>
    </Alert>
  )
}
