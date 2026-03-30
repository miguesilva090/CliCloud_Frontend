import { useEffect, useRef } from 'react'
import { toast } from '@/utils/toast-utils'
import { ODONTOGRAMA_TOAST_INVALID_ZONE } from './odontograma-messages'

const surfaceSvgs = import.meta.glob('@/assets/odontograma/dente*roda.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function getSurfaceSvg(numero: number): string | undefined {
  const fileName = `dente${numero}roda.svg`
  const entry = Object.entries(surfaceSvgs).find(([path]) =>
    path.endsWith(`/${fileName}`),
  )
  return entry?.[1]
}

export interface ToothSurfaceSvgProps {
  numero: number
  appliedAreas?: Record<string, string>
  activeColor?: string
  /** Restringe as áreas clicáveis (ex.: só bordas para bolsa periodontal). */
  clickableAreaClasses?: string[]
  onSelect?: (dente: number, areaClass: string, selected?: boolean) => boolean | void
}

export function ToothSurfaceSvg({
  numero,
  appliedAreas,
  activeColor = '#fa5722',
  clickableAreaClasses,
  onSelect,
}: ToothSurfaceSvgProps) {
  const svg = getSurfaceSvg(numero)
  const rootRef = useRef<HTMLButtonElement | null>(null)
  const lastInvalidToastAtRef = useRef<number>(0)
  const skipClickInvalidToastUntilRef = useRef<number>(0)

  if (!svg) {
    return null
  }

  // Existem dois modelos de roda no legado:
  // - `DRA*` (ex.: dente38roda.svg) e
  // - `DRB*` (ex.: dente41roda.svg)
  // Precisamos suportar ambos.
  const defaultClickableSelector =
    '.DRACentro,.DRACima,.DRADir,.DRABaixo,.DRAEsq,.DRABordaCima,.DRABordaDir,.DRABordaBaixo,.DRABordaEsq,' +
    '.DRBCima,.DRBDir,.DRBBaixo,.DRBEsq,.DRBBordaCima,.DRBBordaDir,.DRBBordaBaixo,.DRBBordaEsq'

  const clickableSelector =
    clickableAreaClasses && clickableAreaClasses.length > 0
      ? clickableAreaClasses.map((c) => `.${c}`).join(',')
      : defaultClickableSelector

  const applyHighlight = (el: Element | null) => {
    if (!el) return
    // cor de destaque para identificar a zona selecionada
    ;(el as SVGElement).style.fill = activeColor
  }

  const clearHighlight = (el: Element | null) => {
    if (!el) return
    // Os SVGs do legado trazem `style="fill:#ffffff"` inline, por isso usamos style.fill
    // para garantir que a cor aplicada tem prioridade.
    ;(el as SVGElement).style.fill = '#ffffff'
  }

  const ensureWheelHitbox = () => {
    const root = rootRef.current
    const svgEl = root?.querySelector?.('svg') as SVGSVGElement | null
    if (!svgEl) return

    // Garante que existe um "alvo" clicável em toda a roda (há SVGs em que certas zonas
    // internas/linhas não disparam eventos, ficando sem toast).
    const existing = svgEl.querySelector('[data-wheel-hitbox="1"]')
    if (existing) return

    const ns = 'http://www.w3.org/2000/svg'
    const vb = svgEl.viewBox?.baseVal
    const x = vb?.x ?? 0
    const y = vb?.y ?? 0
    const w = vb?.width ?? 17
    const h = vb?.height ?? 17

    const r = document.createElementNS(ns, 'rect')
    r.setAttribute('data-wheel-hitbox', '1')
    r.setAttribute('x', String(x))
    r.setAttribute('y', String(y))
    r.setAttribute('width', String(w))
    r.setAttribute('height', String(h))
    r.setAttribute('fill', 'transparent')
    r.setAttribute('pointer-events', 'all')

    // Colocamos a hitbox POR CIMA para garantir que o evento chega sempre.
    // Depois, no handler, descobrimos o elemento real por baixo com elementFromPoint.
    svgEl.appendChild(r)

    // E força pointer-events nas zonas.
    svgEl.style.pointerEvents = 'all'
    svgEl.querySelectorAll(defaultClickableSelector).forEach((el) => {
      ;(el as SVGElement).style.pointerEvents = 'all'
    })
  }

  const getUnderlyingWheelTarget = (clientX: number, clientY: number): Element | null => {
    const root = rootRef.current
    const svgEl = root?.querySelector?.('svg') as SVGSVGElement | null
    if (!svgEl) return null
    const hitbox = svgEl.querySelector('[data-wheel-hitbox="1"]') as SVGElement | null
    if (!hitbox) return document.elementFromPoint(clientX, clientY) as Element | null

    // Temporariamente desliga a hitbox para descobrir o path real por baixo.
    const prev = hitbox.style.pointerEvents
    hitbox.style.pointerEvents = 'none'
    const el = document.elementFromPoint(clientX, clientY) as Element | null
    hitbox.style.pointerEvents = prev || 'all'
    return el
  }

  useEffect(() => {
    ensureWheelHitbox()
    const root = rootRef.current
    const svgEl = root?.querySelector?.('svg')
    if (!svgEl) return

    // reset
    svgEl.querySelectorAll(clickableSelector).forEach((el) => {
      ;(el as SVGElement).style.fill = '#ffffff'
      el.removeAttribute('data-selected')
    })

    if (!appliedAreas) return
    Object.entries(appliedAreas).forEach(([areaClass, color]) => {
      const el = svgEl.querySelector(`.${areaClass}`)
      if (!el) return
      el.setAttribute('data-selected', '1')
      ;(el as SVGElement).style.fill = color
    })
  }, [appliedAreas, clickableSelector])

  return (
    <button
      type='button'
      className='cursor-pointer p-0 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 [&>svg]:h-10 [&>svg]:w-10 [&>svg]:max-h-10 [&>svg]:max-w-10'
      aria-label={`Superfícies dente ${numero}`}
      ref={rootRef}
      onPointerDown={(e) => {
        // Em alguns browsers/SVGs, certos alvos podem não disparar `click` como esperado.
        // `pointerdown` é mais fiável para dar feedback em zonas inválidas.
        const hasRestriction = Boolean(clickableAreaClasses && clickableAreaClasses.length > 0)
        if (!hasRestriction) return

        const underlying = getUnderlyingWheelTarget(e.clientX, e.clientY)
        const target = (underlying ?? (e.target as Element | null)) as Element | null
        const allowedSelector = clickableAreaClasses!.map((c) => `.${c}`).join(',')
        const allowedEl = target?.closest?.(allowedSelector) as Element | null
        if (!allowedEl) {
          const now = Date.now()
          if (now - lastInvalidToastAtRef.current > 350) {
            lastInvalidToastAtRef.current = now
            toast.error(ODONTOGRAMA_TOAST_INVALID_ZONE)
          }
          // Evita duplicar toast no onClick do mesmo gesto.
          skipClickInvalidToastUntilRef.current = now + 500
        }
      }}
      onClick={(e) => {
        if (!onSelect) return
        const underlying = getUnderlyingWheelTarget(e.clientX, e.clientY)
        const target = (underlying ?? (e.target as Element | null)) as Element | null
        const hasRestriction = Boolean(clickableAreaClasses && clickableAreaClasses.length > 0)

        // Quando há restrição (ex.: Bolsa Periodontal), primeiro tentamos apanhar uma zona permitida.
        // Se o clique foi numa zona da roda mas fora das zonas permitidas, mostramos toast.
        if (hasRestriction) {
          const allowedSelector = clickableAreaClasses!.map((c) => `.${c}`).join(',')
          const allowedEl = target?.closest?.(allowedSelector) as Element | null
          if (!allowedEl) {
            const now = Date.now()
            if (now >= skipClickInvalidToastUntilRef.current && now - lastInvalidToastAtRef.current > 350) {
              lastInvalidToastAtRef.current = now
              toast.error(ODONTOGRAMA_TOAST_INVALID_ZONE)
            }
            return
          }

          const areaClass = allowedEl.classList?.[0] ?? ''
          const clickable = allowedEl

          // multi-seleção: cada zona faz toggle independente
          const isSelected = clickable.getAttribute('data-selected') === '1'
          const nextSelected = !isSelected
          const ok = onSelect(numero, areaClass ?? '', nextSelected)
          if (ok === false) return

          if (nextSelected) {
            clickable.setAttribute('data-selected', '1')
            applyHighlight(clickable)
          } else {
            clickable.removeAttribute('data-selected')
            clearHighlight(clickable)
          }
          return
        }

        const anyArea = target?.closest?.(defaultClickableSelector) as Element | null
        if (!anyArea) return
        const areaClass = anyArea.classList?.[0] ?? ''
        const clickable = anyArea

        // multi-seleção: cada zona faz toggle independente
        const isSelected = clickable.getAttribute('data-selected') === '1'
        const nextSelected = !isSelected
        const ok = onSelect(numero, areaClass ?? '', nextSelected)
        if (ok === false) return

        if (nextSelected) {
          clickable.setAttribute('data-selected', '1')
          applyHighlight(clickable)
        } else {
          clickable.removeAttribute('data-selected')
          clearHighlight(clickable)
        }
      }}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

