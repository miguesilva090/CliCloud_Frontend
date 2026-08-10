import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/ui/date-picker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    calcularTotaisReceita,
    formatEuro,
    type LinhaComPrecos,
} from "../utils/calcular-totais-receita"
import { TIPOS_RECEITA } from "../utils/tipo-receita-options"

type Props = {
    numeroReceitaLocal: string | null
    numeroReceita: string | null
    dataPrescricao: Date | undefined
    onDataPrescricaoChange: (date: Date | undefined) => void
    tipoReceita: number
    onTipoReceitaChange: (v: number) => void
    numeroVias: number 
    onNumeroViasChange: (v: number) => void
    receitaRenovavel: number
    onReceitaRenovavelChange: (v: number) => void
    linhas: LinhaComPrecos[]
    readOnly?: boolean
}

export function ReceitaCabecalho({
    numeroReceitaLocal,
    numeroReceita,
    dataPrescricao,
    onDataPrescricaoChange,
    tipoReceita,
    onTipoReceitaChange,
    numeroVias,
    onNumeroViasChange,
    receitaRenovavel,
    onReceitaRenovavelChange,
    linhas,
    readOnly,
}: Props) {
    const totais = calcularTotaisReceita(linhas)

    return (
        <div className='flex flex-wrap items-start justify-between gap-3 rounded-md border bg-muted/20 p-3'>
          <div className='grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Número</Label>
              <p className='text-sm font-medium'>{numeroReceitaLocal ?? '—'}</p>
              {numeroReceita ? (
                <p className='text-xs text-muted-foreground'>SPMS: {numeroReceita}</p>
              ) : null}
            </div>
            <div className='space-y-1'>
              <Label>Data</Label>
              <DatePicker
                value={dataPrescricao}
                onChange={onDataPrescricaoChange}
                disabled={readOnly}
              />
            </div>
            <div className='space-y-1 sm:col-span-2'>
              <Label>Tipo de receita</Label>
              <Select
                value={String(tipoReceita)}
                disabled={readOnly}
                onValueChange={(v) => onTipoReceitaChange(Number(v))}
              >
                <SelectTrigger className='h-8'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_RECEITA.map((t) => (
                    <SelectItem key={t.value} value={String(t.value)}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='max-w-[120px] space-y-1'>
              <Label>Nº de vias</Label>
              <Input
                className='h-8'
                type='number'
                min={1}
                value={numeroVias}
                disabled={readOnly}
                onChange={(e) => onNumeroViasChange(Number(e.target.value) || 1)}
              />
            </div>
            <div className='flex items-center gap-2 pt-6'>
              <Checkbox
                id='receita-renovavel'
                checked={receitaRenovavel === 1}
                disabled={readOnly}
                onCheckedChange={(c) =>
                  onReceitaRenovavelChange(c === true ? 1 : 0)
                }
              />
              <Label htmlFor='receita-renovavel'>Renovável</Label>
            </div>
          </div>
          <div className='min-w-[200px] rounded-md border px-3 py-2 text-sm'>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Total Comparticipação</span>
              <span className='font-medium'>
                {formatEuro(totais.totalComparticipacao)}
              </span>
            </div>
            <div className='flex justify-between gap-4'>
              <span className='text-muted-foreground'>Total Receita</span>
              <span className='font-medium'>{formatEuro(totais.totalReceita)}</span>
            </div>
          </div>
        </div>
    )
}