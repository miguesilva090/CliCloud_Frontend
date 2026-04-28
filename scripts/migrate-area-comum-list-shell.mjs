/**
 * Migra listagens Área Comum: barra cinza + X → AreaComumListagemPageShell
 * Executar: cd Frontend && node scripts/migrate-area-comum-list-shell.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../src/pages/area-comum')

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, acc)
    else if (/listagem-.*-page\.tsx$/.test(name)) acc.push(p)
  }
  return acc
}

/** Bloco div externo do cabeçalho cinza (primeiro `<div` até `</div>` que fecha o exterior) */
function extractGrayOuterDiv(text) {
  const marker = 'rounded-t-lg border border-b-0 bg-muted/40'
  const midx = text.indexOf(marker)
  if (midx === -1) return null
  const start = text.lastIndexOf('<div', midx)
  if (start === -1) return null
  const substr = text.slice(start)
  let depth = 0
  const re = /<div[\s>]|<\/div>/g
  let m
  while ((m = re.exec(substr)) !== null) {
    if (m[0].startsWith('<div')) depth++
    else depth--
    if (depth === 0) return { start, end: start + m.index + m[0].length }
  }
  return null
}

function extractTitle(inner) {
  let m = inner.match(/<h1 className='text-lg font-semibold'>([^<]+)<\/h1>/)
  if (m) return m[1].trim()
  m = inner.match(/<h1 className="text-lg font-semibold">([^<]+)<\/h1>/)
  if (m) return m[1].trim()
  return null
}

/** Corpo do primeiro onClick antes de title='Atualizar' ou title="Atualizar" */
function extractRefreshBody(inner) {
  const titleKeys = ["title='Atualizar'", 'title="Atualizar"']
  let cut = -1
  for (const k of titleKeys) {
    const i = inner.indexOf(k)
    if (i !== -1 && (cut === -1 || i < cut)) cut = i
  }
  if (cut === -1) return null
  const before = inner.slice(0, cut)
  const prefix = 'onClick={() => {'
  const oc = before.lastIndexOf(prefix)
  if (oc === -1) return null
  const openBrace = oc + prefix.length - 1
  let depth = 0
  for (let j = openBrace; j < inner.length; j++) {
    const ch = inner[j]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return inner.slice(openBrace + 1, j).trim()
    }
  }
  return null
}

function migrateFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8')
  if (!text.includes('bg-muted/40')) return false
  if (!text.includes('closeWindowTab')) return false

  const block = extractGrayOuterDiv(text)
  if (!block) {
    console.warn('Skip no block:', filePath)
    return false
  }

  const inner = text.slice(block.start, block.end)
  const title = extractTitle(inner)
  const refreshBody = extractRefreshBody(inner)
  if (!title || !refreshBody) {
    console.warn('Skip parse:', filePath, { title: !!title, refreshBody: !!refreshBody })
    return false
  }

  const escapedTitle = title.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

  const shellOpen = `<AreaComumListagemPageShell
            title='${escapedTitle}'
            onRefresh={() => {
                ${refreshBody}
            }}
        >`

  let newText = text.slice(0, block.start) + shellOpen + text.slice(block.end)

  const dc = '</DashboardPageContainer>'
  const dcIdx = newText.lastIndexOf(dc)
  if (dcIdx === -1) return false

  const indent = '\n        '
  newText =
    newText.slice(0, dcIdx).trimEnd() +
    `${indent}</AreaComumListagemPageShell>${indent}` +
    newText.slice(dcIdx)

  const dashImp = "from '@/components/shared/dashboard-page-container'"
  if (!newText.includes('area-comum-listagem-page-shell')) {
    const ix = newText.indexOf(dashImp)
    if (ix === -1) return false
    const lineEnd = newText.indexOf('\n', ix)
    newText =
      newText.slice(0, lineEnd + 1) +
      "import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'\n" +
      newText.slice(lineEnd + 1)
  }

  newText = newText.replace(/,\s*X\b(?=\s*\})/g, '')
  newText = newText.replace(/\{\s*X\s*,\s*/g, '{ ')
  newText = newText.replace(/,\s*X\s*\}/g, ' }')

  const usesClose = /closeWindowTab/.test(newText)
  if (!usesClose) {
    newText = newText.replace(
      /\s*const closeWindowTab = useCloseCurrentWindowLikeTabBar\(\)\s*\n/g,
      '\n',
    )
    newText = newText.replace(
      /import \{([^}]*)\}\s*from '@\/utils\/window-utils'/g,
      (_full, inner) => {
        const parts = inner
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .filter((s) => !s.includes('useCloseCurrentWindowLikeTabBar'))
        if (parts.length === 0) return ''
        return `import { ${parts.join(', ')} } from '@/utils/window-utils'`
      },
    )
    newText = newText.replace(/\n\n\n+/g, '\n\n')
  }

  fs.writeFileSync(filePath, newText, 'utf8')
  console.log('OK', path.relative(ROOT, filePath))
  return true
}

let n = 0
for (const f of walk(ROOT)) {
  try {
    if (migrateFile(f)) n++
  } catch (e) {
    console.error('ERR', f, e)
  }
}
console.log('Total migrated:', n)
