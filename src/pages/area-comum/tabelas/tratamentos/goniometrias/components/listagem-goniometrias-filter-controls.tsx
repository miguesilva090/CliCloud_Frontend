import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemGoniometriasFilterControls({
    table, 
}: {
    table: any
    columns: any[]
    onApplyFilters: () => void
    onClearFilters: () => void
}) {
    const designacao =
    (table.getColumn('designacao')?.getFilterValue() as string) ?? ''

    return (
        <div className='space-y-4'>
            <div className='space-y-2'>
                <Label>Designação:</Label>
                <Input
                    placeholder='Procurar por designação...'
                    value={designacao}
                    onChange={(e) =>
                        table.getColumn('designacao')?.setFilterValue(e.target.value)
                    }
                    className='w-full max-w-[240px] bg-background border border-input shadow-sm'
                />
            </div>
        </div>
    )
}