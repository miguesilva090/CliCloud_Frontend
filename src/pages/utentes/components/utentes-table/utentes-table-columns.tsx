/**
 * Colunas unificadas para a tabela de Utentes.
 * Usado em ambas as listagens: /utentes e /area-comum/tabelas/entidades/utentes.
 * Garante estrutura idêntica em todos os contextos.
 */
import type { CellContext, ColumnDef } from '@tanstack/react-table'
import type { DataTableColumnDef } from '@/components/shared/data-table-types'
import type { UtenteTableDTO } from '@/types/dtos/saude/utentes.dtos'
import { useNavigate } from 'react-router-dom'
import { Eye, FileText, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDeleteUtente } from '../../queries/utentes-queries'
import { useWindowsStore } from '@/stores/use-windows-store'
import { openPathInApp, openUtenteEditInApp } from '@/utils/window-utils'

function UtenteRowActions({
  row,
  deleteReturnPath,
  onOpenDelete,
}: {
  row: UtenteTableDTO
  deleteReturnPath?: string
  onOpenDelete?: (row: UtenteTableDTO) => void
}) {
  const id = row.id
  const nome = row.nome
  const navigate = useNavigate()
  const addWindow = useWindowsStore((s) => s.addWindow)
  const del = useDeleteUtente({
    onSuccessNavigateTo: onOpenDelete ? undefined : deleteReturnPath,
  })

  const handleDeleteClick = () => {
    if (onOpenDelete) {
      onOpenDelete(row)
      return
    }
    const ok = window.confirm(
      `Apagar o utente "${nome || id}"?

Esta ação não pode ser desfeita.`
    )
    if (!ok) return
    del.mutate(id)
  }

  return (
    <div className='flex items-center justify-end gap-1'>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() =>
          openPathInApp(
            navigate,
            addWindow,
            `/utentes/${id}`,
            nome ? `Utente: ${nome}` : 'Utente'
          )
        }
        title='Ver'
      >
        <Eye className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        onClick={() => openUtenteEditInApp(navigate, addWindow, id, nome)}
        title='Editar'
      >
        <Pencil className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-primary hover:text-primary'
        onClick={() =>
          openPathInApp(
            navigate,
            addWindow,
            `/area-comum/posto-assinaturas?utenteId=${encodeURIComponent(id)}`,
            nome ? `Assinaturas: ${nome}` : 'Assinaturas'
          )
        }
        title='Pedir assinatura'
      >
        <FileText className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8 text-destructive hover:text-destructive'
        disabled={del.isPending}
        onClick={handleDeleteClick}
        title='Apagar'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  )
}

/** Obtém contacto telefone ou telemóvel (tipo 1 = Telefone, 2 = Telemóvel) */
function getContactoTelemovelOuTelefone(row: UtenteTableDTO): string {
  const contactos = row.entidadeContactos ?? []
  const tipoId = (c: { entidadeContactoTipoId?: number; EntidadeContactoTipoId?: number }) =>
    c.entidadeContactoTipoId ?? (c as { EntidadeContactoTipoId?: number }).EntidadeContactoTipoId
  const valor = (c: { valor?: string | null; Valor?: string | null }) =>
    (c.valor ?? (c as { Valor?: string | null }).Valor)?.trim()
  const telemovel = contactos.find((c) => tipoId(c) === 2)
  const telefone = contactos.find((c) => tipoId(c) === 1)
  return (telemovel ? valor(telemovel) : null) ?? (telefone ? valor(telefone) : null) ?? '—'
}

export function getUtentesTableColumns(
  deleteReturnPath?: string,
  onOpenDelete?: (row: UtenteTableDTO) => void
): Array<ColumnDef<UtenteTableDTO> & DataTableColumnDef<UtenteTableDTO>> {
  return [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) =>
        row.original.nome || '—',
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'numeroContribuinte',
      id: 'numeroContribuinte',
      header: 'NIF',
      cell: () => null,
      enableHiding: true,
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'numeroUtente',
      id: 'numeroUtente',
      header: 'Nº Utente',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) =>
        row.original.numeroUtente || '—',
      enableHiding: true,
      meta: { align: 'left' as const },
    },
    {
      id: 'morada',
      header: 'Morada',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) => {
        const rua = row.original.rua?.nome?.trim()
        const numeroPorta = row.original.numeroPorta?.trim()
        const codigoPostal = row.original.codigoPostal?.codigo?.trim()
        const parts = [rua, numeroPorta, codigoPostal].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : '—'
      },
      meta: { align: 'left' as const },
    },
    {
      id: 'localidade',
      header: 'Localidade',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) => {
        const localidade =
          row.original.codigoPostal?.localidade?.trim() ??
          row.original.freguesia?.nome?.trim() ??
          row.original.concelho?.nome?.trim()
        return localidade || '—'
      },
      meta: { align: 'left' as const },
    },
    {
      id: 'telemovel',
      header: 'Telemóvel',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) =>
        getContactoTelemovelOuTelefone(row.original),
      meta: { align: 'left' as const },
    },
    {
      id: 'debito',
      header: 'Débito',
      cell: () => '—',
      meta: { align: 'right' as const },
    },
    {
      id: 'opcoes',
      header: 'Opções',
      cell: ({ row }: CellContext<UtenteTableDTO, unknown>) => (
        <UtenteRowActions
          row={row.original}
          deleteReturnPath={deleteReturnPath}
          onOpenDelete={onOpenDelete}
        />
      ),
      enableSorting: false,
      meta: { align: 'right' as const },
    },
  ]
}

