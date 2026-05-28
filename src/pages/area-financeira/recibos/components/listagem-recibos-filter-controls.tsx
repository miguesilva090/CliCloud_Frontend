import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function ListagemRecibosFilterControls({
    table,
}: {
    table: any
    columns: any[]
    onApplyFilters: () => void
    onClearFilters: () => void
})
{
    const numeroDocumento = 
        (table.getColumn('numeroDocumento')?.getFilterValue() as string) ?? ''
    
    return (
        <div className='space-y-4'>
            <div className='space-y-2'>
                <Label>N.Documento</Label>
                <Input
                    placeholder='Procurar por n.documento...'
                    value={numeroDocumento}
                    onChange={(e) => 
                        table.getColumn('numeroDocumento')?.setFilterValue(e.target.value)
                    }
                    className='w-full max-w-[240px] bg-background border border-input shadow-sm'
                />
            </div>
        </div>
    )
}