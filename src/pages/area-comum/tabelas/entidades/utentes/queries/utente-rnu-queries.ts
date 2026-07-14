import type {
  ConsultarUtenteRnuResponse,
} from '@/types/dtos/saude/utente-rnu.dtos'

export function aplicarRnuNoFormulario(
  rnu: ConsultarUtenteRnuResponse,
  setValue: (name: string, value: unknown, opts?: { shouldValidate?: boolean; shouldDirty?: boolean }) => void,
  getValue: (name: string) => unknown,
) {
  const setIfEmpty = (field: string, value: unknown) => {
    const current = getValue(field)
    const empty =
      current == null ||
      current === '' ||
      (typeof current === 'string' && current.trim() === '')

    if (empty && value != null && value !== '') {
      setValue(field, value, { shouldDirty: true })
    }
  }

  setIfEmpty('nome', rnu.nomeCompleto ?? '')
  setIfEmpty('numeroUtente', rnu.numeroSns ?? '')
}

export { useConsultarUtenteRnu } from './utente-rnu-mutations'
