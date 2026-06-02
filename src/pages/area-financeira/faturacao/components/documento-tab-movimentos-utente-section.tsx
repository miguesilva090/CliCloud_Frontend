import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ResponseStatus } from '@/types/api/responses'
import { labelClass } from '@/lib/form-styles'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import { toast } from '@/utils/toast-utils'
import type {
  DocumentoEditorState,
  MovimentoUtenteEditor,
} from '../types/documento-editor.types'
import {
  linhasTemAdmissaoServicoDuplicado,
  mapAdmissaoServicoToLinha,
  mapAdmissaoToEditorCliente,
  mergeLinhasImportadas,
} from '../utils/documento-linha-mappers'
import {
  useAdmissoesParaFaturacao,
  useTaxasIvaDocumento,
  type FonteAdmissoesFaturacao,
} from '../queries/documento-editor-queries'
const ID = 'documentos'
const MODULO_CONSULTAS = 'Consultas'

function novoMovimento(admissao: AdmissaoTableDTO): MovimentoUtenteEditor {
  const codigo = admissao.id.slice(0, 8).toUpperCase()
  return {
    key: admissao.id,
    modulo: MODULO_CONSULTAS,
    admissaoId: admissao.id,
    codigoAdmissao: codigo,
  }
}

export function DocumentoTabMovimentosUtenteSection({
  state,
  onChange,
}: {
  state: DocumentoEditorState
  onChange: (p: Partial<DocumentoEditorState>) => void
}) {
  const [fonte, setFonte] = useState<FonteAdmissoesFaturacao>('activo')
  const [selectedMov, setSelectedMov] = useState<string | null>(null)
  const admissoesQ = useAdmissoesParaFaturacao(state.utenteId, fonte)
  const taxasQ = useTaxasIvaDocumento('')
  const [importandoId, setImportandoId] = useState<string | null>(null)

  const movimentos = state.movimentosUtente
  const idsMovimentos = new Set(movimentos.map((m) => m.admissaoId))

  const importar = useMutation({
    mutationFn: async (row: AdmissaoTableDTO) => {
      const debRes = await AdmissaoAdministrativoService(ID).getDebitoFaturacao(
        row.id,
      )
      const deb = debRes.info?.data
      if (
        !debRes.info ||
        debRes.info.status !== ResponseStatus.Success ||
        !deb?.podeFaturar
      ) {
        const msg =
          deb?.servicosComDebito === 0 && (deb?.servicosTotal ?? 0) > 0
            ? 'Todos os serviços desta admissão já constam em documentos emitidos.'
            : 'A admissão não tem débitos para associar ao documento.'
        throw new Error(msg)
      }

      const res = await AdmissaoAdministrativoService(ID).getById(row.id)
      const adm = res.info?.data
      if (!res.info || res.info.status !== ResponseStatus.Success || !adm) {
        throw new Error('Não foi possível carregar a admissão.')
      }
      if (!adm.servicos?.length) {
        throw new Error('Admissão sem serviços para importar.')
      }

      const taxas =
        taxasQ.data?.info?.status === ResponseStatus.Success
          ? (taxasQ.data.info.data ?? [])
          : []

      const idsDebito = new Set(deb.admissaoServicoIdsComDebito ?? [])
      const servicosImportar = adm.servicos.filter(
        (s) => s.id && idsDebito.has(s.id),
      )
      if (!servicosImportar.length) {
        throw new Error('Não há serviços por faturar nesta admissão.')
      }

      const linhasNovas = []
      for (const s of servicosImportar) {
        let servico = null
        if (s.servicoId) {
          const sr = await ServicoService(ID).getServico(s.servicoId)
          if (sr.info?.status === ResponseStatus.Success) {
            servico = sr.info.data ?? null
          }
        }
        linhasNovas.push(mapAdmissaoServicoToLinha(s, taxas, servico))
      }

      const dup = linhasTemAdmissaoServicoDuplicado(state.linhas, linhasNovas)
      if (dup) throw new Error(dup)

      const cliente = mapAdmissaoToEditorCliente(adm)
      const mov = novoMovimento(row)
      return { linhasNovas, cliente, mov }
    },
    onSuccess: ({ linhasNovas, cliente, mov }) => {
      const jaTem = movimentos.some((m) => m.admissaoId === mov.admissaoId)
      onChange({
        ...cliente,
        linhas: mergeLinhasImportadas(state.linhas, linhasNovas),
        movimentosUtente: jaTem ? movimentos : [...movimentos, mov],
      })
      toast.success(`${linhasNovas.length} linha(s) importada(s).`)
      setImportandoId(null)
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Erro ao importar admissão.')
      setImportandoId(null)
    },
  })

  const adicionarMovimento = (row: AdmissaoTableDTO) => {
    if (idsMovimentos.has(row.id)) {
      toast.info('Esta admissão já está nos movimentos.')
      return
    }
    setImportandoId(row.id)
    importar.mutate(row)
  }

  const removerMovimento = () => {
    if (!selectedMov) {
      toast.error('Seleccione um movimento na grelha.')
      return
    }
    onChange({
      movimentosUtente: movimentos.filter((m) => m.key !== selectedMov),
    })
    setSelectedMov(null)
  }

  const rows = admissoesQ.data ?? []

  return (
    <div className='space-y-6'>
      <div>
        <Label className={labelClass}>Movimentos do Utente</Label>
        
        <div className='mt-2 flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={!selectedMov}
            onClick={removerMovimento}
          >
            Remover
          </Button>
        </div>
        <div className='mt-2 overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead>Código admissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className='text-muted-foreground'>
                    Sem movimentos. Use Adicionar na lista abaixo.
                  </TableCell>
                </TableRow>
              ) : (
                movimentos.map((m) => (
                  <TableRow
                    key={m.key}
                    className={
                      selectedMov === m.key ? 'bg-muted/60' : 'cursor-pointer'
                    }
                    onClick={() => setSelectedMov(m.key)}
                  >
                    <TableCell>{m.modulo}</TableCell>
                    <TableCell>{m.codigoAdmissao}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <Label className={labelClass}>Admissões por faturar</Label>
        <ToggleGroup
          type='single'
          value={fonte}
          className='mt-2'
          onValueChange={(v) => {
            if (v === 'activo' || v === 'historico') setFonte(v)
          }}
        >
          <ToggleGroupItem value='activo'>Activo</ToggleGroupItem>
          <ToggleGroupItem value='historico'>Histórico</ToggleGroupItem>
        </ToggleGroup>
        <div className='mt-2 overflow-x-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Organismo</TableHead>
                <TableHead className='w-28' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {!state.utenteId ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-muted-foreground'>
                    Seleccione um utente no separador Cliente.
                  </TableCell>
                </TableRow>
              ) : admissoesQ.isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-muted-foreground'>
                    A carregar…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-muted-foreground'>
                    Sem admissões por faturar.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.data
                        ? new Date(row.data).toLocaleDateString('pt-PT')
                        : '—'}{' '}
                      {row.horaInicio ?? ''}
                    </TableCell>
                    <TableCell>{row.medicoNome ?? '—'}</TableCell>
                    <TableCell>{row.organismoNome ?? '—'}</TableCell>
                    <TableCell>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        disabled={
                          importar.isPending || idsMovimentos.has(row.id)
                        }
                        onClick={() => adicionarMovimento(row)}
                      >
                        {importandoId === row.id && importar.isPending
                          ? '…'
                          : idsMovimentos.has(row.id)
                            ? 'Adicionado'
                            : 'Adicionar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() =>
          onChange({ linhas: [], movimentosUtente: [] })
        }
      >
        Limpar linhas e movimentos
      </Button>
    </div>
  )
}
