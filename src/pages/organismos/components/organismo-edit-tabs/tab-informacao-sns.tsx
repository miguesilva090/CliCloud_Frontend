import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useFieldArray } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { OrganismoEditFormValues } from '@/pages/organismos/types/organismo-edit-form-types'
import { NATUREZAS_ORGANISMO } from '@/pages/organismos/constants/naturezas-organismo'
import { useUnidadesLocaisSaudeLight } from '@/lib/services/utility/lookups/lookups-queries'

// Regiões usadas no legado para "Cód. Região" (NUTS - 7 regiões em PT).
// O backend espera um número em `codigoRegiaoAtestadoCC` (parseInt a partir do string).
const REGIOES_ATTESTADO: Array<{ value: string; label: string }> = [
  { value: '1', label: 'Região Norte' },
  { value: '2', label: 'Região Centro' },
  { value: '3', label: 'Região de Lisboa e Vale do Tejo' },
  { value: '4', label: 'Região do Alentejo' },
  { value: '5', label: 'Região do Algarve' },
  { value: '6', label: 'Região Autónoma dos Açores' },
  { value: '7', label: 'Região Autónoma da Madeira' },
]

export function TabInformacaoSNS({
  form,
  readOnly,
}: {
  form: UseFormReturn<OrganismoEditFormValues>
  readOnly?: boolean
}) {
  const [modalInserirOpen, setModalInserirOpen] = useState(false)
  const [modalCodigoEntidade, setModalCodigoEntidade] = useState('')
  const [modalNatureza, setModalNatureza] = useState<string>(
    NATUREZAS_ORGANISMO[0] ?? ''
  )

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'entidadeNatureza',
  })

  const unidadesLocaisSaudeQuery = useUnidadesLocaisSaudeLight('')
  const unidadesLocaisSaude = unidadesLocaisSaudeQuery.data?.info?.data ?? []

  const handleAdicionar = () => {
    const codigo = modalCodigoEntidade.trim()
    if (!codigo) return
    // Como o backend só persiste 1 "codigoFaturacao", mantemos a lista inferior com no máximo 1 linha.
    if (fields.length === 0) {
      append({ codigoEntidade: codigo, natureza: modalNatureza })
    } else {
      update(0, { codigoEntidade: codigo, natureza: modalNatureza })
    }
    // Coerência UI: o primeiro "entidadeNatureza" deve refletir o campo "Cód. Faturação".
    form.setValue('codigoFaturacao', codigo, { shouldDirty: true })
    setModalCodigoEntidade('')
    setModalNatureza(NATUREZAS_ORGANISMO[0] ?? '')
    setModalInserirOpen(false)
  }

  const handleRemover = (index: number) => {
    remove(index)
    if (index === 0) {
      form.setValue('codigoFaturacao', '', { shouldDirty: true })
    }
  }

  return (
    <div className='space-y-4'>
      <section className='space-y-2'>
        <h3 className='text-sm font-semibold text-muted-foreground border-b pb-1'>
          Informação SNS
        </h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] md:items-end'>
          <FormField
            control={form.control}
            name='ars'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2 space-y-0 w-fit max-w-full md:pb-[6px]'>
                <FormControl inline>
                  <Checkbox
                    checked={field.value === '1'}
                    onCheckedChange={(v) => field.onChange(v ? '1' : '')}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormLabel className='!mb-0 font-normal cursor-pointer'>ARS</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='codigoRegiao'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cód. Região</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                    disabled={readOnly}
                  >
                    <SelectTrigger className='h-7'>
                      <SelectValue placeholder='Selecionar região...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>—</SelectItem>
                      {REGIOES_ATTESTADO.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='codigoFaturacao'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cód. Faturação</FormLabel>
                <FormControl>
                  <Input
                    className='h-7'
                    placeholder='Cód. Faturação'
                    readOnly={readOnly}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      if (readOnly) return
                      const v = e.target.value.trim()
                      if (!v) return
                      const naturezaAtual =
                        fields[0]?.natureza ?? modalNatureza ?? NATUREZAS_ORGANISMO[0] ?? ''
                      if (fields.length === 0) {
                        append({ codigoEntidade: v, natureza: naturezaAtual })
                      } else {
                        update(0, { codigoEntidade: v, natureza: naturezaAtual })
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='codigoULSNova'
            render={({ field }) => (
              <FormItem className='md:col-span-3'>
                <FormLabel>Nova ULS</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                    disabled={readOnly || unidadesLocaisSaudeQuery.isLoading}
                  >
                    <SelectTrigger className='h-7'>
                      <SelectValue placeholder='Selecionar ULS...' />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Mantém o valor atual mesmo que a lista esteja vazia */}
                      {field.value &&
                        !unidadesLocaisSaude.some((u) => String(u.codigo) === field.value) && (
                          <SelectItem value={field.value}>{`ULS ${field.value}`}</SelectItem>
                        )}
                      <SelectItem value='none'>—</SelectItem>
                      {unidadesLocaisSaude.map((u) => (
                        <SelectItem key={u.codigo} value={String(u.codigo)}>
                          {u.nome}
                          {u.nif ? ` - ${u.nif}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='mt-4 space-y-2'>
          <h4 className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
            Entidade / Natureza
          </h4>
          <div className='rounded-md border'>
            <div className='grid grid-cols-[1fr_2fr_auto] gap-2 px-3 py-2 bg-muted/50 text-xs font-medium'>
              <span>Código Entidade</span>
              <span>Natureza</span>
              <span className='w-8' />
            </div>
            {fields.length > 0 ? (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className='grid grid-cols-[1fr_2fr_auto] gap-2 px-3 py-2 border-t items-center text-sm'
                >
                  <span className='truncate'>
                    {form.watch(`entidadeNatureza.${index}.codigoEntidade`)}
                  </span>
                  <span className='text-muted-foreground truncate'>
                    {form.watch(`entidadeNatureza.${index}.natureza`)}
                  </span>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-destructive hover:text-destructive'
                      onClick={() => handleRemover(index)}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className='px-3 py-6 text-center text-sm text-muted-foreground border-t'>
                Sem entidades associadas
              </div>
            )}
            {!readOnly && (
              <div className='border-t px-3 py-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setModalInserirOpen(true)}
                >
                  <Plus className='h-3.5 w-3.5 mr-1' />
                  Inserir
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={modalInserirOpen} onOpenChange={setModalInserirOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Inserir Natureza</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <label className='text-sm font-medium'>Código Entidade</label>
              <Input
                placeholder='Código Entidade...'
                value={modalCodigoEntidade}
                onChange={(e) => setModalCodigoEntidade(e.target.value)}
                maxLength={15}
                className='h-8'
              />
            </div>
            <div className='grid gap-2'>
              <label className='text-sm font-medium'>Natureza</label>
              <Select
                value={modalNatureza}
                onValueChange={setModalNatureza}
              >
                <SelectTrigger className='h-8'>
                  <SelectValue placeholder='Selecionar natureza...' />
                </SelectTrigger>
                <SelectContent>
                  {NATUREZAS_ORGANISMO.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setModalInserirOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handleAdicionar} disabled={!modalCodigoEntidade.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
