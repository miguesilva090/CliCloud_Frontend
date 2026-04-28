import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24']

const COLORS = [
  '#000000',
  '#434343',
  '#980000',
  '#ff0000',
  '#ff9900',
  '#00ff00',
  '#4a86e8',
  '#0000ff',
  '#9900ff',
]

function TBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant={active ? 'default' : 'ghost'}
            size='icon'
            className='h-8 w-8'
            onClick={onClick}
            disabled={disabled}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface RelatorioDentariaRichEditorProps {
  value: string
  onChange: (html: string) => void
  readOnly?: boolean
}

export function RelatorioDentariaRichEditor({
  value,
  onChange,
  readOnly = false,
}: RelatorioDentariaRichEditorProps) {
  const isInitialMount = useRef(true)
  const [fontSize, setFontSize] = useState('12')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: { HTMLAttributes: { class: 'list-disc pl-4' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal pl-4' } },
      }),
      Underline,
      TextAlign.configure({ types: ['paragraph'] }),
      TextStyle,
      FontSize,
      Color,
      Placeholder.configure({ placeholder: 'Escreva o relatório desta sessão...' }),
    ],
    content: value || '<p></p>',
    editable: !readOnly,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const currentHtml = editor.getHTML()
    if (currentHtml !== value) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
  }, [value, editor])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly)
  }, [readOnly, editor])

  const clearFormatting = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetAllMarks().clearNodes().setParagraph().run()
  }, [editor])

  if (!editor) return null

  return (
    <div className='flex min-h-[220px] flex-col overflow-hidden rounded-md border bg-background'>
      <div className='flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-2 py-1'>
        <TBtn
          title='Negrito'
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className='h-4 w-4' />
        </TBtn>
        <TBtn
          title='Itálico'
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className='h-4 w-4' />
        </TBtn>
        <TBtn
          title='Sublinhado'
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className='h-4 w-4' />
        </TBtn>
        <TBtn title='Limpar formatação' onClick={clearFormatting}>
          <Eraser className='h-4 w-4' />
        </TBtn>

        <Select
          value={fontSize}
          onValueChange={(v) => {
            setFontSize(v)
            editor.chain().focus().setFontSize(`${v}px`).run()
          }}
          disabled={readOnly}
        >
          <SelectTrigger className='h-8 w-[72px] text-xs'>
            <SelectValue placeholder='12' />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((s) => (
              <SelectItem key={s} value={s} className='text-xs'>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button type='button' variant='ghost' size='sm' className='h-8 gap-0.5 px-2 font-semibold'>
              <span className='text-sm underline decoration-2'>A</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-2' align='start'>
            <div className='grid grid-cols-6 gap-1'>
              {COLORS.map((color) => (
                <button
                  key={color}
                  type='button'
                  className='h-6 w-6 rounded border border-border'
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                  title={color}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <TBtn title='Lista' onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className='h-4 w-4' />
        </TBtn>
        <TBtn title='Lista numerada' onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className='h-4 w-4' />
        </TBtn>

        <Select
          value={
            editor.isActive({ textAlign: 'left' })
              ? 'left'
              : editor.isActive({ textAlign: 'center' })
                ? 'center'
                : editor.isActive({ textAlign: 'right' })
                  ? 'right'
                  : editor.isActive({ textAlign: 'justify' })
                    ? 'justify'
                    : 'left'
          }
          onValueChange={(align) => {
            editor.chain().focus().setTextAlign(align as 'left' | 'center' | 'right' | 'justify').run()
          }}
          disabled={readOnly}
        >
          <SelectTrigger className='h-8 w-[110px] text-xs'>
            <SelectValue placeholder='Alinhamento' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='left'>
              <span className='flex items-center gap-2'>
                <AlignLeft className='h-3.5 w-3.5' /> Esquerda
              </span>
            </SelectItem>
            <SelectItem value='center'>
              <span className='flex items-center gap-2'>
                <AlignCenter className='h-3.5 w-3.5' /> Centro
              </span>
            </SelectItem>
            <SelectItem value='right'>
              <span className='flex items-center gap-2'>
                <AlignRight className='h-3.5 w-3.5' /> Direita
              </span>
            </SelectItem>
            <SelectItem value='justify'>
              <span className='flex items-center gap-2'>
                <AlignJustify className='h-3.5 w-3.5' /> Justificado
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn('min-h-[180px] flex-1 resize-y overflow-auto px-3 py-2')}>
        <EditorContent editor={editor} className='prose prose-sm max-w-none dark:prose-invert [&_.ProseMirror]:min-h-[160px] [&_.ProseMirror]:outline-none' />
      </div>
    </div>
  )
}
