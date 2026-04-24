import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ConfigPageCardTitleRow } from '@/components/shared/config-page-card-title-row'
import { modules } from '@/config/modules'
import { useConfigPageEditMode } from '@/hooks/use-config-page-edit-mode'
import { toast } from '@/utils/toast-utils'
import { ConfigExamesSemPapelService } from '@/lib/services/core/config-exames-sem-papel-service'
import type {
    AtualizarConfigExamesSemPapelRequest,
    ConfigExamesSemPapelDTO,
} from '@/types/dtos/core/config-exames-sem-papel.dtos'

type ConfigExamesSemPapelForm = {
    codigoEntidade: string
    username: string
    password: string

    pesquisaPrestacao: string
    agendamento: string
    efetivacao: string
    anulacao: string
    consultaCancelados: string
    efetuadosNaoPrescritos: string
    taxasModeradoras: string

    relatorioResultados: string
    usernamePartilhaResultados: string
    passwordPartilhaResultados: string

    relatorioResultadosSemRequisicao: string
    usernamePartilhaResultadosSemRequisicao: string
    passwordPartilhaResultadosSemRequisicao: string

    areaPrestacao: string
}

const examesSemPapelPermId = modules.areaComum.permissions.configuracoesExamesSemPapel.id

const initialForm: ConfigExamesSemPapelForm = {
    codigoEntidade: '',
    username: '',
    password: '',

    pesquisaPrestacao: '', 
    agendamento: '',
    efetivacao: '', 
    anulacao: '',
    consultaCancelados: '', 
    efetuadosNaoPrescritos: '', 
    taxasModeradoras: '', 

    relatorioResultados: '', 
    usernamePartilhaResultados: '',
    passwordPartilhaResultados: '', 

    relatorioResultadosSemRequisicao: '', 
    usernamePartilhaResultadosSemRequisicao: '',
    passwordPartilhaResultadosSemRequisicao: '', 

    areaPrestacao: '',
}

