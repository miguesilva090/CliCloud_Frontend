import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TIPO_ARTIGO_OPTIONS } from '@/types/dtos/stocks/artigo.dtos'

const TIPO_TODOS = '__all__'

export function ListagemArtigosFilterControls({
  table,
  apenasInativos,
  onApenasInativosChange,
  apenasDescontinuados,
  onApenasDescontinuadosChange,
  tipoArtigo,
  onTipoArtigoChange,
}: {
  table: any
  apenasInativos: boolean
  onApenasInativosChange: (value: boolean) => void
  apenasDescontinuados: boolean
  onApenasDescontinuadosChange: (value: boolean) => void
  tipoArtigo: number | undefined
  onTipoArtigoChange: (value: number | undefined) => void
}) {
  const descricao = (table.getColumn('descricao')?.getFilterValue() as string) ?? ''

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Descrição:</Label>
        <Input
          placeholder='Procurar por descrição...'
          value={descricao}
          onChange={(e) =>
            table.getColumn('descricao')?.setFilterValue(e.target.value)
          }
          className='w-full max-w-[280px] bg-background border border-input shadow-sm'
          maxLength={100}
        />
      </div>
      <div className='space-y-2'>
        <Label>Tipo:</Label>
        <Select
          value={tipoArtigo != null ? String(tipoArtigo) : TIPO_TODOS}
          onValueChange={(v) =>
            onTipoArtigoChange(v === TIPO_TODOS ? undefined : Number(v))
          }
        >
          <SelectTrigger className='w-full max-w-[200px]'>
            <SelectValue placeholder='Todos' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TIPO_TODOS}>Todos</SelectItem>
            {TIPO_ARTIGO_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={String(o.value)}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <Checkbox
            id='artigos-apenas-inativos'
            checked={apenasInativos}
            onCheckedChange={(checked) => onApenasInativosChange(checked === true)}
          />
          <Label htmlFor='artigos-apenas-inativos' className='font-normal'>
            Apenas inativos
          </Label>
        </div>
        <div className='flex items-center gap-2'>
          <Checkbox
            id='artigos-apenas-descontinuados'
            checked={apenasDescontinuados}
            onCheckedChange={(checked) =>
              onApenasDescontinuadosChange(checked === true)
            }
          />
          <Label htmlFor='artigos-apenas-descontinuados' className='font-normal'>
            Apenas descontinuados
          </Label>
        </div>
      </div>
    </div>
  )
}
