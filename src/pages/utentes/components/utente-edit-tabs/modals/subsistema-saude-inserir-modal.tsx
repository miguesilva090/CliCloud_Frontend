import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { useOrganismosLight } from '@/lib/services/utility/entity-quick-create/entity-quick-create-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { fieldGap, labelClass, inputClass, buttonIconClass } from '../utente-edit-tabs-constants'
import { openPathInApp } from '@/utils/window-utils'

const schema = z.object({
  organismoId: z.string().min(1, 'Organismo é obrigatório'),
  numeroBeneficiario: z.string().optional(),
  sigla: z.string().optional(),
  nomeBeneficiario: z.string().optional(),
  dataValidade: z.string().optional(),
  numeroApolice: z.string().optional(),
})

export type SubsistemaSaudeInserirFormValues = z.infer<typeof schema>

export type SubsistemaSaudeRowInsert = {
  cod: number
  organismoId: string
  designacao: string
  numeroBeneficiario?: string
  sigla?: string
  nomeBeneficiario?: string
  dataCartao?: string
  numeroApolice?: string
}

export type SubsistemaSaudeInserirModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (row: SubsistemaSaudeRowInsert) => void
}

export function SubsistemaSaudeInserirModal({
  open,
  onOpenChange,
  onConfirm,
}: SubsistemaSaudeInserirModalProps) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const [organismoSearch, setOrganismoSearch] = useState('')
  const organismosQuery = useOrganismosLight(organismoSearch)

  const handleOpenCriarOrganismo = () => {
    // Ir para a listagem de Organismos (como no legado),
    // onde o utilizador pode criar/editar registros.
    openPathInApp(
      navigate,
      addWindow,
      '/area-comum/tabelas/entidades/organismos',
      'Organismos'
    )
  }

  const organismos = organismosQuery.data?.info?.data ?? []
  const organismosOptions = useMemo(
    () =>
      organismos.map(
        (o: { id: string; nome?: string | null; abreviatura?: string | null }) => ({
          value: o.id,
          label: o.nome ?? o.abreviatura ?? o.id,
          secondary: o.abreviatura ?? undefined,
        })
      ),
    [organismos]
  )

  const form = useForm<SubsistemaSaudeInserirFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      organismoId: '',
      numeroBeneficiario: '',
      sigla: '',
      nomeBeneficiario: '',
      dataValidade: '',
      numeroApolice: '',
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset()
    onOpenChange(next)
  }

  const onSubmitValues = (values: SubsistemaSaudeInserirFormValues) => {
    const designacao =
      organismosOptions.find((o) => o.value === values.organismoId)?.label ?? '—'
    const row: SubsistemaSaudeRowInsert = {
      cod: Date.now(),
      organismoId: values.organismoId,
      designacao,
      numeroBeneficiario: values.numeroBeneficiario?.trim() || undefined,
      sigla: values.sigla?.trim() || undefined,
      nomeBeneficiario: values.nomeBeneficiario?.trim() || undefined,
      dataCartao: values.dataValidade?.trim() || undefined,
      numeroApolice: values.numeroApolice?.trim() || undefined,
    }
    onConfirm(row)
    // Fechar o modal após o parent atualizar o state (evita que a nova linha não apareça)
    setTimeout(() => {
      form.reset()
      handleOpenChange(false)
    }, 0)
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.stopPropagation()
    form.handleSubmit(onSubmitValues)(e)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className='w-[520px] max-w-[520px] p-6 pr-12 overflow-hidden box-border'
        aria-describedby='subsistema-saude-modal-desc'
      >
        <DialogHeader>
          <DialogTitle className='leading-tight'>Inserir subsistema de saúde</DialogTitle>
          <DialogDescription id='subsistema-saude-modal-desc' className='sr-only'>
            Formulário para adicionar uma linha ao subsistema de saúde do utente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className='space-y-4 min-w-0'>
            <FormField
              control={form.control}
              name='organismoId'
              render={({ field }) => (
                <FormItem className={`${fieldGap} min-w-0`}>
                  <FormLabel className={labelClass}>Organismo</FormLabel>
                  <div className='flex gap-1.5 w-full min-w-0'>
                    <div className='min-w-0 flex-1 overflow-hidden'>
                      <FormControl>
                        <AsyncCombobox
                          value={field.value}
                          onChange={field.onChange}
                          items={organismosOptions}
                          isLoading={organismosQuery.isFetching}
                          placeholder='Selecionar organismo…'
                          searchPlaceholder='Pesquisar organismo…'
                          searchValue={organismoSearch}
                          onSearchValueChange={setOrganismoSearch}
                          className={`${inputClass} min-w-0`}
                        />
                      </FormControl>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='icon'
                      className={buttonIconClass}
                      title='Criar novo organismo'
                      onClick={handleOpenCriarOrganismo}
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
              name='numeroBeneficiario'
              render={({ field }) => (
                <FormItem className={`${fieldGap} min-w-0`}>
                  <FormLabel className={labelClass}>Número Beneficiário</FormLabel>
                  <FormControl>
                    <Input placeholder='Número Beneficiário' className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='sigla'
              render={({ field }) => (
                <FormItem className={`${fieldGap} min-w-0`}>
                  <FormLabel className={labelClass}>Sigla</FormLabel>
                  <FormControl>
                    <Input placeholder='Sigla...' className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='nomeBeneficiario'
              render={({ field }) => (
                <FormItem className={`${fieldGap} min-w-0`}>
                  <FormLabel className={labelClass}>Nome Beneficiário</FormLabel>
                  <FormControl>
                    <Input placeholder='Nome Beneficiário...' className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dataValidade'
              render={({ field }) => (
                <FormItem className={`${fieldGap} min-w-0`}>
                  <FormLabel className={labelClass}>Data Validade</FormLabel>
                  <FormControl>
                    <Input type='date' className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='numeroApolice'
              render={({ field }) => (
                <FormItem className={`${fieldGap} min-w-0`}>
                  <FormLabel className={labelClass}>Apólice</FormLabel>
                  <FormControl>
                    <Input placeholder='Apólice...' className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit'>OK</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

