import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CreateReceitaLinhaRequest } from '@/types/dtos/prescricao/receita-medica.dtos'
import { ReceitaLinhasInfarmedPanel } from './receita-linhas-infarmed-panel'
import { formatEuro } from '../utils/calcular-totais-receita'

export type LinhaDraft = CreateReceitaLinhaRequest & { key: string }

type Props = {
  tipoReceita: number
  patologias?: string
  readOnly?: boolean
  linhas: LinhaDraft[]
  onAddLinha: (linha: CreateReceitaLinhaRequest) => void
  onAddLinhaManual: () => void
  onUpdateLinha: (key: string, patch: Partial<LinhaDraft>) => void
  onRemoveLinha: (key: string) => void
}

export function ReceitaTabMedicacao({
  tipoReceita,
  patologias,
  readOnly,
  linhas,
  onAddLinha,
  onAddLinhaManual,
  onUpdateLinha,
  onRemoveLinha,
}: Props) {
  return (
    <div className='space-y-4'>
      {!readOnly ? (
        <div className='space-y-2'>
          <h2 className='text-sm font-medium'>Pesquisar medicamentos</h2>
          <ReceitaLinhasInfarmedPanel
            tipoReceita={tipoReceita}
            patologias={patologias}
            disabled={readOnly}
            onAddLinha={onAddLinha}
          />
        </div>
      ) : null}

      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <h2 className='text-sm font-medium'>Linhas da receita</h2>
          {!readOnly ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onAddLinhaManual}
            >
              <Plus className='mr-1 h-4 w-4' />
              Linha manual
            </Button>
          ) : null}
        </div>

        <div className='overflow-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designação</TableHead>
                <TableHead className='w-[90px]'>Qtd</TableHead>
                <TableHead>Posologia</TableHead>
                <TableHead className='w-[90px]'>PVP</TableHead>
                <TableHead className='w-[110px]'>Compartic.</TableHead>
                <TableHead className='w-[90px]'>Utente</TableHead>
                <TableHead className='w-[50px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center text-sm text-muted-foreground'
                  >
                    Sem linhas.
                  </TableCell>
                </TableRow>
              ) : (
                linhas.map((l) => (
                  <TableRow key={l.key}>
                    <TableCell>
                      <Input
                        value={l.designacao}
                        disabled={readOnly}
                        onChange={(e) =>
                          onUpdateLinha(l.key, { designacao: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type='number'
                        min={1}
                        value={l.quantidade}
                        disabled={readOnly}
                        onChange={(e) =>
                          onUpdateLinha(l.key, {
                            quantidade: Number(e.target.value) || 1,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={l.posologia ?? ''}
                        disabled={readOnly}
                        onChange={(e) =>
                          onUpdateLinha(l.key, { posologia: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell className='text-sm tabular-nums'>
                      {l.pvp != null ? formatEuro(l.pvp) : '—'}
                    </TableCell>
                    <TableCell className='text-sm tabular-nums'>
                      {l.comparticipacao != null
                        ? formatEuro(l.comparticipacao)
                        : '—'}
                    </TableCell>
                    <TableCell className='text-sm tabular-nums'>
                      {l.valorUtente != null ? formatEuro(l.valorUtente) : '—'}
                    </TableCell>
                    <TableCell>
                      {!readOnly ? (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => onRemoveLinha(l.key)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
