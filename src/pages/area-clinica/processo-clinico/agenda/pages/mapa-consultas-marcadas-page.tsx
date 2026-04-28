import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, FileText } from 'lucide-react'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useCloseCurrentWindowLikeTabBar } from '@/utils/window-utils'

function getTodayStr() { return format(new Date(), 'yyyy-MM-dd') }
const ORGANISMOS = [{ value: 'SNS', label: 'SNS' }, { value: 'ADSE', label: 'ADSE' }, { value: 'OUTRO', label: 'Outro' }] as const

export function MapaConsultasMarcadasPage() {
  const [dataInicio, setDataInicio] = useState<string>(getTodayStr())
  const [dataFim, setDataFim] = useState<string>(getTodayStr())
  const [organismo, setOrganismo] = useState<string>('')
  const { toast } = useToast()
  const closeLikeTabBar = useCloseCurrentWindowLikeTabBar()
  const handleOk = () => {
    if (!organismo) { toast({ title: 'Campos em falta', description: 'Selecione o organismo.', variant: 'destructive' }); return }
    if (dataInicio > dataFim) { toast({ title: 'Datas inválidas', description: 'A data de início deve ser anterior ou igual à data de fim.', variant: 'destructive' }); return }
    toast({ title: 'Relatório', description: 'Geração do relatório PDF em desenvolvimento. Será listado todas as consultas do organismo no intervalo de datas selecionado.' })
  }
  return (
    <>
      <PageHead title='Mapa de Consultas Marcadas | CliCloud' />
      <DashboardPageContainer>
        <div className='flex flex-col items-center'>
          <div className='mb-4 flex w-full max-w-xl items-center border-b border-border/70 pb-3'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0'
              onClick={closeLikeTabBar}
              title='Voltar'
            >
              <ChevronLeft className='h-5 w-5' aria-hidden />
            </Button>
            <h1 className='truncate text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg'>
              Mapa de Consultas Marcadas
            </h1>
          </div>
          <Card className='w-full max-w-xl'>
            <CardHeader className='text-center'><div className='flex items-center justify-center gap-2'><FileText className='h-5 w-5 text-primary' /><CardTitle>Parâmetros do relatório</CardTitle></div></CardHeader>
            <CardContent className='flex flex-col items-center space-y-6 text-center'>
              <div className='grid w-full max-w-sm grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='flex flex-col items-center space-y-2'><Label htmlFor='data-inicio'>Data de início</Label><DatePicker id='data-inicio' value={dataInicio ? new Date(dataInicio + 'T12:00:00') : undefined} onChange={(date) => setDataInicio(date ? format(date, 'yyyy-MM-dd') : '')} placeholder='Selecionar data' className='w-full' /></div>
                <div className='flex flex-col items-center space-y-2'><Label htmlFor='data-fim'>Data de fim</Label><DatePicker id='data-fim' value={dataFim ? new Date(dataFim + 'T12:00:00') : undefined} onChange={(date) => setDataFim(date ? format(date, 'yyyy-MM-dd') : '')} placeholder='Selecionar data' className='w-full' /></div>
              </div>
              <div className='flex w-full max-w-sm flex-col items-center space-y-2'>
                <Label htmlFor='organismo'>Organismo</Label>
                <Select value={organismo} onValueChange={setOrganismo}><SelectTrigger id='organismo' className='w-full'><SelectValue placeholder='Selecionar organismo' /></SelectTrigger><SelectContent>{ORGANISMOS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select>
              </div>
            </CardContent>
            <CardFooter className='justify-center'><Button onClick={handleOk} className='gap-2'><FileText className='h-4 w-4' />OK</Button></CardFooter>
          </Card>
        </div>
      </DashboardPageContainer>
    </>
  )
}
