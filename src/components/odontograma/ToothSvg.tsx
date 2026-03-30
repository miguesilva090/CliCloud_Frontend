import { useEffect, useRef } from 'react'
import type { OdontogramaOverlayKind, OdontogramaToothPart, OdontogramaToothRenderKind } from './odontograma-legacy-config'

const toothSvgs = import.meta.glob('@/assets/odontograma/dente*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const miscSvgs = import.meta.glob('@/assets/odontograma/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function getToothSvg(numero: number): string | undefined {
  const fileName = `dente${numero}.svg`
  const entry = Object.entries(toothSvgs).find(([path]) =>
    path.endsWith(`/${fileName}`),
  )
  return entry?.[1]
}

function getMiscSvg(fileName: string): string | undefined {
  const entry = Object.entries(miscSvgs).find(([path]) => path.endsWith(`/${fileName}`))
  return entry?.[1]
}

function isUpperTooth(numero: number): boolean {
  return numero >= 11 && numero <= 28
}

function isMolarTooth(numero: number): boolean {
  return (
    (numero >= 16 && numero <= 18) ||
    (numero >= 26 && numero <= 28) ||
    (numero >= 36 && numero <= 38) ||
    (numero >= 46 && numero <= 48)
  )
}

function setSvgTransform(raw: string, rotate180: boolean, scale?: number): string {
  // Garante transform (rotate/scale) no style do <svg>.
  return raw.replace(/<svg\b([^>]*)>/i, (_m, attrs) => {
    const a = String(attrs)
    const styleMatch = a.match(/\sstyle="([^"]*)"/i)
    const existingStyle = styleMatch?.[1] ?? ''
    const cleanedAttrs = a.replace(/\sstyle="[^"]*"/i, '')

    const withoutTransform = existingStyle.replace(/transform:\s*[^;"]+;?/i, '').trim()
    const s = typeof scale === 'number' ? Math.max(0.5, Math.min(1.2, scale)) : undefined
    const tf = `${rotate180 ? 'rotate(180deg) ' : ''}${s ? `scale(${s})` : ''}`.trim()
    const nextStyle =
      `${withoutTransform}${withoutTransform ? ';' : ''}` +
      `${tf ? `transform: ${tf}; transform-origin: 50% 50%; ` : ''}` +
      `display:block;`

    return `<svg${cleanedAttrs} style="${nextStyle}">`
  })
}

function getReplacementSvg(kind: OdontogramaToothRenderKind, numero: number): string | undefined {
  if (kind !== 'implant') return undefined
  const raw = isMolarTooth(numero) ? getMiscSvg('implanteMolar.svg') : getMiscSvg('dente.svg')
  if (!raw) return undefined
  // O ficheiro pode vir “invertido”; alinhamos a orientação pelo maxilar.
  return setSvgTransform(raw, isUpperTooth(numero), 0.88)
}

export interface ToothSvgProps {
  numero: number
  /** Âncora DOM para desenhar overlays externos (ex.: T10 Ponte) como no legado. */
  anchorId?: string
  appliedZones?: Partial<Record<OdontogramaToothPart, string>>
  appliedOverlays?: Array<{ kind: OdontogramaOverlayKind; color: string }>
  toothRenderKind?: OdontogramaToothRenderKind
  activeColor?: string
  /** Quando true, clicar na coroa/raiz faz toggle do dente inteiro (coroa+raiz+fundo). */
  toggleWholeTooth?: boolean
  /** Controla quais zonas são clicáveis (default: coroa+raiz). */
  clickableZones?: Array<'coroa' | 'raiz'>
  /** Quando true, ignora cliques em zonas e trata como clique no dente inteiro. */
  disableZoneClicks?: boolean
  /** Quando true, não faz highlight local (usa apenas overlays/estado externo). */
  suppressLocalHighlight?: boolean
  onSelect?: (dente: number) => void
  onZoneSelect?: (dente: number, zona: 'coroa' | 'raiz', selected: boolean) => boolean | void
}

export function ToothSvg({
  numero,
  anchorId,
  appliedZones,
  appliedOverlays,
  toothRenderKind,
  activeColor,
  toggleWholeTooth,
  clickableZones,
  disableZoneClicks,
  suppressLocalHighlight,
  onSelect,
  onZoneSelect,
}: ToothSvgProps) {
  const svg = toothRenderKind ? getReplacementSvg(toothRenderKind, numero) ?? getToothSvg(numero) : getToothSvg(numero)
  const rootRef = useRef<HTMLButtonElement | null>(null)

  if (!svg) {
    return (
      <button
        type='button'
        className='w-7 rounded border py-0.5 text-center'
        onClick={() => onSelect?.(numero)}
      >
        {numero}
      </button>
    )
  }

  const zones = clickableZones && clickableZones.length > 0 ? clickableZones : (['coroa', 'raiz'] as const)
  const clickableSelector = [
    zones.includes('coroa') ? '.coroaDente' : null,
    zones.includes('raiz') ? '.raizDente' : null,
  ]
    .filter(Boolean)
    .join(',')

  const setSelected = (el: Element, selected: boolean) => {
    const svgEl = el as SVGElement
    if (selected) {
      if (!el.getAttribute('data-orig-fill')) {
        const orig = svgEl.style.fill || el.getAttribute('fill') || '#ffffff'
        el.setAttribute('data-orig-fill', orig)
      }
      el.setAttribute('data-selected', '1')
      svgEl.style.fill = activeColor ?? '#fa5722'
    } else {
      el.removeAttribute('data-selected')
      const orig = el.getAttribute('data-orig-fill') || '#ffffff'
      svgEl.style.fill = orig
    }
  }

  const setSelectedAllToothParts = (rootSvg: SVGElement, selected: boolean) => {
    const parts = rootSvg.querySelectorAll('.coroaDente,.raizDente,.fundoDente')
    parts.forEach((el) => setSelected(el, selected))
  }

  useEffect(() => {
    const root = rootRef.current
    const svgEl = root?.querySelector?.('svg')
    if (!svgEl) return

    const coroas = Array.from(svgEl.querySelectorAll('.coroaDente'))
    const raizes = Array.from(svgEl.querySelectorAll('.raizDente'))
    const fundos = Array.from(svgEl.querySelectorAll('.fundoDente'))

    // reset para default (orig fill / branco)
    ;[...coroas, ...raizes, ...fundos].forEach((el) => {
      if (!el) return
      // guarda o fill original (os SVGs trazem fill via style inline)
      if (!el.getAttribute('data-orig-fill')) {
        const svgPart = el as SVGElement
        const orig = svgPart.style.fill || el.getAttribute('fill') || '#ffffff'
        el.setAttribute('data-orig-fill', orig)
      }
      el.removeAttribute('data-selected')
      const orig = el.getAttribute('data-orig-fill') || '#ffffff'
      ;(el as SVGElement).style.fill = orig
    })

    if (!appliedZones) return

    if (appliedZones.coroaDente) {
      for (const el of coroas) {
        el.setAttribute('data-selected', '1')
        ;(el as SVGElement).style.fill = appliedZones.coroaDente
      }
    }
    if (appliedZones.raizDente) {
      for (const el of raizes) {
        el.setAttribute('data-selected', '1')
        ;(el as SVGElement).style.fill = appliedZones.raizDente
      }
    }
    if (appliedZones.fundoDente) {
      for (const el of fundos) {
        el.setAttribute('data-selected', '1')
        ;(el as SVGElement).style.fill = appliedZones.fundoDente
      }
    }
  }, [appliedZones])

  useEffect(() => {
    const root = rootRef.current
    const svgEl = root?.querySelector?.('svg') as SVGSVGElement | null
    if (!svgEl) return

    // limpa overlays antigos
    svgEl.querySelectorAll('[data-odont-overlay="1"]').forEach((n) => n.remove())
    if (!appliedOverlays || appliedOverlays.length === 0) return

    const vb = svgEl.viewBox?.baseVal
    const x = vb?.x ?? 0
    const y = vb?.y ?? 0
    const w = vb?.width ?? 100
    const h = vb?.height ?? 100

    const ns = 'http://www.w3.org/2000/svg'

    const add = (el: SVGElement) => {
      el.setAttribute('data-odont-overlay', '1')
      el.setAttribute('vector-effect', 'non-scaling-stroke')
      svgEl.appendChild(el)
    }

    for (const ov of appliedOverlays) {
      if (ov.kind === 'fistula') {
        const c = document.createElementNS(ns, 'circle')
        // Tamanho consistente em PIXELS (independente do viewBox de cada dente).
        const desiredRpx = 5.5
        const desiredStrokePx = 1.2
        const rect = svgEl.getBoundingClientRect()
        const scaleX = rect.width / w
        const scaleY = rect.height / h
        const scale = Math.min(scaleX || 1, scaleY || 1)
        const r = Math.max(1.2, desiredRpx / scale)
        const strokeW = Math.max(0.6, desiredStrokePx / scale)
        // Fístula deve ficar no ápice (ponta da raiz) — centrado no dente.
        // No odontograma, os superiores estão “virados” para cima e os inferiores para baixo.
        const isUpper = numero >= 11 && numero <= 28
        const cx = x + w * 0.5
        const cy = isUpper ? y + h * 0.08 : y + h * 0.92
        c.setAttribute('cx', String(cx))
        c.setAttribute('cy', String(cy))
        c.setAttribute('r', String(r))
        c.setAttribute('fill', ov.color)
        c.setAttribute('stroke', '#000000')
        c.setAttribute('stroke-width', String(strokeW))
        add(c)
      }

      if (ov.kind === 'fratura') {
        const pl = document.createElementNS(ns, 'polyline')
        const pts = [
          [x + w * 0.08, y + h * 0.08],
          [x + w * 0.72, y + h * 0.50],
          [x + w * 0.46, y + h * 0.62],
          [x + w * 0.88, y + h * 0.94],
        ]
        pl.setAttribute('points', pts.map((p) => p.join(',')).join(' '))
        pl.setAttribute('fill', 'none')
        pl.setAttribute('stroke', ov.color)
        // espessura consistente em pixels
        const desiredStrokePx = 3.8
        const rect = svgEl.getBoundingClientRect()
        const scaleX = rect.width / w
        const scaleY = rect.height / h
        const scale = Math.min(scaleX || 1, scaleY || 1)
        const strokeW = Math.max(1.1, desiredStrokePx / scale)
        pl.setAttribute('stroke-width', String(strokeW))
        add(pl)
      }

      if (ov.kind === 'ortodontia') {
        const r = document.createElementNS(ns, 'rect')
        // Tamanho consistente em pixels e colocado na zona da coroa
        // tal como no legado (usa centro da coroa em coordenadas de ecrã).
        const desiredSizePx = 12
        const desiredStrokePx = 1.6

        const svgRect = svgEl.getBoundingClientRect()
        const scaleX = svgRect.width / w
        const scaleY = svgRect.height / h
        const scale = Math.min(scaleX || 1, scaleY || 1)
        const size = Math.max(2.2, desiredSizePx / scale)
        const strokeW = Math.max(0.8, desiredStrokePx / scale)

        const crownEl = svgEl.querySelector('.coroaDente') as SVGGraphicsElement | null
        let cx = x + w * 0.5
        let cy = y + h * 0.5

        if (crownEl) {
          try {
            const crownRect = crownEl.getBoundingClientRect()
            const centerClientX = crownRect.left + crownRect.width / 2
            const centerClientY = crownRect.top + crownRect.height / 2

            // Converte o centro em pixels para coordenadas do viewBox.
            const relX = (centerClientX - svgRect.left) / (svgRect.width || 1)
            const relY = (centerClientY - svgRect.top) / (svgRect.height || 1)
            cx = x + relX * w
            cy = y + relY * h
          } catch {
            // fallback fica com centro genérico
            cx = x + w * 0.5
            cy = y + h * 0.30
          }
        } else {
          // Fallback se não existir coroa.
          cx = x + w * 0.5
          cy = y + h * 0.30
        }

        let rectX = cx - size / 2
        let rectY = cy - size / 2

        // Clamp suave dentro do viewBox para garantir visibilidade.
        const pad = size * 0.08
        const minX = x + pad
        const maxX = x + w - pad - size
        const minY = y + pad
        const maxY = y + h - pad - size
        rectX = Math.max(minX, Math.min(maxX, rectX))
        rectY = Math.max(minY, Math.min(maxY, rectY))

        r.setAttribute('x', String(rectX))
        r.setAttribute('y', String(rectY))
        r.setAttribute('width', String(size))
        r.setAttribute('height', String(size))
        r.setAttribute('fill', ov.color)
        r.setAttribute('stroke', '#000000')
        r.setAttribute('stroke-width', String(strokeW))
        r.setAttribute('rx', String(size * 0.12))
        r.setAttribute('ry', String(size * 0.12))
        add(r)
      }
    }
  }, [appliedOverlays, numero])

  return (
    <button
      type='button'
      className='cursor-pointer p-0 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 [&>svg]:max-h-20 [&>svg]:block'
      aria-label={`Dente ${numero}`}
      id={anchorId}
      ref={rootRef}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => {
        const target = e.target as Element | null
        const anyZoneEl = target?.closest?.('.coroaDente,.raizDente') as Element | null
        const zoneEl = target?.closest?.(clickableSelector) as Element | null

        if (disableZoneClicks && anyZoneEl) {
          onSelect?.(numero)
          return
        }

        // Normaliza o clique em qualquer zona do dente para a zona “correta”
        // consoante o tratamento/estado selecionado (ex.: tratamentos só de coroa).
        if (zoneEl || anyZoneEl) {
          const root = rootRef.current
          const svgRoot = (root?.querySelector?.('svg') as unknown as SVGElement | null) ?? null

          const clickedEl = (zoneEl ?? anyZoneEl) as Element
          const isCoroaClicked = clickedEl.classList.contains('coroaDente')
          const clickedZona: 'coroa' | 'raiz' = isCoroaClicked ? 'coroa' : 'raiz'

          let effectiveZona: 'coroa' | 'raiz' = clickedZona
          if (clickableZones && clickableZones.length > 0) {
            if (!clickableZones.includes(clickedZona)) {
              // Se a zona clicada não é permitida (ex.: só coroa),
              // mapeamos automaticamente para a primeira zona permitida.
              effectiveZona = clickableZones[0]
            }
          }

          const isCoroaEffective = effectiveZona === 'coroa'
          // Elemento alvo para highlight local: se mudamos a zona efetiva,
          // escolhemos um elemento dessa zona; caso contrário usamos o clicado.
          let highlightEl: Element | null = clickedEl
          if (svgRoot && effectiveZona !== clickedZona) {
            const selector = isCoroaEffective ? '.coroaDente' : '.raizDente'
            highlightEl = svgRoot.querySelector(selector)
          }

          const isSelected = highlightEl?.getAttribute('data-selected') === '1'
          const next = !isSelected

          const ok = onZoneSelect?.(numero, effectiveZona, next)
          if (ok === false) return

          if (!suppressLocalHighlight && highlightEl) {
            if (toggleWholeTooth && svgRoot) {
              setSelectedAllToothParts(svgRoot, next)
            } else {
              setSelected(highlightEl, next)
            }
          }
          return
        }

        // clique fora das zonas (fallback): seleciona o dente
        onSelect?.(numero)
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

