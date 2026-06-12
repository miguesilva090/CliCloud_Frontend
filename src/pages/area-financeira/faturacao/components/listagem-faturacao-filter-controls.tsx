import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { inputClass } from '@/lib/form-styles'
import { useGetTiposDocumentoLight } from '../queries/tipo-documento-queries'

const ID_FUNCIONALIDADE = 'documentos'

export function ListagemFaturacaoFilterControls({
  table,
}: {
  table: any
  columns: any[]
  onApplyFilters: () => void
  onClearFilters: () => void
}) {
  const { data: tiposRes } = useGetTiposDocumentoLight('', ID_FUNCIONALIDADE)
  const tipos = (tiposRes?.info?.data ?? []).filter((t) => !t.inactivo)

  const numeroDe =
    (table.getColumn('numerodocumento_de')?.getFilterValue() as string) ?? ''
  const numeroAte =
    (table.getColumn('numerodocumento_ate')?.getFilterValue() as string) ?? ''
  const nomeClienteDe =
    (table.getColumn('nomecliente_de')?.getFilterValue() as string) ?? ''
  const nomeClienteAte =
    (table.getColumn('nomecliente_ate')?.getFilterValue() as string) ?? ''
  const dataDe =
    (table.getColumn('data_de')?.getFilterValue() as string) ?? ''
  const dataAte =
    (table.getColumn('data_ate')?.getFilterValue() as string) ?? ''
  const tipoDocumentoId =
    (table.getColumn('tipoDocumentoId')?.getFilterValue() as string) ?? ''
  const anulado =
    (table.getColumn('anulado')?.getFilterValue() as string) ?? ''
  const liquidado =
    (table.getColumn('liquidado')?.getFilterValue() as string) ?? ''

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label>N.º documento de</Label>
        <Input
          value={numeroDe}
          placeholder='Ex.: 1'
          onChange={(e) =>
            table.getColumn('numerodocumento_de')?.setFilterValue(e.target.value)
          }
          className={inputClass}
        />
      </div>
      <div className='space-y-2'>
        <Label>N.º documento até</Label>
        <Input
          value={numeroAte}
          placeholder='Ex.: 9999'
          onChange={(e) =>
            table
              .getColumn('numerodocumento_ate')
              ?.setFilterValue(e.target.value)
          }
          className={inputClass}
        />
      </div>
      <div className='space-y-2'>
        <Label>Data de</Label>
        <Input
          type='date'
          value={dataDe}
          onChange={(e) =>
            table.getColumn('data_de')?.setFilterValue(e.target.value)
          }
          className={inputClass}
        />
      </div>
      <div className='space-y-2'>
        <Label>Data até</Label>
        <Input
          type='date'
          value={dataAte}
          onChange={(e) =>
            table.getColumn('data_ate')?.setFilterValue(e.target.value)
          }
          className={inputClass}
        />
      </div>
      <div className='space-y-2'>
        <Label>Nome cliente de</Label>
        <Input
          value={nomeClienteDe}
          placeholder='Nome de…'
          onChange={(e) =>
            table.getColumn('nomecliente_de')?.setFilterValue(e.target.value)
          }
          className={inputClass}
        />
      </div>
      <div className='space-y-2'>
        <Label>Nome cliente até</Label>
        <Input
          value={nomeClienteAte}
          placeholder='Nome até…'
          onChange={(e) =>
            table.getColumn('nomecliente_ate')?.setFilterValue(e.target.value)
          }
          className={inputClass}
        />
      </div>
      <div className='space-y-2'>
        <Label>Tipo documento</Label>
        <Select
          value={tipoDocumentoId || '__all__'}
          onValueChange={(v) =>
            table
              .getColumn('tipoDocumentoId')
              ?.setFilterValue(v === '__all__' ? '' : v)
          }
        >
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder='Todos' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='__all__'>Todos</SelectItem>
            {tipos.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.abreviatura} — {t.descricao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Anulado</Label>
        <Select
          value={anulado || '__all__'}
          onValueChange={(v) =>
            table.getColumn('anulado')?.setFilterValue(v === '__all__' ? '' : v)
          }
        >
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder='Todos' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='__all__'>Todos</SelectItem>
            <SelectItem value='false'>Não anulados</SelectItem>
            <SelectItem value='true'>Anulados</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Liquidado</Label>
        <Select
          value={liquidado || '__all__'}
          onValueChange={(v) =>
            table.getColumn('liquidado')?.setFilterValue(v === '__all__' ? '' : v)
          }
        >
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder='Todos' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='__all__'>Todos</SelectItem>
            <SelectItem value='false'>Não liquidados</SelectItem>
            <SelectItem value='true'>Liquidados</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
