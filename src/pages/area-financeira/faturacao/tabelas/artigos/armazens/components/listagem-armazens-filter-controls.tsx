import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export function ListagemArmazensFilterControls({
    table, 
    apenasArmazemGeral,
    onApenasArmazemGeralChange,
}: {
    table: any
    apenasArmazemGeral: boolean
    onApenasArmazemGeralChange: (value: boolean) => void
}) {
    const nome = (table.getColumn('nome')?.getFilterValue() as string) ?? ''

    return (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Nome:</Label>
            <Input
              placeholder='Procurar por nome...'
              value={nome}
              onChange={(e) =>
                table.getColumn('nome')?.setFilterValue(e.target.value)
              }
              className='w-full max-w-[280px] bg-background border border-input shadow-sm'
              maxLength={40}
            />
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='armazem-apenas-geral'
              checked={apenasArmazemGeral}
              onCheckedChange={(checked) =>
                onApenasArmazemGeralChange(checked === true)
              }
            />
            <Label htmlFor='armazem-apenas-geral' className='font-normal'>
              Mostrar apenas armazém geral
            </Label>
          </div>
        </div>
      )
}