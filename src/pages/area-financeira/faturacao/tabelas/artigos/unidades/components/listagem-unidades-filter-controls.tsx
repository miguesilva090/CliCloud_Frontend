import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemUnidadesFilterControls({
    table,
}: {
    table: any
}) {
    const descricao =
        (table.getColumn('descricao')?.getFilterValue() as string) ?? ''

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
                    maxLength={15}
                />
            </div>
        </div>
    )
}
