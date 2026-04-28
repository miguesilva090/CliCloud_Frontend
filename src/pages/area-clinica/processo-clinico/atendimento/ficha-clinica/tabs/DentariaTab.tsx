import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnamneseOdontopediatriaTab } from './AnamneseOdontopediatriaTab'
import { AnamneseOrtodonticaAnaliseGeralTab } from './AnamneseOrtodonticaAnaliseGeralTab'
import { AnamneseOrtodonticaAnaliseDentariaTab } from './AnamneseOrtodonticaAnaliseDentariaTab'
import { AnamneseOrtodonticaDenticaoDeciduaeMistaTab } from './AnamneseOrtodonticaDenticaoDeciduaeMistaTab'
import { AnamneseOrtodonticaATMTab } from './AnamneseOrtodonticaATMTab'
import { AnamneseOrtodonticaAnaliseFuncionalTab } from './AnamneseOrtodonticaAnaliseFuncional'
import { OdontogramaTab } from './OdontogramaTab'
import { RelatorioDentariaTab } from './RelatorioDentariaTab'

export interface DentariaTabProps {
  utenteId: string
}

export function DentariaTab({ utenteId }: DentariaTabProps) {
  const [ortodontiaSubTab, setOrtodontiaSubTab] = useState<
    'analise-geral' | 'analise-dentaria' | 'denticao-decidua-mista' | 'atm' | 'analise-funcional'
  >('analise-geral')

  return (
    <Tabs defaultValue='odontopediatria' className='flex flex-col gap-2'>
      <TabsList className='flex flex-wrap justify-start gap-[2px] bg-transparent border-none p-0 shadow-none'>
        <TabsTrigger value='odontopediatria' className='tabs-pill px-2 py-1'>
          Anamnese Odontopediatria
        </TabsTrigger>
        <TabsTrigger value='ortodontica' className='tabs-pill px-2 py-1'>
          Anamnese Ortodôntica
        </TabsTrigger>
        <TabsTrigger value='odontograma' className='tabs-pill px-2 py-1'>
          Odontograma
        </TabsTrigger>
        <TabsTrigger value='relatorio' className='tabs-pill px-2 py-1'>
          Relatório
        </TabsTrigger>
        <TabsTrigger value='orcamentos' className='tabs-pill px-2 py-1'>
          Orçamentos
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value='odontopediatria'
        className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
      >
        <AnamneseOdontopediatriaTab utenteId={utenteId} />
      </TabsContent>
      <TabsContent
        value='ortodontica'
        className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
      >
        <div className='flex flex-col gap-3'>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              className={`tabs-pill px-2 py-1 ${
                ortodontiaSubTab === 'analise-geral'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
              onClick={() => setOrtodontiaSubTab('analise-geral')}
            >
              Análise Geral
            </button>
            <button
              type='button'
              className={`tabs-pill px-2 py-1 ${
                ortodontiaSubTab === 'analise-dentaria'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
              onClick={() => setOrtodontiaSubTab('analise-dentaria')}
            >
              Análise Dentária
            </button>
            <button
              type='button'
              className={`tabs-pill px-2 py-1 ${
                ortodontiaSubTab === 'denticao-decidua-mista'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
              onClick={() => setOrtodontiaSubTab('denticao-decidua-mista')}
            >
              Dentição Decídua e Mista
            </button>
            <button
              type='button'
              className={`tabs-pill px-2 py-1 ${
                ortodontiaSubTab === 'atm'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
              onClick={() => setOrtodontiaSubTab('atm')}
            >
              ATM - Articulação Temporomandibular
            </button>
            <button
              type='button'
              className={`tabs-pill px-2 py-1 ${
                ortodontiaSubTab === 'analise-funcional'
                  ? 'bg-primary text-primary-foreground'
                  : ''
              }`}
              onClick={() => setOrtodontiaSubTab('analise-funcional')}
            >
              Análise Funcional
            </button>
          </div>

          <div className='rounded-lg border bg-card p-4'>
            {ortodontiaSubTab === 'analise-geral' && (
              <AnamneseOrtodonticaAnaliseGeralTab utenteId={utenteId} />
            )}
            {ortodontiaSubTab === 'analise-dentaria' && (
              <AnamneseOrtodonticaAnaliseDentariaTab utenteId={utenteId} />
            )}
            {ortodontiaSubTab === 'denticao-decidua-mista' && (
              <AnamneseOrtodonticaDenticaoDeciduaeMistaTab utenteId={utenteId} />
            )}
            {ortodontiaSubTab === 'atm' && (
              <AnamneseOrtodonticaATMTab utenteId={utenteId} />
            )}
            {ortodontiaSubTab === 'analise-funcional' && (
              <AnamneseOrtodonticaAnaliseFuncionalTab utenteId={utenteId} />
            )}
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value='odontograma'
        className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
      >
        <OdontogramaTab utenteId={utenteId} />
      </TabsContent>
      <TabsContent
        value='relatorio'
        className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
      >
        <RelatorioDentariaTab utenteId={utenteId} />
      </TabsContent>
      <TabsContent
        value='orcamentos'
        className='mt-0 rounded-lg border bg-card p-4 text-sm text-muted-foreground'
      >
        Orçamentos (a implementar).
      </TabsContent>
    </Tabs>
  )
}
