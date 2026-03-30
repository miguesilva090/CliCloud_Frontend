import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast-utils'
import { useGetGrupoViasAdministracao } from '../queries/listagem-grupo-vias-administracao-queries'
import { GrupoViasAdministracaoService } from '@/lib/services/artigos/grupo-vias-administracao-service'
import { ViaAdministracaoService } from '@/lib/services/artigos/via-administracao-service'
import { ResponseStatus } from '@/types/api/responses'
import type { ViaAdministracaoDTO } from '@/types/dtos/artigos/via-administracao.dtos'
import type { CreateGrupoViasAdministracaoLinhaRequest } from '@/types/dtos/artigos/grupo-vias-administracao.dtos'

const LISTAGEM_PATH = '/area-comum/tabelas/stocks/grupo-vias-administracao'

type LinhaRow = {
  tempId: string
  viaId: string
  viaDescricao: string
}

export function GrupoViasAdministracaoEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // Na rota /novo não existe :id, por isso id vem undefined. Em /:id/editar o id é o GUID.
  const isNew = !id || id === 'novo'

  const { data: response, isLoading } = useGetGrupoViasAdministracao(
    isNew ? null : id ?? null,
  )

  const [descricao, setDescricao] = useState('')
  const [linhas, setLinhas] = useState<LinhaRow[]>([])
  const [selectedLinhaIds, setSelectedLinhaIds] = useState<Set<string>>(
    new Set(),
  )
  const [vias, setVias] = useState<ViaAdministracaoDTO[]>([])
  const [viasLoading, setViasLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const grupo = response?.info?.data

  useEffect(() => {
    if (!isNew && grupo) {
      setDescricao(grupo.descricao ?? '')
      const viasList = grupo.vias ?? []
      setLinhas(
        viasList.map((v, idx) => ({
          tempId: v.id ?? `line-${idx}`,
          viaId: v.viaId ?? '',
          viaDescricao: v.viaDescricao ?? v.descricao ?? '',
        })),
      )
    }
    if (isNew) {
      setDescricao('')
      setLinhas([])
    }
  }, [isNew, grupo])

  useEffect(() => {
    let cancelled = false
    setViasLoading(true)
    ViaAdministracaoService()
      .getViaAdministracaoLight()
      .then((res) => {
        if (cancelled) return
        const list = res?.info?.data ?? []
        setVias(Array.isArray(list) ? list : [])
      })
      .finally(() => {
        if (!cancelled) setViasLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleVoltar = () => {
    navigate(LISTAGEM_PATH)
  }

  const handleInserir = () => {
    setLinhas((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}`,
        viaId: '',
        viaDescricao: '',
      },
    ])
  }

  const handleRemover = () => {
    if (selectedLinhaIds.size === 0) {
      toast.error('Selecione pelo menos uma linha para remover.')
      return
    }
    setLinhas((prev) => prev.filter((l) => !selectedLinhaIds.has(l.tempId)))
    setSelectedLinhaIds(new Set())
  }

  const toggleLinhaSelection = (tempId: string) => {
    setSelectedLinhaIds((prev) => {
      const next = new Set(prev)
      if (next.has(tempId)) next.delete(tempId)
      else next.add(tempId)
      return next
    })
  }

  const updateLinha = (tempId: string, field: keyof LinhaRow, value: string) => {
    setLinhas((prev) =>
      prev.map((l) => {
        if (l.tempId !== tempId) return l
        if (field === 'viaId') {
          const via = vias.find((v) => v.id === value)
          return {
            ...l,
            viaId: value,
            viaDescricao: via?.descricao ?? '',
          }
        }
        return { ...l, [field]: value }
      }),
    )
  }

  const buildLinhasPayload = (): CreateGrupoViasAdministracaoLinhaRequest[] => {
    return linhas
      .filter((l) => l.viaId?.trim())
      .map((l) => ({
        viaId: l.viaId || undefined,
        descricao: l.viaDescricao?.trim() || undefined,
      }))
  }

  const handleGuardar = async () => {
    if (isSaving) return
    if (!descricao?.trim()) {
      toast.error('Designação é obrigatória.')
      return
    }

    setIsSaving(true)
    try {
      const client = GrupoViasAdministracaoService()
      const linhasPayload = buildLinhasPayload()

      if (isNew) {
        const res = await client.createGrupoViasAdministracao({
          descricao: descricao.trim(),
          linhas: linhasPayload.length > 0 ? linhasPayload : undefined,
        })
        if (res.info.status === ResponseStatus.Success && res.info.data) {
          toast.success('Grupo de Vias de Administração criado com sucesso.')
          navigate(`${LISTAGEM_PATH}/${res.info.data}/editar`)
        } else {
          const msg =
            res.info.messages?.['$']?.[0] ??
            'Falha ao criar Grupo de Vias de Administração.'
          toast.error(msg)
        }
      } else if (id) {
        const res = await client.updateGrupoViasAdministracao(id, {
          id,
          descricao: descricao.trim(),
          linhas: linhasPayload.length > 0 ? linhasPayload : undefined,
        })
        if (res.info.status === ResponseStatus.Success) {
          toast.success('Grupo de Vias de Administração atualizado com sucesso.')
        } else {
          const msg =
            res.info.messages?.['$']?.[0] ??
            'Falha ao atualizar Grupo de Vias de Administração.'
          toast.error(msg)
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(
        err?.message ?? 'Ocorreu um erro ao guardar o Grupo de Vias de Administração.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const title = isNew
    ? 'Novo Grupo de Vias de Administração'
    : 'Editar Grupo de Vias de Administração'

  if (!isNew && !grupo && !isLoading && response !== undefined) {
    return (
      <>
        <PageHead title={`${title} | Stocks | CliCloud`} />
        <DashboardPageContainer>
          <p className='text-muted-foreground'>Grupo não encontrado.</p>
          <Button variant='outline' onClick={handleVoltar} className='mt-4'>
            Voltar
          </Button>
        </DashboardPageContainer>
      </>
    )
  }

  return (
    <>
      <PageHead title={`Grupo Vias de Administração | Stocks | CliCloud`} />
      <DashboardPageContainer>
        <div className='relative z-[100] flex items-center justify-between gap-4 mb-4 rounded-t-lg border border-b-0 bg-muted/40 px-4 py-3'>
          <h1 className='text-lg font-semibold'>Grupo Vias de Administração</h1>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleVoltar}
              className='gap-1'
            >
              <ArrowLeft className='h-4 w-4' />
              Voltar
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={() => handleGuardar()}
              disabled={isSaving}
              className='gap-1 bg-primary text-primary-foreground hover:bg-primary/90'
            >
              <Plus className='h-4 w-4' />
              Guardar
            </Button>
          </div>
        </div>

        <div className='relative z-0 rounded-b-lg border border-t-0 bg-card p-4 space-y-6'>
          <div className='grid gap-2 max-w-md'>
            <Label htmlFor='descricao'>Designação</Label>
            <Input
              id='descricao'
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder='Designação...'
              maxLength={50}
              disabled={isLoading}
            />
          </div>

          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                size='sm'
                onClick={handleInserir}
                disabled={viasLoading || isLoading}
                className='gap-1 bg-green-600 hover:bg-green-700 text-white'
              >
                <Plus className='h-4 w-4' />
                Inserir
              </Button>
              <Button
                type='button'
                size='sm'
                variant='destructive'
                onClick={handleRemover}
                disabled={selectedLinhaIds.size === 0}
                className='gap-1'
              >
                <X className='h-4 w-4' />
                Remover
              </Button>
            </div>

            <div className='border rounded-md overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='w-10 p-2 text-left'></th>
                    <th className='p-2 text-left font-medium'>Código</th>
                    <th className='p-2 text-left font-medium'>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className='p-4 text-center text-muted-foreground'
                      >
                        Nenhuma via associada. Use Inserir para adicionar.
                      </td>
                    </tr>
                  ) : (
                    linhas.map((linha, idx) => (
                      <tr
                        key={linha.tempId}
                        className='border-b last:border-b-0 hover:bg-muted/30'
                      >
                        <td className='p-2'>
                          <input
                            type='checkbox'
                            checked={selectedLinhaIds.has(linha.tempId)}
                            onChange={() => toggleLinhaSelection(linha.tempId)}
                            className='rounded'
                          />
                        </td>
                        <td className='p-2'>{idx + 1}</td>
                        <td className='p-2'>
                          <Select
                            value={linha.viaId || ''}
                            onValueChange={(value) =>
                              updateLinha(linha.tempId, 'viaId', value)
                            }
                            disabled={viasLoading}
                          >
                            <SelectTrigger className='h-8 min-w-[180px]'>
                              <SelectValue placeholder='Selecionar via...' />
                            </SelectTrigger>
                            <SelectContent>
                              {vias.map((via) => (
                                <SelectItem key={via.id} value={via.id}>
                                  {via.descricao}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardPageContainer>
    </>
  )
}

