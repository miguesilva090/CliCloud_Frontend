import type { UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Plus, User } from 'lucide-react'
import type { MedicoDTO } from '@/types/dtos/saude/medicos.dtos'
import type { MedicoEditFormValues } from '@/pages/medicos/types/medico-edit-form-types'
import { fieldGap, labelClass, inputClass, buttonIconClass } from '@/lib/form-styles'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp } from '@/utils/window-utils'
import { ImageUploader } from '@/components/shared/image-uploader'

export function TabDadosPessoais({
  form,
  medico,
}: {
  form: UseFormReturn<MedicoEditFormValues>
  medico: MedicoDTO | undefined
}) {
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)

  return (
    <div className='grid grid-cols-12 gap-x-6'>
      {/* Área esquerda: campos em linhas (replica legado col-md-10) */}
      <div className='col-span-9 flex flex-col gap-4'>
        {/* Linha 1: Nº Cartão Identificação | Data Emissão | Arquivo */}
        <div className='grid grid-cols-3 gap-x-4'>
          <FormField
            control={form.control}
            name='numeroCartaoIdentificacao'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Número Cartão de Identificação</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder='Número Cartão de Identificação...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='dataEmissaoCartaoIdentificacao'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Data Emissão</FormLabel>
                <FormControl>
                  <Input className={inputClass} type='date' placeholder='Data Emissão...' {...field} value={field.value ?? ''} />
                </FormControl>
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
                  <Input className={inputClass} placeholder='Arquivo...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Linha 2: Nº Contribuinte | Nº Identificação Bancária | Nome Utilizador [+] */}
        <div className='grid grid-cols-3 gap-x-4'>
          <FormField
            control={form.control}
            name='numeroContribuinte'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Número de Contribuinte</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder='Número de Contribuinte...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='numeroIdentificacaoBancaria'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>N.º de Identificação Bancária</FormLabel>
                <FormControl>
                  <Input className={inputClass} placeholder='N.º de Identificação Bancária...' {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='nomeUtilizador'
            render={({ field }) => (
              <FormItem className={fieldGap}>
                <FormLabel className={labelClass}>Nome Utilizador</FormLabel>
                <div className='flex gap-1.5 w-full min-w-0'>
                  <FormControl>
                    <Input className={inputClass} placeholder='Nome Utilizador...' {...field} value={field.value ?? ''} />
                  </FormControl>
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
                        '/area-comum/tabelas/entidades/funcionarios',
                        'Funcionários',
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

        {/* Linha 3: GlobalBooking */}
        <div>
          <FormField
            control={form.control}
            name='globalbooking'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center gap-2 space-y-0'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className={`${labelClass} !mb-0 font-normal`}>GlobalBooking</FormLabel>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Área direita: Foto + Assinatura (replica legado col-md-2 + col-md-2) */}
      <div className='col-span-3 flex flex-col gap-4 items-center'>
        <FormField
          control={form.control}
          name='urlFoto'
          render={({ field }) => (
            <FormItem className='flex flex-col gap-1'>
              <FormLabel className={labelClass}>Imagem</FormLabel>
              <ImageUploader
                key={`medico-url-foto-${medico?.id ?? 'new'}-${medico?.urlFoto ?? 'sem'}`}
                uploadUrl='/client/utility/ImageUpload/upload-image'
                fieldName='File'
                additionalFields={{ Subfolder: 'Medicos' }}
                currentImageUrl={field.value ?? undefined}
                showMetadata={false}
                variant='compact'
                placeholder=''
                actionButtonLabel='Imagem'
                actionButtonShowLabel={false}
                showFileTypesHint={false}
                showRemoveButtonAlways
                rootClassName='border-solid border-[#2aa89a] bg-background/0 backdrop-blur-0 w-[220px] max-w-[220px] h-[110px]'
                actionButtonClassName='bg-[#2aa89a] text-white hover:bg-[#239b8f]'
                placeholderIcon={<User className='h-8 w-8 text-muted-foreground/40' />}
                onPartialUrlChange={(partialUrl) => field.onChange(partialUrl ?? '')}
                onUploadSuccess={(partialUrl) => field.onChange(partialUrl ?? '')}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='urlFotoAssinatura'
          render={({ field }) => (
            <FormItem className='flex flex-col gap-1'>
              <FormLabel className={labelClass}>Assinatura</FormLabel>
              <ImageUploader
                key={`medico-url-foto-assinatura-${medico?.id ?? 'new'}-${medico?.urlFotoAssinatura ?? 'sem'}`}
                uploadUrl='/client/utility/ImageUpload/upload-image'
                fieldName='File'
                additionalFields={{ Subfolder: 'MedicosAssinaturas' }}
                currentImageUrl={field.value ?? undefined}
                showMetadata={false}
                variant='compact'
                placeholder=''
                actionButtonLabel='Ficheiro'
                actionButtonShowLabel={false}
                showFileTypesHint={false}
                showRemoveButtonAlways
                rootClassName='border-solid border-[#2aa89a] bg-background/0 backdrop-blur-0 w-[220px] max-w-[220px] h-[110px]'
                actionButtonClassName='bg-[#2aa89a] text-white hover:bg-[#239b8f]'
                placeholderIcon={<User className='h-8 w-8 text-muted-foreground/40' />}
                onPartialUrlChange={(partialUrl) => field.onChange(partialUrl ?? '')}
                onUploadSuccess={(partialUrl) => field.onChange(partialUrl ?? '')}
              />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
