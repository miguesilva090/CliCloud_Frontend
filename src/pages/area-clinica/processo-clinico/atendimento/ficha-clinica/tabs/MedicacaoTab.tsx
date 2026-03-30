import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MedicacaoTab() {
  return (
    <Tabs defaultValue='receita-eletronica' className='flex flex-col gap-2'>
      <TabsList className='w-full justify-start bg-transparent border-none p-0 shadow-none'>
        <TabsTrigger value='receita-eletronica' className='tabs-pill px-2 py-1'>
          Receita Eletrónica
        </TabsTrigger>
        <TabsTrigger value='receita-manual' className='tabs-pill px-2 py-1'>
          Receita Manual
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value='receita-eletronica'
        className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
      >
        Tabela de Receita Eletrónica (a implementar).
      </TabsContent>
      <TabsContent
        value='receita-manual'
        className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
      >
        Tabela de Receita Manual (a implementar).
      </TabsContent>
    </Tabs>
  )
}
