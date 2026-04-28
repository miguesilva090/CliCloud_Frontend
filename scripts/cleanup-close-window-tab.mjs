import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/pages/area-comum')

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, acc)
    else if (p.endsWith('.tsx')) acc.push(p)
  }
  return acc
}

for (const file of walk(ROOT)) {
  let text = fs.readFileSync(file, 'utf8')
  if (!text.includes('closeWindowTab')) continue
  const count = (text.match(/closeWindowTab/g) || []).length
  if (count !== 1) continue

  text = text.replace(/\s*const closeWindowTab = useCloseCurrentWindowLikeTabBar\(\)\s*\n/g, '\n')

  text = text.replace(
    /import \{([^}]+)\}\s*from '@\/utils\/window-utils'/g,
    (full, inner) => {
      const parts = inner
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !s.includes('useCloseCurrentWindowLikeTabBar'))
      if (parts.length === 0) return ''
      return `import { ${parts.join(', ')} } from '@/utils/window-utils'`
    },
  )
  text = text.replace(/\n\n\n+/g, '\n\n')
  fs.writeFileSync(file, text)
  console.log('cleaned', path.relative(ROOT, file))
}
