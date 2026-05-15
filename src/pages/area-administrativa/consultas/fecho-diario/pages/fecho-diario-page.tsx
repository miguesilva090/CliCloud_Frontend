import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { modules } from '@/config/modules'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { FechoDiarioResultDTO } from '@/types/dtos/consultas/admissao.dtos'

const permId = modules.areaAdministrativa.permissions.fechoDiario.id

export function FechoDiarioPage() {
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10))
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FechoDiarioResultDTO | null>(null)

  const executar = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await AdmissaoAdministrativoService(permId).executarFecho({ data })
      if (res.info?.status === ResponseStatus.Success && res.info.data) {
        setResult(res.info.data)
        toast.success(
          `Fecho concluído: ${res.info.data.totalConsultasCriadas} consulta(s) criada(s).`
        )
      } else {
        toast.error(res.info?.messages?.['']?.[0] ?? 'Falha no fecho diário.')
      }
    } catch {
      toast.error('Falha no fecho diário.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHead title='Fecho Diário | CliCloud' />
      <DashboardPageContainer>
        <AreaComumListagemPageShell title='Fecho Diário'>
          <p className='mb-4 text-sm text-muted-foreground'>
            Promove todas as admissões do dia selecionado para consultas (histórico
            administrativo) e remove-as do hub operacional.
          </p>
          <div className='flex max-w-md flex-col gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='data-fecho'>Data do fecho</Label>
              <Input
                id='data-fecho'
                type='date'
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <Button onClick={() => void executar()} disabled={loading}>
              <Calendar className='mr-2 h-4 w-4' />
              {loading ? 'A processar...' : 'Executar fecho diário'}
            </Button>
          </div>
          {result ? (
            <Alert className='mt-4'>
              <AlertTitle>Resultado</AlertTitle>
              <AlertDescription>
                <ul className='list-disc pl-4'>
                  <li>Processadas: {result.totalProcessadas}</li>
                  <li>Consultas criadas: {result.totalConsultasCriadas}</li>
                  {result.erros.length > 0 ? (
                    <li className='text-destructive'>
                      Erros: {result.erros.join('; ')}
                    </li>
                  ) : null}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>
    </>
  )
}
