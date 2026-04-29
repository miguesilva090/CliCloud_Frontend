import { useMemo, useState } from 'react'
import { useRuasLight } from '@/lib/services/utility/lookups/lookups-queries'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type AddressFormLike = {
    watch: (name: string) => unknown
    setValue: (name: string, value: unknown) => void
}

export function RuaSelectInferCodigoPostal({
    form,
    readOnly,
}: {
    form: AddressFormLike
    readOnly?: boolean
}) {
    const freguesiaId = (form.watch('freguesiaId') as string | null | undefined) ?? ''
    const ruaId = (form.watch('ruaId') as string | null | undefined) ?? ''

    const [ruaQ] = useState('')
    const ruasQuery = useRuasLight(ruaQ)
    const ruas = ruasQuery.data?.info?.data ?? []

    const selectedRua = ruaId ? ruas.find((r) => String(r.id) === String(ruaId)) : undefined

    const hasFreguesia = !!freguesiaId

    const ruasDaFreguesia = useMemo(() => {
        if (!hasFreguesia) return ruas
        return ruas.filter((r) => String(r.freguesiaId ?? '') === String(freguesiaId))

    }, [ruas, freguesiaId, hasFreguesia])

    const ruasParaMostrar = useMemo(() => {
        if (!selectedRua) return ruasDaFreguesia
        const exists = ruasDaFreguesia.some((r) => String(r.id) === String(selectedRua.id))
        return exists ? ruasDaFreguesia : [...ruasDaFreguesia, selectedRua]
    }, [ruasDaFreguesia, selectedRua])

    const isDisabled = !!readOnly 

    return (
        <Select 
            value = {ruaId ?? ''}
            onValueChange = {(next) => {
                const rua = ruas.find((r) => String(r.id) === String(next))
                if (!rua) return 

                form.setValue('ruaId', String(rua.id))
                form.setValue('rua', rua.nome ?? '')
                form.setValue('codigoPostalId', rua.codigoPostalId ? String(rua.codigoPostalId) : '')
            }}
            disabled = {isDisabled || ruasQuery.isLoading}
            >
                <SelectTrigger className='h-7 w-full min-w-0'>
                    <SelectValue placeholder={freguesiaId ? 'Selecionar rua...' : 'Selecionar primeiro a freguesia'} />
                </SelectTrigger>

                <SelectContent>
                    {ruasParaMostrar.length === 0 ? (
                        // Radix Select não permite <SelectItem value=""> (string vazia).
                        // Usamos um valor "placeholder" não-vazio e desabilitado.
                        <SelectItem value='__no_ruas__' disabled>
                            Sem Ruas
                        </SelectItem>
                    ): (
                        ruasParaMostrar.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                                {r.nome ?? r.id}
                                {r.codigoPostalCodigo ? ` - CP ${r.codigoPostalCodigo}` : ''}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
    )
}