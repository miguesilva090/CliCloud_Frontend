import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { ConfigPageCardTitleRow } from '@/components/shared/config-page-card-title-row'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { PageHead } from '@/components/shared/page-head'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useConfigPageEditMode } from '@/hooks/use-config-page-edit-mode'
import { cn } from '@/lib/utils'
import { toast } from '@/utils/toast-utils'
import { AdseService } from '@/lib/services/faturacao/adse-service'
import type { AtualizarWebserviceAdseRequest } from '@/types/dtos/faturacao/adse.dtos'
import {
  ADSE_PERM_ID,
  useAdseClinicasQuery,
  useAdseConfigQuery,
  useAdseOrganismosQuery,
} from '../queries/adse-config-queries'

type FormState = {
  organismoId: string
  clinicaFisioterapiaId: string
  urlAdse: string
  dominioUserAdse: string
  userAdse: string
  passwordAdse: string
  passlocalAdse: string
  numlocalAdse: string
  pastaPdfAdse: string
  nomelocalAdse: string
}

const initialForm: FormState = {
  organismoId: '',
  clinicaFisioterapiaId: '',
  urlAdse: '',
  dominioUserAdse: '',
  userAdse: '',
  passwordAdse: '',
  passlocalAdse: '',
  numlocalAdse: '',
  pastaPdfAdse: '',
  nomelocalAdse: '',
}

