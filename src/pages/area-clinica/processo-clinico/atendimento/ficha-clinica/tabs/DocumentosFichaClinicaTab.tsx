import { useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Eye, Paperclip, Trash2 } from 'lucide-react'

import state from '@/states/state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useDeleteDocumentoFichaClinica,
  useDeleteMultipleDocumentosFichaClinica,
  useGetDocumentosFichaClinicaByUtente,
  useUploadDocumentoFichaClinica,
} from '../queries/documentos-ficha-clinica-queries'
import type { DocumentoFichaClinicaDTO } from '@/lib/services/processo-clinico/documentos-ficha-clinica-service'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export type DocumentosFichaClinicaTabProps = {
  utenteId?: string
}

export function DocumentosFichaClinicaTab({ utenteId }: DocumentosFichaClinicaTabProps) {
  const fichaClinicaPermissionId = modules.areaClinica.permissions.fichaClinica.id
  const { canView, canAdd, canDelete } =
    useAreaComumEntityListPermissions(fichaClinicaPermissionId)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState<string>('Clinico')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [idToDelete, setIdToDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: documentos = [], isLoading } = useGetDocumentosFichaClinicaByUtente(
    utenteId,
    categoria,
  )

  const uploadMutation = useUploadDocumentoFichaClinica()
  const deleteMutation = useDeleteDocumentoFichaClinica(utenteId, categoria)
  const deleteMultipleMutation = useDeleteMultipleDocumentosFichaClinica(utenteId, categoria)

  const allSelected = useMemo(
    () => documentos.length > 0 && selectedIds.size === documentos.length,
    [documentos, selectedIds],
  )

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(documentos.map((d) => d.id)))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const handleUpload = () => {
    if (!utenteId || !selectedFile || !descricao.trim()) return

    uploadMutation.mutate({
      data: {
        utenteId,
        descricao: descricao.trim(),
        categoria,
      },
      file: selectedFile,
    })

    setSelectedFile(null)
    setDescricao('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return
    deleteMultipleMutation.mutate(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  const handleOpenFile = (doc: DocumentoFichaClinicaDTO) => {
    const apiBase = (state.URL ?? '').replace(/\/+$/, '')
    const path = doc.caminhoRelativo.startsWith('/')
      ? doc.caminhoRelativo
      : `/${doc.caminhoRelativo}`
    const url = `${apiBase}${path}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold">Descrição</label>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição do documento"
          />
        </div>

        <div className="w-40 space-y-1">
          <label className="text-xs font-semibold">Categoria</label>
          <Select value={categoria} onValueChange={(v) => setCategoria(v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Clinico">Clínico</SelectItem>
              <SelectItem value="Administrativo">Administrativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold">Ficheiro</label>
          <Input type="file" onChange={handleFileChange} ref={fileInputRef} />
        </div>

        <Button
          type="button"
          className="mt-5"
          size="sm"
          disabled={!utenteId || !canAdd || !selectedFile || !descricao.trim()}
          onClick={handleUpload}
        >
          <Paperclip className="mr-1 h-4 w-4" />
          Anexar
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          Documentos da ficha clínica {isLoading && <span className="text-xs font-normal">a carregar…</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canDelete || selectedIds.size === 0}
            onClick={handleDeleteSelected}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Apagar selecionados
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-2 py-1 text-left">
                  <Input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={allSelected}
                    disabled={!canDelete}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-2 py-1 text-left">Data</th>
              <th className="px-2 py-1 text-left">Descrição</th>
              <th className="px-2 py-1 text-left">Categoria</th>
              <th className="px-2 py-1 text-left">Tipo</th>
              <th className="px-2 py-1 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {documentos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-2 py-4 text-center text-xs text-muted-foreground">
                  Nenhum documento anexado.
                </td>
              </tr>
            )}
            {documentos.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="px-2 py-1 align-middle">
                  <Input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedIds.has(doc.id)}
                    disabled={!canDelete}
                    onChange={() => toggleSelect(doc.id)}
                  />
                </td>
                <td className="px-2 py-1 align-middle">
                  {format(new Date(doc.createdOn), 'dd/MM/yyyy')}
                </td>
                <td className="px-2 py-1 align-middle">{doc.descricao}</td>
                <td className="px-2 py-1 align-middle">{doc.categoria}</td>
                <td className="px-2 py-1 align-middle">{doc.tipo}</td>
                <td className="px-2 py-1 align-middle text-right space-x-2">
                  {canView ? (
                    <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenFile(doc)}
                    title="Ver documento"
                  >
                    <Eye className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setIdToDelete(doc.id)}
                    title="Apagar documento"
                  >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={canDelete ? !!idToDelete : false}
        onOpenChange={(open) => !open && setIdToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende apagar este documento? Esta ação não pode ser anulada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!idToDelete) return
                deleteMutation.mutate(idToDelete)
                setIdToDelete(null)
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}



