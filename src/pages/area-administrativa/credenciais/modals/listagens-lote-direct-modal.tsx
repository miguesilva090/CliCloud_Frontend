import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { inputClass, labelClass } from '@/lib/form-styles'
import {
  emitirListagemLoteDirect,
  type ListagemLoteDirectReportTipo,
} from '../utils/credenciais-legado-relatorios'

const TIPOS: { value: ListagemLoteDirectReportTipo; label: string }[] = [
  { value: '1', label: 'Por código / lote / organismo' },
  { value: '2', label: 'Etiquetas P1 impressora' },
  { value: '3', label: 'Etiquetas P1 NIF' },
  { value: '4', label: 'Centro saúde discriminado' },
  { value: '5', label: 'Centro saúde quantidades' },
  { value: '6', label: 'Por médico' },
  { value: '7', label: 'Por médico externo' },
]

export function ListagensLoteDirectModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const now = new Date()
  const [tipo, setTipo] = useState<ListagemLoteDirectReportTipo>('1')
  const [mesDe, setMesDe] = useState('1')
  const [mesAte, setMesAte] = useState(String(now.getMonth() + 1))
  const [anoDe, setAnoDe] = useState(String(now.getFullYear()))
  const [anoAte, setAnoAte] = useState(String(now.getFullYear()))
  const [nloteDe, setNloteDe] = useState('')
  const [nloteAte, setNloteAte] = useState('')
  const [codigoOrganismo, setCodigoOrganismo] = useState('')
  const [codigoCredencial, setCodigoCredencial] = useState('')

  useEffect(() => {
    if (!open) return
    setTipo('1')
  }, [open])

  const handleEmitir = () => {
    emitirListagemLoteDirect(tipo, {
      mes_de: mesDe,
      mes_ate: mesAte,
      ano_de: anoDe,
      ano_ate: anoAte,
      nlote_de: nloteDe,
      nlote_ate: nloteAte,
      c_organismo: codigoOrganismo,
      codigo: codigoCredencial,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Listagens — Lançamento de Credenciais</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label className={labelClass}>Tipo de listagem</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as ListagemLoteDirectReportTipo)}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {['1', '4', '5', '6', '7'].includes(tipo) ? (
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label className={labelClass}>Mês de</Label>
                <Input className={inputClass} value={mesDe} onChange={(e) => setMesDe(e.target.value)} />
              </div>
              <div>
                <Label className={labelClass}>Mês até</Label>
                <Input className={inputClass} value={mesAte} onChange={(e) => setMesAte(e.target.value)} />
              </div>
              <div>
                <Label className={labelClass}>Ano de</Label>
                <Input className={inputClass} value={anoDe} onChange={(e) => setAnoDe(e.target.value)} />
              </div>
              <div>
                <Label className={labelClass}>Ano até</Label>
                <Input className={inputClass} value={anoAte} onChange={(e) => setAnoAte(e.target.value)} />
              </div>
            </div>
          ) : null}

          {tipo === '1' ? (
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label className={labelClass}>N.º lote de</Label>
                <Input className={inputClass} value={nloteDe} onChange={(e) => setNloteDe(e.target.value)} />
              </div>
              <div>
                <Label className={labelClass}>N.º lote até</Label>
                <Input className={inputClass} value={nloteAte} onChange={(e) => setNloteAte(e.target.value)} />
              </div>
              <div className='col-span-2'>
                <Label className={labelClass}>Código organismo (ULS)</Label>
                <Input
                  className={inputClass}
                  value={codigoOrganismo}
                  onChange={(e) => setCodigoOrganismo(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {tipo === '2' || tipo === '3' ? (
            <div>
              <Label className={labelClass}>Código credencial</Label>
              <Input
                className={inputClass}
                value={codigoCredencial}
                onChange={(e) => setCodigoCredencial(e.target.value)}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={handleEmitir}>
            Emitir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
