import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Paintbrush,
  Quote,
  Redo,
  Strikethrough,
  TableIcon,
  Type,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface DocumentoEditorProps {
  value: string
  onChange: (html: string) => void
  readOnly?: boolean
}

type RibbonTab = 'base' | 'inserir' | 'campos'

const RIBBON_TABS: { id: RibbonTab; label: string }[] = [
  { id: 'base', label: 'Base' },
  { id: 'inserir', label: 'Inserir' },
  { id: 'campos', label: 'Campos em Série' },
]

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Calibri', value: 'Calibri, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
]

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72']

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
]

const COMMON_MARKERS = [
  { key: 'ClinicaNome', label: 'Nome da Clínica' },
  { key: 'ClinicaLocalidade', label: 'Localidade da Clínica' },
  { key: 'DataNormal', label: 'Data (dd/MM/yyyy)' },
  { key: 'DataPorExtenso', label: 'Data por extenso' },
  { key: 'UtenteNome', label: 'Nome do utente' },
  { key: 'UtenteNumero', label: 'Nº de utente' },
  { key: 'UtenteContribuinte', label: 'NIF do utente' },
  { key: 'UtenteNumeroCC', label: 'Nº de identificação (CC/BI)' },
  { key: 'UtenteDataNascimento', label: 'Data de nascimento do utente' },
  { key: 'UtenteEmail', label: 'Email do utente' },
  { key: 'UtenteRua', label: 'Rua do utente' },
  { key: 'UtenteLocalidade', label: 'Localidade do utente' },
  { key: 'UtenteTelemovel', label: 'Telemóvel do utente' },
  { key: 'UtenteConsentimento', label: 'Consentimento do utente' },
  { key: 'UtenteAssinatura', label: 'Assinatura do utente' },
  { key: 'UtenteTratamentoDados', label: 'Consentimento de tratamento de dados do utente' },
  { key: 'NumeroRequisicao', label: 'Número de requisição' },
  { key: 'NumeroRequisicaoCodBarras', label: 'Código de barras da requisição' },
]

function TBtn({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            variant={active ? 'default' : 'ghost'}
            size='icon'
            className='h-7 w-7'
            onClick={onClick}
            disabled={disabled}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side='bottom'><p>{title}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col items-center border-r border-border/50 px-1.5 last:border-r-0'>
      <div className='flex items-center gap-0.5 py-0.5'>{children}</div>
      <span className='pb-0.5 text-[9px] leading-none text-muted-foreground'>{label}</span>
    </div>
  )
}