export function ConfigAdsePage() {
  const { canChange, isEditing, formEditable, startEditing, cancelEditing, exitEditAfterSave } =
    useConfigPageEditMode(ADSE_PERM_ID)

  const [form, setForm] = useState<FormState>(initialForm)
  const [showPasswords, setShowPasswords] = useState(false)

  const configQuery = useAdseConfigQuery()
  const organismosQuery = useAdseOrganismosQuery()
  const clinicasQuery = useAdseClinicasQuery()

  const saveMutation = useMutation({
    mutationFn: (payload: AtualizarWebserviceAdseRequest) =>
      AdseService(ADSE_PERM_ID).updateConfiguracao(payload),
    onSuccess: () => {
      toast.success('Configurações ADSE guardadas com sucesso.')
      exitEditAfterSave()
      void configQuery.refetch()
    },
    onError: () => toast.error('Falha ao guardar configurações ADSE.'),
  })

  const formLocked = !formEditable
  const fieldDisabled = formLocked || saveMutation.isPending
  const inputClass = cn(
    fieldDisabled && 'cursor-not-allowed bg-muted text-muted-foreground opacity-70',
    '[&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_hsl(var(--background))] dark:[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_hsl(var(--muted))]',
  )
  const selectTriggerClass = cn(
    fieldDisabled && 'cursor-not-allowed bg-muted text-muted-foreground opacity-70',
  )

  useEffect(() => {
    const dto = configQuery.data?.info?.data
    if (!dto) return
    setForm({
      organismoId: dto.organismoId ?? '',
      clinicaFisioterapiaId: dto.clinicaFisioterapiaId ?? '',
      urlAdse: dto.urlAdse ?? '',
      dominioUserAdse: dto.dominioUserAdse ?? '',
      userAdse: dto.userAdse ?? '',
      passwordAdse: dto.passwordAdse ?? '',
      passlocalAdse: dto.passlocalAdse ?? '',
      numlocalAdse: dto.numlocalAdse ? String(dto.numlocalAdse) : '',
      pastaPdfAdse: dto.pastaPdfAdse ?? '',
      nomelocalAdse: dto.nomelocalAdse ?? '',
    })
  }, [configQuery.data])

  const organismos = organismosQuery.data?.info?.data ?? []
  const clinicas = clinicasQuery.data?.info?.data ?? []

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleGuardar = () => {
    if (!form.organismoId) return toast.warning('Organismo ADSE é obrigatório.')
    if (!form.clinicaFisioterapiaId) return toast.warning('Entidade fisioterapia é obrigatória.')
    if (!form.urlAdse.trim()) return toast.warning('URL do WebService é obrigatória.')
    if (!form.dominioUserAdse.trim()) return toast.warning('Domínio é obrigatório.')
    if (!form.userAdse.trim()) return toast.warning('Utilizador é obrigatório.')
    if (!form.passwordAdse.trim()) return toast.warning('Password é obrigatória.')
    if (!form.passlocalAdse.trim()) return toast.warning('Password ADSE local é obrigatória.')
    if (!form.numlocalAdse.trim()) return toast.warning('Número local é obrigatório.')
    if (!form.pastaPdfAdse.trim()) return toast.warning('Caminho pasta PDF é obrigatório.')

    saveMutation.mutate({
      organismoId: form.organismoId,
      clinicaFisioterapiaId: form.clinicaFisioterapiaId,
      urlAdse: form.urlAdse.trim(),
      dominioUserAdse: form.dominioUserAdse.trim(),
      userAdse: form.userAdse.trim(),
      passwordAdse: form.passwordAdse.trim(),
      passlocalAdse: form.passlocalAdse.trim(),
      numlocalAdse: Number(form.numlocalAdse),
      pastaPdfAdse: form.pastaPdfAdse.trim(),
    })
  }

  return (
    <>
      <PageHead title='Configurações ADSE | CliCloud' />
      <DashboardPageContainer>
        <Card>
          <CardHeader className='space-y-0 pb-2'>
            <ConfigPageCardTitleRow
              title='Configurações ADSE'
              canChange={canChange}
              isEditing={isEditing}
              onStartEdit={startEditing}
              onCancelEdit={() => {
                cancelEditing()
                void configQuery.refetch()
              }}
              trailing={
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={() => setShowPasswords((v) => !v)}
                  aria-label={showPasswords ? 'Ocultar passwords' : 'Mostrar passwords'}
                >
                  {showPasswords ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </Button>
              }
            />
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div className='space-y-1'>
                <Label>Organismo ADSE</Label>
                <Select
                  value={form.organismoId || undefined}
                  onValueChange={(v) => setField('organismoId', v)}
                  disabled={fieldDisabled}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder='Selecionar organismo' />
                  </SelectTrigger>
                  <SelectContent>
                    {organismos.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1'>
                <Label>Entidade Fisioterapia</Label>
                <Select
                  value={form.clinicaFisioterapiaId || undefined}
                  onValueChange={(v) => setField('clinicaFisioterapiaId', v)}
                  disabled={fieldDisabled}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder='Selecionar entidade' />
                  </SelectTrigger>
                  <SelectContent>
                    {clinicas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div className='space-y-1 md:col-span-2'>
                <Label htmlFor='url-adse'>URL WebService</Label>
                <Input
                  id='url-adse'
                  className={inputClass}
                  value={form.urlAdse}
                  readOnly={formLocked}
                  disabled={fieldDisabled}
                  onChange={(e) => setField('urlAdse', e.target.value)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='dominio-adse'>Domínio</Label>
                <Input
                  id='dominio-adse'
                  className={inputClass}
                  value={form.dominioUserAdse}
                  readOnly={formLocked}
                  disabled={fieldDisabled}
                  onChange={(e) => setField('dominioUserAdse', e.target.value)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='user-adse'>Utilizador</Label>
                <Input
                  id='user-adse'
                  className={inputClass}
                  name='adse-ws-user'
                  autoComplete='off'
                  value={form.userAdse}
                  readOnly={formLocked}
                  disabled={fieldDisabled}
                  onChange={(e) => setField('userAdse', e.target.value)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='password-adse'>Password</Label>
                <Input
                  id='password-adse'
                  className={inputClass}
                  type={showPasswords ? 'text' : 'password'}
                  autoComplete='new-password'
                  value={form.passwordAdse}
                  readOnly={formLocked}
                  disabled={fieldDisabled}
                  onChange={(e) => setField('passwordAdse', e.target.value)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='passlocal-adse'>Password ADSE (local)</Label>
                <Input
                  id='passlocal-adse'
                  className={inputClass}
                  type={showPasswords ? 'text' : 'password'}
                  autoComplete='new-password'
                  value={form.passlocalAdse}
                  readOnly={formLocked}
                  disabled={fieldDisabled}
                  onChange={(e) => setField('passlocalAdse', e.target.value)}
                />
              </div>
              <div className='space-y-1'>
                <Label htmlFor='numlocal-adse'>Número Local</Label>
                <Input
                  id='numlocal-adse'
                  className={inputClass}
                  type='number'
                  value={form.numlocalAdse}
                  readOnly={formLocked}
                  disabled={fieldDisabled}
                  onChange={(e) => setField('numlocalAdse', e.target.value)}
                />
              </div>
              <div className='space-y-1 md:col-span-2'>
                <Label htmlFor='pasta-pdf-adse'>Caminho Pasta PDF</Label>
                <Input
                  id='pasta-pdf-adse'
                  className={inputClass}
                  value={form.pastaPdfAdse}
                  readOnly={formLocked}
                  disabled={fieldDisabled}
                  onChange={(e) => setField('pastaPdfAdse', e.target.value)}
                />
              </div>
              {form.nomelocalAdse ? (
                <div className='space-y-1 md:col-span-2'>
                  <Label>Nome local (automático)</Label>
                  <Input className={inputClass} value={form.nomelocalAdse} readOnly disabled />
                </div>
              ) : null}
            </div>

            <div className='flex justify-end'>
              <Button onClick={handleGuardar} disabled={!formEditable || saveMutation.isPending}>
                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardPageContainer>
    </>
  )
}
