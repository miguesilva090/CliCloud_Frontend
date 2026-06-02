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
import { ResponseStatus } from '@/types/api/responses'
import { labelClass } from '@/lib/form-styles'
import { AdmissaoAdministrativoService } from '@/lib/services/consultas/admissao-administrativo-service'
import { ServicoService } from '@/lib/services/servicos/servico-service'
import type { AdmissaoTableDTO } from '@/types/dtos/consultas/admissao.dtos'
import { toast } from '@/utils/toast-utils'
import type { DocumentoEditorState } from '../types/documento-editor.types'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
const ID = 'documentos'

/** @deprecated Use DocumentoTabMovimentosUtenteSection */
export function DocumentoTabAdmissoesSection({
  state,
  onChange,
}: {
  state: DocumentoEditorState
  onChange: (p: Partial<DocumentoEditorState>) => void
}) {
  const [fonte, setFonte] = useState<FonteAdmissoesFaturacao>('activo')
  const admissoesQ = useAdmissoesParaFaturacao(state.utenteId, fonte)
  const taxasQ = useTaxasIvaDocumento('')
  const [importandoId, setImportandoId] = useState<string | null>(null)

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
      return { linhasNovas, cliente, adm }
    },
    onSuccess: ({ linhasNovas, cliente }) => {
      onChange({
        ...cliente,
        linhas: mergeLinhasImportadas(state.linhas, linhasNovas),
      })
      toast.success(`${linhasNovas.length} linha(s) importada(s).`)
      setImportandoId(null)
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Erro ao importar admissão.')
      setImportandoId(null)
    },
  })

  const rows = admissoesQ.data ?? []

  return (
    <div className='space-y-4'>
      <div>
        <Label className={labelClass}>Admissões por faturar</Label>
        <p className='text-xs text-muted-foreground'>
          Por utente, sem filtrar à data do documento (legado). Activo: todas as não faturadas;
          Histórico: admissões anteriores a hoje ainda por faturar.
        </p>
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
      </div>

      <div className='overflow-x-auto rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data / Hora</TableHead>
              <TableHead>Utente</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Organismo</TableHead>
              <TableHead className='w-28' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!state.utenteId ? (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground'>
                  Seleccione um utente no separador Cliente.
                </TableCell>
              </TableRow>
            ) : admissoesQ.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground'>
                  A carregar…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-muted-foreground'>
                  Sem admissões por faturar para este utente.
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
                  <TableCell>{row.utenteNome ?? '—'}</TableCell>
                  <TableCell>{row.medicoNome ?? '—'}</TableCell>
                  <TableCell>{row.organismoNome ?? '—'}</TableCell>
                  <TableCell>
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      disabled={importar.isPending}
                      onClick={() => {
                        setImportandoId(row.id)
                        importar.mutate(row)
                      }}
                    >
                      {importandoId === row.id && importar.isPending
                        ? '…'
                        : 'Importar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => onChange({ linhas: [] })}
      >
        Limpar linhas
      </Button>
    </div>
  )
}