export function ConfigExamesSemPapelPage() {
    const {
        canChange,
        isEditing,
        formEditable,
        startEditing,
        cancelEditing,
        exitEditAfterSave,
    } = useConfigPageEditMode(examesSemPapelPermId)
    const formLocked = !formEditable

    const [form, setForm] = useState<ConfigExamesSemPapelForm>(initialForm)
    const [showPasswords, setShowPasswords] = useState(false)

    const configQuery = useQuery({
        queryKey: ['config-exames-sem-papel', 'current'],
        queryFn: () => ConfigExamesSemPapelService().getConfiguracaoAtual(),
    })

    const saveMutation = useMutation({
        mutationFn: (payload: AtualizarConfigExamesSemPapelRequest) => 
            ConfigExamesSemPapelService().updateConfiguracao(payload),
    onSuccess: () => {
        toast.success('Configuração de Exames Sem Papel guardada com sucesso.')
        exitEditAfterSave()
        void configQuery.refetch()
    },
    onError: () => {
        toast.error('Falha ao guardar configuração de Exames Sem Papel.')
    },
    })

    useEffect(() =>  {
        const response = configQuery.data as any
        const dto = response?.info?.data as ConfigExamesSemPapelDTO | undefined 
        if (!dto) return 


        setForm({
            codigoEntidade: dto.codigoEntidade != null ? String(dto.codigoEntidade) : '',
            username: dto.username ?? '',
            password: dto.password ?? '',

            pesquisaPrestacao: dto.pesquisaPrestacao ?? '',
            agendamento: dto.agendamento ?? '',
            efetivacao: dto.efetivacao ?? '',
            anulacao: dto.anulacao ?? '',
            consultaCancelados: dto.consultaCancelados ?? '', 
            efetuadosNaoPrescritos: dto.efetuadosNaoPrescritos ?? '',
            taxasModeradoras: dto.taxasModeradoras ?? '', 

            relatorioResultados: dto.relatorioResultados ?? '', 
            usernamePartilhaResultados: dto.usernamePartilhaResultados ?? '',
            passwordPartilhaResultados: dto.passwordPartilhaResultados ?? '',

            relatorioResultadosSemRequisicao: dto.relatorioResultadosSemRequisicao ?? '',
            usernamePartilhaResultadosSemRequisicao: dto.usernamePartilhaResultadosSemRequisicao ?? '',
            passwordPartilhaResultadosSemRequisicao: dto.passwordPartilhaResultadosSemRequisicao ?? '', 

            areaPrestacao: dto.areaPrestacao ?? '',
        })
    }, [configQuery.data])

    const handleChange = <K extends keyof ConfigExamesSemPapelForm>(
        key: K,
        value: ConfigExamesSemPapelForm[K],
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleGuardar = () => {
        if(!form.pesquisaPrestacao.trim()) {
            return toast.warning('Endpoint Pesquisa de Prestação é obrigatório.')
        }

        const codigoEntidadeNumber =
            form.codigoEntidade.trim() === '' ? null : Number(form.codigoEntidade)

        if(codigoEntidadeNumber != null && Number.isNaN(codigoEntidadeNumber)) {
            return toast.warning('Código Entidade inválido ')
        }

        if(!form.pesquisaPrestacao.trim()) {
            return toast.warning('Endpoint Pesquisa Prestação é obrigatório')
        }

        if(!form.agendamento.trim()) {
            return toast.warning('Endpoint Agendamento é obrigatório')
        }

        if(!form.efetivacao.trim()) {
            return toast.warning('Endpoint Efetivação é obrigatório')
        }

        if(!form.anulacao.trim()) {
            return toast.warning('Endpoint Anulação é obrigatório')
        }

        const payload: AtualizarConfigExamesSemPapelRequest = {
            codigoEntidade: codigoEntidadeNumber,
            username: form.username.trim() || null,
            password: form.password.trim() || null, 

            pesquisaPrestacao: form.pesquisaPrestacao.trim() || null,
            agendamento: form.agendamento.trim() || null, 
            efetivacao: form.efetivacao.trim() || null, 
            anulacao: form.anulacao.trim() || null, 
            consultaCancelados: form.consultaCancelados.trim() || null, 
            efetuadosNaoPrescritos: form.efetuadosNaoPrescritos.trim() || null, 
            taxasModeradoras: form.taxasModeradoras.trim() || null, 

            relatorioResultados: form.relatorioResultados.trim() || null, 
            usernamePartilhaResultados: form.usernamePartilhaResultados.trim() || null, 
            passwordPartilhaResultados: form.passwordPartilhaResultados || null, 

            relatorioResultadosSemRequisicao: form.relatorioResultadosSemRequisicao.trim() || null, 
            usernamePartilhaResultadosSemRequisicao: form.usernamePartilhaResultadosSemRequisicao.trim() || null, 
            passwordPartilhaResultadosSemRequisicao: form.passwordPartilhaResultadosSemRequisicao || null, 

            areaPrestacao: form.areaPrestacao.trim() || null,
            
        }

        saveMutation.mutate(payload)
    }

    const passwordType = showPasswords ? 'text' : 'password'
    const fieldDisabled = formLocked || saveMutation.isPending

    return (
        <>
        <PageHead title='Configuracao Exames Sem Papel | CliCloud' />
        <DashboardPageContainer>
            <div className='space-y-4'>
                <Card>
                    <CardHeader className='space-y-0 pb-2'>
                        <ConfigPageCardTitleRow
                            title='Configuração Exames Sem Papel'
                            canChange={canChange}
                            isEditing={isEditing}
                            onStartEdit={startEditing}
                            onCancelEdit={() => {
                                cancelEditing()
                                void configQuery.refetch()
                            }}
                            trailing={
                                <Button type='button' variant='outline' onClick={() => setShowPasswords((v) => !v)}>
                                    {showPasswords ? (
                                        <EyeOff className='mr-2 h-4 w-4' />
                                    ) : (
                                        <Eye className='mr-2 h-4 w-4' />
                                    )}
                                    {showPasswords ? 'Ocultar passwords' : 'Mostrar passwords'}
                                </Button>
                            }
                        />
                    </CardHeader>

                    <CardContent className='space-y-6'>
                        {configQuery.isLoading ? (
                            <p className='text-sm text-muted-foreground'>A carregar configurações...</p>
                        ) : null}
                        {configQuery.isError ? (
                            <p className='text-sm text-destructive'>
                                Falha ao carregar configuração atual.
                            </p>
                        ): null}
                        
                        <section className='space-y-3'>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                                <div className='space-y-1'>
                                    <Label>Código</Label>
                                    <Input value='1' disabled />
                                </div>
                                <div className='space-y-1'>
                                    <Label htmlFor='codigo-entidade'>Código Entidade</Label>
                                    <Input
                                        id='codigo-entidade'
                                        type='number'
                                        value={form.codigoEntidade}
                                        onChange={(e) => handleChange('codigoEntidade', e.target.value)}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className='space-y-3 rounded-md border p-4'>
                            <h3 className='text-sm font-semibold text-primary'>Exames Sem Papel - WebServices</h3>
                            <div className='grid grid-cols-1 gap-3'>
                                <div className='space-y-1'>
                                    <Label>Pesquisa Prestação</Label>
                                    <Input
                                        value={form.pesquisaPrestacao}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('pesquisaPrestacao', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Agendamento</Label>
                                    <Input
                                        value={form.agendamento}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('agendamento', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Efetivação</Label>
                                    <Input
                                        value={form.efetivacao}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('efetivacao', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Anulação</Label>
                                    <Input
                                        value={form.anulacao}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('anulacao', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Consulta Cancelados</Label>
                                    <Input 
                                        value={form.consultaCancelados}
                                        onChange={(e) => handleChange('consultaCancelados', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Efetuados Não Prescritos</Label>
                                    <Input
                                        value={form.efetuadosNaoPrescritos}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('efetuadosNaoPrescritos', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Taxas Moderadoras</Label>
                                    <Input
                                        value={form.taxasModeradoras}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('taxasModeradoras', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                <div className='space-y-1'>
                                    <Label htmlFor='username-principal'>Utilizador</Label>
                                    <Input
                                        id='username-principal'
                                        value={form.username}
                                        onChange={(e) => handleChange('username', e.target.value)}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label htmlFor='password-principal'>Palavra-passe</Label>
                                    <Input
                                        id='password-principal'
                                        type={passwordType}
                                        value={form.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className='space-y-3 rounded-md border p-4'>
                            <h3 className='text-sm font-semibold text-primary'>
                                Envio de Resultados
                            </h3>
                            <div className='grid grid-cols-1 gap-3'>
                                <div className='space-y-1'>
                                    <Label>Envio Resultados</Label>
                                    <Input
                                        value={form.relatorioResultados}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('relatorioResultados', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                <div className='space-y-1'>
                                    <Label>Utilizador</Label>
                                    <Input
                                        value={form.usernamePartilhaResultados}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('usernamePartilhaResultados', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Palavra-passe</Label>
                                    <Input
                                        type={passwordType}
                                        value={form.passwordPartilhaResultados}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('passwordPartilhaResultados', e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className='space-y-3 rounded-md border p-4'>
                            <h3 className='text-sm font-semibold text-primary'>
                                Envio de Resultados Sem Requisição
                            </h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                <div className='space-y-1'>
                                    <Label>Envio Resultados Sem Requisição</Label>
                                    <Input
                                        value={form.relatorioResultadosSemRequisicao}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('relatorioResultadosSemRequisicao', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Área de Prestação</Label>
                                    <Input
                                        value={form.areaPrestacao}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('areaPrestacao', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                <div className='space-y-1'>
                                    <Label>Utilizador</Label>
                                    <Input
                                        value={form.usernamePartilhaResultadosSemRequisicao}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('usernamePartilhaResultadosSemRequisicao', e.target.value)}
                                    />
                                </div>
                                <div className='space-y-1'>
                                    <Label>Palavra-passe</Label>
                                    <Input
                                        type={passwordType}
                                        value={form.passwordPartilhaResultadosSemRequisicao}
                                        readOnly={formLocked}
                                        disabled={fieldDisabled}
                                        onChange={(e) => handleChange('passwordPartilhaResultadosSemRequisicao', e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <div className='flex justify-end'>
                            <Button onClick={handleGuardar} disabled={!formEditable || saveMutation.isPending}>
                                {saveMutation.isPending ? 'A guardar...' : 'Guardar'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardPageContainer>
        </>
    )
}