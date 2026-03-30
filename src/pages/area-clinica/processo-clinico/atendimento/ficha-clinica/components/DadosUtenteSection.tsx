import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import { ChevronDown, ChevronRight } from 'lucide-react'

export interface DadosUtenteSectionProps {
  utente: UtenteDTO | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  abrirAoCarregar: boolean
  onAbrirAoCarregarChange: (checked: boolean) => void
  onEscolherUtente: () => void
  informacaoImportante?: string | null
}

export function DadosUtenteSection({
  utente,
  open,
  onOpenChange,
  abrirAoCarregar,
  onAbrirAoCarregarChange,
  onEscolherUtente,
  informacaoImportante,
}: DadosUtenteSectionProps) {
  const nomeUtente = utente?.nome ?? ''
  const dataNascimento = utente?.dataNascimento
    ? format(new Date(utente.dataNascimento), 'dd/MM/yyyy')
    : ''
  const organismo = utente?.organismo?.nome ?? ''
  const numeroUtente = utente?.numeroUtente ?? ''
  const numeroContribuinte = utente?.numeroContribuinte ?? ''

  const contactos = utente?.entidadeContactos ?? []
  const telefone = contactos.find((c) => c.entidadeContactoTipoId === 1)?.valor ?? ''
  const telemovel = contactos.find((c) => c.entidadeContactoTipoId === 2)?.valor ?? ''
  const emailUtente = utente?.email ?? ''

  const rua = [utente?.rua?.nome, utente?.numeroPorta, utente?.andarRua].filter(Boolean).join(', ')
  const freguesia = utente?.freguesia?.nome ?? ''
  const concelho = utente?.concelho?.nome ?? ''
  const nacionalidade = utente?.nacionalidade ?? ''

  const profissao = utente?.profissao?.descricao ?? ''
  const estadoCivil = utente?.estadoCivil?.descricao ?? ''
  const grupoSanguineo = utente?.grupoSanguineo?.descricao ?? ''
  const subsistemaLinhas = utente?.subsistemaLinhas ?? []
  const primeiraLinha = subsistemaLinhas[0]
  const numBeneficiario = primeiraLinha?.numeroBeneficiario ?? ''
  const apoliceSeguradora = primeiraLinha?.numeroApolice ?? ''
  const centroSaude = utente?.centroSaude?.nome ?? ''
  const seguradora = utente?.seguradora?.nome ?? ''

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className='rounded-lg border bg-card'>
      <div className='flex flex-wrap items-center justify-between gap-4 px-4 py-3'>
        <div className='space-y-1 min-w-[240px]'>
          <div className='text-xs font-semibold text-foreground'>Utente</div>
          <div className='text-base font-semibold'>
            {nomeUtente || 'Nenhum utente selecionado'}
          </div>
        </div>
        <div className='flex flex-wrap gap-6 text-sm text-muted-foreground'>
          <div>
            <div className='text-xs font-semibold text-foreground'>Data Nascimento</div>
            <div>{dataNascimento || '-'}</div>
          </div>
          <div>
            <div className='text-xs font-semibold text-foreground'>Nº Utente</div>
            <div>{numeroUtente || '-'}</div>
          </div>
          <div>
            <div className='text-xs font-semibold text-foreground'>Nº Contribuinte</div>
            <div>{numeroContribuinte || '-'}</div>
          </div>
          <div>
            <div className='text-xs font-semibold text-foreground'>Organismo</div>
            <div>{organismo || '-'}</div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={onEscolherUtente}>
            Escolher Utente
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant='ghost' size='sm' className='section-toggle-button'>
              {open ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
              <span className='text-xs font-medium'>Dados do Utente</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      {informacaoImportante && (
        <div className='border-t border-destructive/40 bg-destructive/5 px-4 py-2 text-sm text-destructive'>
          {informacaoImportante}
        </div>
      )}
      <div className='flex flex-wrap items-center gap-4 border-t px-4 py-2'>
        <label className='flex cursor-pointer items-center gap-2 text-sm text-muted-foreground'>
          <Checkbox
            checked={abrirAoCarregar}
            onCheckedChange={(c) => onAbrirAoCarregarChange(c === true)}
          />
          Abrir dados utente ao carregar a página.
        </label>
      </div>
      <CollapsibleContent>
        <div className='border-t px-4 py-3'>
          <div className='grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-5'>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Nacionalidade</div>
              <div className='text-muted-foreground'>{nacionalidade || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Telefone</div>
              <div className='text-muted-foreground'>{telefone || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Telemóvel</div>
              <div className='text-muted-foreground'>{telemovel || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Nº Beneficiário</div>
              <div className='text-muted-foreground'>{numBeneficiario || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Nº Utente</div>
              <div className='text-muted-foreground'>{numeroUtente || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Centro de Saúde</div>
              <div className='text-muted-foreground'>{centroSaude || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Seguradora</div>
              <div className='text-muted-foreground'>{seguradora || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Nº Apólice</div>
              <div className='text-muted-foreground'>{apoliceSeguradora || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Email</div>
              <div className='text-muted-foreground'>{emailUtente || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Rua</div>
              <div className='text-muted-foreground'>{rua || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Freguesia</div>
              <div className='text-muted-foreground'>{freguesia || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Concelho</div>
              <div className='text-muted-foreground'>{concelho || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Profissão</div>
              <div className='text-muted-foreground'>{profissao || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Estado civil</div>
              <div className='text-muted-foreground'>{estadoCivil || '-'}</div>
            </div>
            <div className='space-y-0.5'>
              <div className='text-xs font-semibold text-foreground'>Grupo sanguíneo</div>
              <div className='text-muted-foreground'>{grupoSanguineo || '-'}</div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
