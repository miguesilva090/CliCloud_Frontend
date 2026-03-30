import {
  useDistritosLight,
  useConcelhosLight,
  useFreguesiasLight,
} from '@/lib/services/utility/lookups/lookups-queries'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormLike {
  watch: (name: string) => any
  setValue: (name: string, value: any) => void
}

export interface UseAddressCascadingLookupsOptions {
  /** Prefixo para campos aninhados (ex: 'morada' para morada.distritoId) */
  prefix?: string
}

/**
 * Hook para lookups de morada com dropdowns dependentes (País → Distrito → Concelho → Freguesia).
 * Filtra distritos pelo país selecionado, concelhos pelo distrito e freguesias pelo concelho.
 * Inclui handlers que limpam campos dependentes ao alterar o pai.
 */
export function useAddressCascadingLookups(
  form: FormLike,
  options?: UseAddressCascadingLookupsOptions
) {
  const prefix = options?.prefix ?? ''
  const field = (name: string) => (prefix ? `${prefix}.${name}` : name)

  const distritosQuery = useDistritosLight('')
  const concelhosQuery = useConcelhosLight('')
  const freguesiasQuery = useFreguesiasLight('')

  const paisId = form.watch(field('paisId')) as string | undefined
  const distritoId = form.watch(field('distritoId')) as string | undefined
  const concelhoId = form.watch(field('concelhoId')) as string | undefined

  const allDistritos = distritosQuery.data?.info?.data ?? []
  const distritos = paisId
    ? allDistritos.filter(
        (d: { paisId?: string | null }) => d.paisId === paisId
      )
    : []
  const allConcelhos = concelhosQuery.data?.info?.data ?? []
  const allFreguesias = freguesiasQuery.data?.info?.data ?? []

  const concelhos = distritoId
    ? allConcelhos.filter(
        (c: { distritoId?: string | null }) => c.distritoId === distritoId
      )
    : []
  const freguesias = concelhoId
    ? allFreguesias.filter(
        (f: { concelhoId?: string | null }) => f.concelhoId === concelhoId
      )
    : []

  const clearDependentFields = (
    from: 'pais' | 'distrito' | 'concelho' | 'freguesia'
  ) => {
    if (from === 'pais') {
      form.setValue(field('distritoId'), '')
      form.setValue(field('concelhoId'), '')
      form.setValue(field('freguesiaId'), '')
      form.setValue(field('codigoPostalId'), '')
      form.setValue(field('ruaId'), '')
      // Importante: manter o texto livre da rua (`rua`) para não disparar validações
      // do Zod antes do utilizador voltar a confirmá-la. O `ruaId` será resolvido/criado
      // no submit (se existir texto de rua e CP/Freguesia).
    } else if (from === 'distrito') {
      form.setValue(field('concelhoId'), '')
      form.setValue(field('freguesiaId'), '')
      form.setValue(field('codigoPostalId'), '')
      form.setValue(field('ruaId'), '')
      // Mantém `rua` (texto livre).
    } else if (from === 'concelho') {
      form.setValue(field('freguesiaId'), '')
      form.setValue(field('codigoPostalId'), '')
      form.setValue(field('ruaId'), '')
      // Mantém `rua` (texto livre).
    } else {
      form.setValue(field('codigoPostalId'), '')
      form.setValue(field('ruaId'), '')
      // Mantém `rua` (texto livre).
    }
  }

  const onPaisChange = (value: string) => {
    form.setValue(field('paisId'), value)
    clearDependentFields('pais')
  }

  const onDistritoChange = (value: string) => {
    form.setValue(field('distritoId'), value)
    clearDependentFields('distrito')
  }

  const onConcelhoChange = (value: string) => {
    form.setValue(field('concelhoId'), value)
    clearDependentFields('concelho')
  }

  const onFreguesiaChange = (value: string) => {
    form.setValue(field('freguesiaId'), value)
    clearDependentFields('freguesia')
  }

  return {
    distritos,
    concelhos,
    freguesias,
    paisId,
    distritoId,
    concelhoId,
    distritosQuery,
    concelhosQuery,
    freguesiasQuery,
    onPaisChange,
    onDistritoChange,
    onConcelhoChange,
    onFreguesiaChange,
  }
}
