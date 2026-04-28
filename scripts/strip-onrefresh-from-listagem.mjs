/**
 * Remove prop onRefresh={...} dos AreaComumListagemPageShell (refresh duplicado da toolbar).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/pages/area-comum')

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, acc)
    else if (/listagem-.*\.tsx$/.test(name)) acc.push(p)
  }
  return acc
}

function stripOnRefresh(text) {
  let out = text
  while (out.includes('onRefresh={')) {
    const key = 'onRefresh={'
    const start = out.indexOf(key)
    if (start === -1) break
    const exprStart = start + key.length - 1
    if (out[exprStart] !== '{') break
    let depth = 0
    let i = exprStart
    for (; i < out.length; i++) {
      const ch = out[i]
      if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          let removeStart = start
          while (removeStart > 0 && /[ \t]/.test(out[removeStart - 1])) removeStart--
          let removeEnd = i + 1
          if (out[removeEnd] === '\r') removeEnd++
          if (out[removeEnd] === '\n') removeEnd++
          out = out.slice(0, removeStart) + out.slice(removeEnd)
          break
        }
      }
    }
    if (i >= out.length) break
  }
  return out
}

let n = 0
for (const file of walk(ROOT)) {
  let text = fs.readFileSync(file, 'utf8')
  if (!text.includes('onRefresh={')) continue
  const next = stripOnRefresh(text)
  if (next !== text) {
    fs.writeFileSync(file, next, 'utf8')
    console.log(path.relative(ROOT, file))
    n++
  }
}
console.log('Files updated:', n)
