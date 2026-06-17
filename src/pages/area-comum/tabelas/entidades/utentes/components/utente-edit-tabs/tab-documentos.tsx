import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { List, Paperclip } from 'lucide-react'
import { Eye, Trash2 } from 'lucide-react'

type DocRow = {
  id: number
  descricao: string
  tipo: string
  dataSubida: string
  horaSubida: string
}

export function TabDocumentos() {
  const [docs] = useState<DocRow[]>([])
  return (
    <div className='space-y-6'>
      <h4 className='text-sm font-semibold'>Documentos Clínicos</h4>
      <div className='flex flex-wrap gap-2'>
        <Button type='button' variant='outline' size='sm'>
          <List className='h-4 w-4 mr-2' />
          Listar Administrativos
        </Button>
        <Button type='button' variant='outline' size='sm'>
          <Paperclip className='h-4 w-4 mr-2' />
          Anexar Ficheiro Administrativo
        </Button>
        <Button type='button' variant='outline' size='sm'>
          <Paperclip className='h-4 w-4 mr-2' />
          Anexar Ficheiro Clínico
        </Button>
      </div>
      <div className='rounded-md border overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b bg-muted/50'>
              <th className='text-left p-2 font-medium'>ID</th>
              <th className='text-left p-2 font-medium'>Descrição do Ficheiro</th>
              <th className='text-left p-2 font-medium'>Tipo do Arquivo</th>
              <th className='text-left p-2 font-medium'>Data Subida</th>
              <th className='text-left p-2 font-medium'>Hora Subida</th>
              <th className='text-right p-2 font-medium'>Opções</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((row) => (
              <tr key={row.id} className='border-b'>
                <td className='p-2'>{row.id}</td>
                <td className='p-2'>{row.descricao}</td>
                <td className='p-2'>{row.tipo}</td>
                <td className='p-2'>{row.dataSubida}</td>
                <td className='p-2'>{row.horaSubida}</td>
                <td className='p-2 text-right'>
                  <Button type='button' variant='ghost' size='icon' className='h-8 w-8' title='Ver'>
                    <Eye className='h-4 w-4' />
                  </Button>
                  <Button type='button' variant='ghost' size='icon' className='h-8 w-8 text-destructive' title='Apagar'>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
