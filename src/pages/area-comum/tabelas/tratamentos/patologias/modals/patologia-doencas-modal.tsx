import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { DoencaService } from '@/lib/services/doencas/doenca-service'
import type { PaginatedRequest } from '@/types/api/responses'
import type { DoencaTableDTO } from '@/types/dtos/doencas/doenca.dtos'

export function PatologiaDoencasModal({
  open,
  onOpenChange,
  initialSelectedIds,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSelectedIds: string[]
  onConfirm: (items: { id: string; title: string; code?: string | null }[]) => void
}) {
  const [keyword, setKeyword] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const doencasMapRef = useRef<Map<string, DoencaTableDTO>>(new Map())

  useEffect(() => {
    if (!open) return
    setSelected(new Set(initialSelectedIds))
    setKeyword('')
    setPageNumber(1)
  }, [open, initialSelectedIds])

  const params: PaginatedRequest = useMemo(
    () => ({
      pageNumber,
      pageSize,
      filters: keyword ? { keyword } : undefined,
      sorting: [{ id: 'title', desc: false }],
    }),
    [pageNumber, pageSize, keyword]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['patologia-doencas-picker', params, { open }],
    queryFn: () => DoencaService().getDoencasPaginated(params),
    enabled: open,
    staleTime: 60 * 1000,
  })

  const rows: DoencaTableDTO[] = data?.info?.data ?? []
  const totalPages = data?.info?.totalPages ?? 0

  useEffect(() => {
    // acumula no mapa todas as doenças já vistas (todas as páginas)
    const map = doencasMapRef.current
    rows.forEach((r) => {
      map.set(r.id, r)
    })
  }, [rows])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Doenças</DialogTitle>
          <DialogDescription className='sr-only'>
            Seleção de doenças para associar à patologia.
          </DialogDescription>
        </DialogHeader>

        <div className='flex items-center gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              className='pl-8'
              placeholder='Procurar...'
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setPageNumber(1)
              }}
            />
          </div>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              setKeyword('')
              setPageNumber(1)
            }}
          >
            Limpar
          </Button>
        </div>

        <div className='border rounded-md overflow-hidden'>
          <div className='max-h-[420px] overflow-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-muted/40 sticky top-0'>
                <tr>
                  <th className='w-10 p-2' />
                  <th className='p-2 text-left'>Título</th>
                  <th className='p-2 text-left w-32'>Código</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className='p-4 text-center text-muted-foreground'>
                      A carregar…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='p-4 text-center text-muted-foreground'>
                      Sem resultados.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className='border-t hover:bg-muted/30 cursor-pointer'
                      onClick={() => toggle(r.id)}
                    >
                      <td className='p-2'>
                        <Checkbox
                          checked={selected.has(r.id)}
                          onCheckedChange={() => toggle(r.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className='p-2'>{r.title}</td>
                      <td className='p-2'>{r.code ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className='flex items-center justify-between gap-2 p-2 border-t bg-background'>
            <div className='text-xs text-muted-foreground'>
              Página {pageNumber} de {totalPages || 1}
            </div>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber <= 1}
              >
                Anterior
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={totalPages > 0 && pageNumber >= totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={() => {
              const map = doencasMapRef.current
              const items = Array.from(selected).map((id) => {
                const r = map.get(id)
                return {
                  id,
                  title: r?.title ?? '',
                  code: r?.code ?? null,
                }
              })
              onConfirm(items)
              onOpenChange(false)
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