function ColorPicker({
  onColorChange, icon, title,
}: {
  onColorChange: (color: string) => void; icon: React.ReactNode; title: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type='button' variant='ghost' size='icon' className='h-7 w-7' title={title}>
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-2' align='start'>
        <div className='grid grid-cols-10 gap-1'>
          {COLORS.map((color) => (
            <button
              key={color}
              type='button'
              className='h-5 w-5 rounded border border-border'
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              title={color}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MarkerInserter({ onInsert }: { onInsert: (marker: string) => void }) {
  return (
    <div className='flex flex-col gap-2 p-2'>
      <div className='text-xs font-medium text-muted-foreground'>Campos disponíveis</div>
      <div className='flex max-h-52 flex-col gap-0.5 overflow-y-auto'>
        {COMMON_MARKERS.map((m) => (
          <button
            key={m.key}
            type='button'
            className='flex items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-accent'
            onClick={() => onInsert(m.key)}
          >
            <span className='text-muted-foreground'>{m.label}</span>
            <span className='ml-2 font-mono text-[10px] text-primary'>{`<<${m.key}>>`}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function TableInserter({ onInsert }: { onInsert: (rows: number, cols: number) => void }) {
  const [hoverRow, setHoverRow] = useState(0)
  const [hoverCol, setHoverCol] = useState(0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type='button' variant='ghost' size='icon' className='h-7 w-7' title='Inserir Tabela'>
          <TableIcon className='h-3.5 w-3.5' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-2' align='start'>
        <div className='mb-1 text-center text-xs text-muted-foreground'>
          {hoverRow > 0 ? `${hoverRow} x ${hoverCol}` : 'Selecione tamanho'}
        </div>
        <div className='grid gap-0.5' style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => (
              <button
                key={`${r}-${c}`}
                type='button'
                className='h-4 w-4 rounded-sm border'
                style={{
                  backgroundColor: r < hoverRow && c < hoverCol ? 'hsl(var(--primary))' : 'transparent',
                  borderColor: r < hoverRow && c < hoverCol ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                }}
                onMouseEnter={() => { setHoverRow(r + 1); setHoverCol(c + 1) }}
                onClick={() => onInsert(r + 1, c + 1)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DocumentoEditor({ value, onChange, readOnly = false }: DocumentoEditorProps) {
  const isInitialMount = useRef(true)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [activeTab, setActiveTab] = useState<RibbonTab>('base')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Comece a escrever o documento...' }),
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

  const insertMarker = useCallback(
    (marker: string) => {
      if (!editor) return
      editor.chain().focus().insertContent(`<<${marker}>>`).run()
    },
    [editor]
  )

  const insertImage = useCallback(() => {
    if (!editor || readOnly) return
    imageInputRef.current?.click()
  }, [editor, readOnly])

  const handleImageFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file || !editor) return

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result !== 'string') return
        editor.chain().focus().setImage({ src: result }).run()
      }
      reader.readAsDataURL(file)

      // Permite selecionar novamente o mesmo ficheiro.
      event.target.value = ''
    },
    [editor]
  )

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className='flex h-full flex-col overflow-hidden bg-background'>
      {/* Ribbon Tab Strip */}
      <input
        ref={imageInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleImageFileChange}
      />

      <div className='flex items-end border-b bg-muted/30 px-2 pt-0.5'>
        {RIBBON_TABS.map((tab) => (
          <button
            key={tab.id}
            type='button'
            className={cn(
              'relative px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'rounded-t border border-b-0 border-border bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className='border-b bg-background px-1 py-1'>
        {activeTab === 'base' && (
          <div className='flex flex-wrap items-start'>
            <RibbonGroup label='Área de transferência'>
              <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title='Desfazer (Ctrl+Z)'>
                <Undo className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title='Refazer (Ctrl+Y)'>
                <Redo className='h-3.5 w-3.5' />
              </TBtn>
            </RibbonGroup>

            <RibbonGroup label='Tipo de Letra'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type='button' variant='ghost' size='sm' className='h-7 w-[110px] justify-start gap-1 text-[11px] font-normal'>
                    <Type className='h-3 w-3 shrink-0' />
                    <span className='truncate'>
                      {FONT_FAMILIES.find((f) => editor.isActive('textStyle', { fontFamily: f.value }))?.label ?? 'Arial'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-48 p-1' align='start'>
                  {FONT_FAMILIES.map((font) => (
                    <button
                      key={font.value}
                      type='button'
                      className='w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent'
                      style={{ fontFamily: font.value }}
                      onClick={() => editor.chain().focus().setFontFamily(font.value).run()}
                    >
                      {font.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type='button' variant='ghost' size='sm' className='h-7 w-[42px] justify-center text-[11px] font-normal'>
                    {editor.getAttributes('textStyle').fontSize?.replace('px', '') ?? '11'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-16 p-1' align='start'>
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      type='button'
                      className='w-full rounded px-2 py-1 text-left text-sm hover:bg-accent'
                      onClick={() => editor.chain().focus().setFontSize(`${size}px`).run()}
                    >
                      {size}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <Separator orientation='vertical' className='mx-0.5 h-5' />
              <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title='Negrito (Ctrl+B)'>
                <Bold className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title='Itálico (Ctrl+I)'>
                <Italic className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title='Sublinhado (Ctrl+U)'>
                <UnderlineIcon className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title='Riscado'>
                <Strikethrough className='h-3.5 w-3.5' />
              </TBtn>
              <Separator orientation='vertical' className='mx-0.5 h-5' />
              <ColorPicker
                onColorChange={(color) => editor.chain().focus().setColor(color).run()}
                icon={<Paintbrush className='h-3.5 w-3.5' />}
                title='Cor do Texto'
              />
              <ColorPicker
                onColorChange={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
                icon={<Highlighter className='h-3.5 w-3.5' />}
                title='Destaque'
              />
            </RibbonGroup>

            <RibbonGroup label='Parágrafo'>
              <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title='Alinhar à esquerda'>
                <AlignLeft className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title='Centrar'>
                <AlignCenter className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title='Alinhar à direita'>
                <AlignRight className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title='Justificar'>
                <AlignJustify className='h-3.5 w-3.5' />
              </TBtn>
              <Separator orientation='vertical' className='mx-0.5 h-5' />
              <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title='Lista com marcadores'>
                <List className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title='Lista numerada'>
                <ListOrdered className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title='Citação'>
                <Quote className='h-3.5 w-3.5' />
              </TBtn>
            </RibbonGroup>

            <RibbonGroup label='Estilos'>
              <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title='Título 1'>
                <Heading1 className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title='Título 2'>
                <Heading2 className='h-3.5 w-3.5' />
              </TBtn>
              <TBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title='Título 3'>
                <Heading3 className='h-3.5 w-3.5' />
              </TBtn>
            </RibbonGroup>
          </div>
        )}

        {activeTab === 'inserir' && (
          <div className='flex flex-wrap items-start'>
            <RibbonGroup label='Tabelas'>
              <TableInserter onInsert={(rows, cols) => editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()} />
            </RibbonGroup>

            <RibbonGroup label='Ilustrações'>
              <TBtn onClick={insertImage} title='Inserir Imagem'>
                <ImageIcon className='h-3.5 w-3.5' />
              </TBtn>
            </RibbonGroup>

            <RibbonGroup label='Ligações'>
              <TBtn onClick={setLink} active={editor.isActive('link')} title='Inserir Link'>
                <LinkIcon className='h-3.5 w-3.5' />
              </TBtn>
            </RibbonGroup>

            <RibbonGroup label='Elementos'>
              <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title='Linha horizontal'>
                <Minus className='h-3.5 w-3.5' />
              </TBtn>
            </RibbonGroup>
          </div>
        )}

        {activeTab === 'campos' && (
          <div className='flex items-start'>
            <RibbonGroup label='Campos em Série'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type='button' variant='outline' size='sm' className='h-7 gap-1 text-[10px]'>
                    <Code className='h-3 w-3' />
                    Inserir Campo
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80 p-0' align='start'>
                  <MarkerInserter onInsert={insertMarker} />
                </PopoverContent>
              </Popover>
            </RibbonGroup>
          </div>
        )}
      </div>

      {/* Editor Content - Document-like A4 page */}
      <div className='flex-1 overflow-auto bg-zinc-200 dark:bg-zinc-900'>
        <div className='documento-editor-content mx-auto my-4 min-h-[calc(100vh-280px)] w-full max-w-[210mm] rounded bg-white p-[20mm] shadow-md dark:bg-zinc-950'>
          <EditorContent editor={editor} className='prose prose-sm max-w-none dark:prose-invert' />
        </div>
      </div>
    </div>
  )
}
