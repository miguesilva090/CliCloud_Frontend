import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { DisponibilidadeTecnicoTratamentoService } from "@/lib/services/tratamentos/disponibilidade-tecnico-tratamento-service"
import { ResponseStatus } from "@/types/api/responses"

type Props = {
    enabled: boolean 
    tecnicoId: string
    idFuncionalidade: string
    value: number
    onChange: (v: number) => void
    label?: string
}

export function TecnicoUnidadeTempoField({
    enabled,
    tecnicoId,
    idFuncionalidade,
    value,
    onChange,
    label = "U.Tempo",
}: Props) {
    const canQuery = enabled && !!tecnicoId
    const unidadesQ = useQuery({
        queryKey: ["disp-utempo-field", idFuncionalidade, tecnicoId],
        enabled: canQuery,
        queryFn: async () => {
            const res = await DisponibilidadeTecnicoTratamentoService(
                idFuncionalidade
            ).getUnidadesTempo(tecnicoId)
            if (res.info?.status !== ResponseStatus.Success) return [1]
            const list = res.info.data?.unidadesTempo
            return list?.length ? list : [1]
        },
    })

    const unidades = unidadesQ.data ?? [1]

    useEffect(() => {
        if (!canQuery) return
        if (!unidades.includes(value)) onChange(unidades[0] ?? 1)
    }, [canQuery, unidades, value, onChange])

    return (
        <div className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <Select 
                value={String(value)}
                disabled={!canQuery || unidadesQ.isFetching}
                onValueChange={(v) => onChange(Number(v) || 1)}
            >
                <SelectTrigger className="h-8">
                    <SelectValue placeholder="U.Tempo" />
                </SelectTrigger>
                <SelectContent>
                    {unidades.map((u) => (
                        <SelectItem key={u} value={String(u)}>
                            {u}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}