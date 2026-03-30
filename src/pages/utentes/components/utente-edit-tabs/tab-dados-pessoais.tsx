import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import { Copy, Trash2, Camera, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UtenteDTO } from '@/types/dtos/saude/utentes.dtos'
import type { UtenteEditFormValues } from '@/pages/utentes/types/utente-edit-form-types'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import {
  useEstadosCivisLight,
  useGruposSanguineosLight,
  useHabilitacoesLight,
  useProfissoesLight,
  useSexosLight,
  usePaisesLight,
} from '@/lib/services/utility/lookups/lookups-queries'
import { fieldGap, inputClass, labelClass, selectTriggerClass, buttonIconClass } from './utente-edit-tabs-constants'

export function TabDadosPessoais({
  form,
  utente,
}: {
  form: UseFormReturn<UtenteEditFormValues>
  utente: UtenteDTO | undefined
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const dataNascimento = form.watch('dataNascimento')
  const paisesQuery = usePaisesLight('')
  const paises = paisesQuery.data?.info?.data ?? []
  const estadosCivisQuery = useEstadosCivisLight('')
  const estadosCivis = estadosCivisQuery.data?.info?.data ?? []
  const gruposSanguineosQuery = useGruposSanguineosLight('')
  const gruposSanguineos = gruposSanguineosQuery.data?.info?.data ?? []
  const habilitacoesQuery = useHabilitacoesLight('')
  const habilitacoes = habilitacoesQuery.data?.info?.data ?? []
  const profissoesQuery = useProfissoesLight('')
  const profissoes = profissoesQuery.data?.info?.data ?? []
  const sexosQuery = useSexosLight('')
  const sexos = sexosQuery.data?.info?.data ?? []

  // Incluir o valor do utente nas listas para exibir corretamente antes dos lookups carregarem (evita "..." nos dropdowns)
  const estadosCivisComUtente = useMemo(() => {
    const list = estadosCivis
    if (utente?.estadoCivil && !list.some((ec) => ec.id === utente.estadoCivil?.id)) {
      return [{ id: utente.estadoCivil.id, codigo: utente.estadoCivil.codigo ?? '', descricao: utente.estadoCivil.descricao ?? '' }, ...list]
    }
    return list
  }, [estadosCivis, utente?.estadoCivil])

  const habilitacoesComUtente = useMemo(() => {
    const list = habilitacoes
    if (utente?.habilitacao && !list.some((h) => h.id === utente.habilitacao?.id)) {
      return [{ id: utente.habilitacao.id, codigo: utente.habilitacao.codigo ?? '', descricao: utente.habilitacao.descricao ?? '' }, ...list]
    }
    return list
  }, [habilitacoes, utente?.habilitacao])

  const gruposSanguineosComUtente = useMemo(() => {
    const list = gruposSanguineos
    if (utente?.grupoSanguineo && !list.some((gs) => gs.id === utente.grupoSanguineo?.id)) {
      return [{ id: utente.grupoSanguineo.id, codigo: utente.grupoSanguineo.codigo ?? '', descricao: utente.grupoSanguineo.descricao ?? '' }, ...list]
    }
    return list
  }, [gruposSanguineos, utente?.grupoSanguineo])

  const profissoesComUtente = useMemo(() => {
    const list = profissoes
    if (utente?.profissao && !list.some((p) => p.id === utente.profissao?.id)) {
      // ProfissaoLightDTO não tem `codigo`; garantir que o objeto extra respeita o tipo
      return [
        {
          id: utente.profissao.id,
          descricao: utente.profissao.descricao ?? '',
        },
        ...list,
      ]
    }
    return list
  }, [profissoes, utente?.profissao])

  const sexosComUtente = useMemo(() => {
    const list = sexos
    if (utente?.sexo && !list.some((s) => s.id === utente.sexo?.id)) {
      return [{ id: utente.sexo.id, codigo: utente.sexo.codigo ?? '', descricao: utente.sexo.descricao ?? '' }, ...list]
    }
    return list
  }, [sexos, utente?.sexo])

  const paisesComUtente = useMemo(() => {
    const list = paises
    const nacionalidade = utente?.nacionalidade?.trim()
    if (nacionalidade && !list.some((p) => (p.nome ?? p.codigo ?? p.id) === nacionalidade)) {
      return [{ id: 'temp-nacionalidade', codigo: null, nome: nacionalidade, prefixo: null }, ...list]
    }
    return list
  }, [paises, utente?.nacionalidade])

  const idadeCalculada =
    dataNascimento && /^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)
      ? (() => {
          const hoje = new Date()
          const nasc = new Date(dataNascimento)
          let idade = hoje.getFullYear() - nasc.getFullYear()
          if (
            hoje.getMonth() < nasc.getMonth() ||
            (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())
          ) {
            idade--
          }
          return idade >= 0 ? idade : null
        })()
      : null

  return (
    <div className='grid grid-cols-3 gap-x-6 gap-y-4 min-h-0'>
      {/* Coluna 1: Identificação, filiação, sexo/idade, cartão cidadão */}
      <div className='flex flex-col gap-4'>
        <FormField
          control={form.control}
          name='numeroCartaoIdentificacao'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>N.º Cartão Identificação</FormLabel>
              <FormControl>
                <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='numeroContribuinte'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>N.º Contribuinte *</FormLabel>
              <FormControl>
                <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='nomeMae'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Nome da Mãe</FormLabel>
              <FormControl>
                <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='nomePai'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Nome do Pai</FormLabel>
              <FormControl>
                <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='sexoId'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Sexo</FormLabel>
              <div className='flex gap-1.5 w-full min-w-0'>
                <div className='flex-1 min-w-0'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v === '' ? null : v)}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='...'>
                        {field.value && sexosComUtente.length > 0
                          ? (sexosComUtente.find((s) => s.id === field.value)?.descricao ??
                            utente?.sexo?.descricao) ?? '...'
                          : utente?.sexo?.descricao ?? '...'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {sexosComUtente.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </FormControl>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Gestão de Sexos'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/sexos',
                      'Sexos'
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {idadeCalculada != null && (
          <FormItem className={fieldGap}>
            <FormLabel className={labelClass}>Idade</FormLabel>
            <Input readOnly value={`${idadeCalculada} anos`} className={`${inputClass} bg-muted`} />
          </FormItem>
        )}
        <div className='pt-2 mt-2 border-t border-border'>
          <FormField
            control={form.control}
            name='ccValidado'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                <div className='shrink-0'>
                  <FormControl>
                    <Checkbox
                      id='cc-leitor'
                      checked={!!(field.value != null && field.value !== 0)}
                      onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                    />
                  </FormControl>
                </div>
                <FormLabel htmlFor='cc-leitor' className={`${labelClass} !mb-0 cursor-pointer font-normal`}>
                  Utente inserido por Cartão de Cidadão
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='ccDataValidacao'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Data validação</FormLabel>
                <FormControl>
                  <Input className={inputClass} type='date' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Coluna 2: Data emissão, data validade, data nascimento, naturalidade, estado civil, crónico */}
      <div className='flex flex-col gap-4'>
        <div className='grid grid-cols-2 gap-x-4'>
          <FormField
            control={form.control}
            name='dataEmissaoCartaoIdentificacao'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Data Emissão CC</FormLabel>
                <FormControl>
                  <Input className={inputClass} type='date' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dataValidadeCartaoIdentificacao'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Data Validade CC</FormLabel>
                <FormControl>
                  <Input className={inputClass} type='date' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='grid grid-cols-2 gap-x-4'>
          <FormField
            control={form.control}
            name='dataNascimento'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Data Nascimento</FormLabel>
                <FormControl>
                  <Input className={inputClass} type='date' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='cronico'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormControl>
                  <button
                    type='button'
                    role='checkbox'
                    aria-checked={field.value ?? false}
                    title='Crónico'
                    onClick={() => field.onChange(!(field.value ?? false))}
                    className={cn(
                      'inline-flex h-7 w-fit items-center justify-center rounded-md border-2 px-3 py-1.5 text-xs font-medium transition-colors mt-6',
                      field.value ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background hover:bg-muted'
                    )}
                  >
                    Crónico
                  </button>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name='naturalidade'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Naturalidade</FormLabel>
              <FormControl>
                <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='estadoCivilId'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Estado Civil</FormLabel>
              <div className='flex gap-1.5 w-full min-w-0'>
                <div className='flex-1 min-w-0'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v === '' ? null : v)}>
                      <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='...' />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosCivisComUtente.map((ec) => (
                        <SelectItem key={ec.id} value={ec.id}>
                          {ec.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </FormControl>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Adicionar'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/estados-civis',
                      'Estados Civis'
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='habilitacaoId'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Habilitações</FormLabel>
              <div className='flex gap-1.5 w-full min-w-0'>
                <div className='flex-1 min-w-0'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v === '' ? null : v)}>
                      <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='...' />
                    </SelectTrigger>
                    <SelectContent>
                      {habilitacoesComUtente.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </FormControl>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Adicionar'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/habilitacoes',
                      'Habilitações'
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='grupoSanguineoId'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Grupo Sanguíneo</FormLabel>
              <div className='flex gap-1.5 w-full min-w-0'>
                <div className='flex-1 min-w-0'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v === '' ? null : v)}>
                      <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='...' />
                    </SelectTrigger>
                    <SelectContent>
                      {gruposSanguineosComUtente.map((gs) => (
                        <SelectItem key={gs.id} value={gs.id}>
                          {gs.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                  </FormControl>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Adicionar'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/grupos-sanguineos',
                      'Grupos Sanguíneos'
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Coluna 3: Imagem em cima, nacionalidade, profissão, arquivo */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-3 mb-0'>
          <div className='h-32 w-32 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs'>
            Foto
          </div>
          <div className='mt-1 flex gap-1.5 flex-wrap justify-center'>
            <Button type='button' variant='outline' size='icon' className='h-7 w-7' title='Copiar'>
              <Copy className='h-3 w-3' />
            </Button>
            <Button type='button' variant='outline' size='icon' className='h-7 w-7 text-destructive' title='Remover'>
              <Trash2 className='h-3 w-3' />
            </Button>
            <Button type='button' variant='default' size='sm' className='text-xs h-7'>
              <Camera className='h-3 w-3 mr-1' />
              Tirar fotografia
            </Button>
          </div>
        </div>
        <FormField
          control={form.control}
          name='nacionalidade'
          render={({ field }) => (
            <FormItem className={`${fieldGap} mt-6`}>
              <FormLabel className={labelClass}>Nacionalidade</FormLabel>
              <div className='flex gap-1.5 w-full min-w-0'>
                <div className='flex-1 min-w-0'>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={paisesQuery.isLoading}>
                      <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='País...' />
                    </SelectTrigger>
                    <SelectContent>
                      {paisesComUtente.map((p) => {
                        const label = p.nome ?? p.codigo ?? p.id
                        const value = p.nome ?? p.codigo ?? p.id
                        return (
                          <SelectItem key={p.id} value={value}>
                            {label}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                    </Select>
                  </FormControl>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Países'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/geograficas/paises',
                      'Países'
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='profissaoId'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Profissão</FormLabel>
              <div className='flex gap-1.5 w-full min-w-0'>
                <div className='flex-1 min-w-0'>
                  <FormControl>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v === '' ? null : v)}
                    >
                      <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder='...' />
                    </SelectTrigger>
                    <SelectContent>
                      {profissoesComUtente.map((p) => {
                        const label = p.descricao ?? p.id
                        return (
                          <SelectItem key={p.id} value={p.id}>
                            {label}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                    </Select>
                  </FormControl>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className={buttonIconClass}
                  title='Adicionar profissão'
                  onClick={() =>
                    openPathInApp(
                      navigate,
                      addWindow,
                      '/area-comum/tabelas/tabelas/profissoes',
                      'Profissões'
                    )
                  }
                >
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='arquivo'
          render={({ field }) => (
            <FormItem className={fieldGap}>
              <FormLabel className={labelClass}>Arquivo</FormLabel>
              <FormControl>
                <Input className={inputClass} placeholder='' {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
