const toothSvgs = import.meta.glob('@/assets/odontograma/dente*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const wheelSvgs = import.meta.glob('@/assets/odontograma/dente*roda.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const miscSvgs = import.meta.glob('@/assets/odontograma/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function getSvgRaw(fileName: string): string | undefined {
  const entry = Object.entries(toothSvgs).find(([path]) => path.endsWith(`/${fileName}`))
  return entry?.[1]
}

function getWheelSvgRaw(fileName: string): string | undefined {
  const entry = Object.entries(wheelSvgs).find(([path]) => path.endsWith(`/${fileName}`))
  return entry?.[1]
}

function getMiscSvgRaw(fileName: string): string | undefined {
  const entry = Object.entries(miscSvgs).find(([path]) => path.endsWith(`/${fileName}`))
  return entry?.[1]
}

function normalizeForButtonIcon(raw: string, sizePx = 20): string {
  // Garante um <svg ...> com width/height em px, preservando o viewBox.
  // Remove width/height antigos (mm) para não quebrar o layout do botão.
  return raw.replace(/<svg\b([^>]*)>/i, (_m, attrs) => {
    const cleaned = String(attrs)
      .replace(/\s(width|height)=\"[^\"]*\"/gi, '')
      .replace(/\sstyle=\"[^\"]*\"/gi, '')
    return `<svg${cleaned} width="${sizePx}" height="${sizePx}" style="display:block">`
  })
}

function forceSvgFill(raw: string, hexColor: string): string {
  // Força TODOS os fills (atributo e style) para a mesma cor (ex.: dente ausente a preto).
  const color = hexColor.toLowerCase()
  return raw
    // fill="..."
    .replace(/\sfill=\"[^\"]*\"/gi, ` fill="${color}"`)
    // style="...fill:#xxxxxx..."
    .replace(/fill:\s*#[0-9a-fA-F]{3,8}\s*;?/g, `fill:${color};`)
}

function forceFillByToothPartClass(
  raw: string,
  colors: Partial<Record<'coroaDente' | 'raizDente' | 'fundoDente', string>>,
): string {
  let out = raw
  const apply = (cls: 'coroaDente' | 'raizDente' | 'fundoDente', color: string) => {
    const c = color.toLowerCase()

    // Atualiza style="...fill:..."
    out = out.replace(
      new RegExp(`(<[^>]+class="[^"]*\\b${cls}\\b[^"]*"[^>]*style="[^"]*)fill:\\s*[^;"]+`, 'gi'),
      `$1fill:${c}`,
    )

    // Atualiza atributo fill="..." (se existir)
    out = out.replace(
      new RegExp(`(<[^>]+class="[^"]*\\b${cls}\\b[^"]*"[^>]*?)\\sfill="[^"]*"`, 'gi'),
      `$1 fill="${c}"`,
    )
  }

  if (colors.fundoDente) apply('fundoDente', colors.fundoDente)
  if (colors.raizDente) apply('raizDente', colors.raizDente)
  if (colors.coroaDente) apply('coroaDente', colors.coroaDente)

  return out
}

function forceStrokeByToothPartClass(
  raw: string,
  colors: Partial<Record<'coroaDente' | 'raizDente' | 'fundoDente', string>>,
): string {
  let out = raw
  const apply = (cls: 'coroaDente' | 'raizDente' | 'fundoDente', color: string) => {
    const c = color.toLowerCase()

    // Atualiza stroke em style="...stroke:..."
    out = out.replace(
      new RegExp(`(<[^>]+class="[^"]*\\b${cls}\\b[^"]*"[^>]*style="[^"]*)stroke:\\s*[^;"]+`, 'gi'),
      `$1stroke:${c}`,
    )

    // Atualiza atributo stroke="..." (se existir)
    out = out.replace(
      new RegExp(`(<[^>]+class="[^"]*\\b${cls}\\b[^"]*"[^>]*?)\\sstroke="[^"]*"`, 'gi'),
      `$1 stroke="${c}"`,
    )
  }

  if (colors.fundoDente) apply('fundoDente', colors.fundoDente)
  if (colors.raizDente) apply('raizDente', colors.raizDente)
  if (colors.coroaDente) apply('coroaDente', colors.coroaDente)

  return out
}

function getViewBox(raw: string): { x: number; y: number; w: number; h: number } | null {
  const m = raw.match(/viewBox="([^"]+)"/i)
  if (!m) return null
  const parts = m[1].trim().split(/\s+/).map(Number)
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null
  const [x, y, w, h] = parts
  return { x, y, w, h }
}

function addCircleOverlay(
  raw: string,
  circle: { cx: number; cy: number; r: number; fill: string; stroke?: string; strokeWidth?: number },
): string {
  const { cx, cy, r, fill, stroke = '#000000', strokeWidth = 0.6 } = circle
  const el =
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ` +
    `stroke="${stroke}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" />`
  return raw.replace(/<\/svg>\s*$/i, `${el}</svg>`)
}

function addPolylineOverlay(
  raw: string,
  poly: { points: Array<[number, number]>; stroke: string; strokeWidth: number },
): string {
  const pts = poly.points.map((p) => p.join(',')).join(' ')
  const el =
    `<polyline points="${pts}" fill="none" stroke="${poly.stroke}" ` +
    `stroke-width="${poly.strokeWidth}" vector-effect="non-scaling-stroke" />`
  return raw.replace(/<\/svg>\s*$/i, `${el}</svg>`)
}

function addLineOverlay(
  raw: string,
  line: { x1: number; y1: number; x2: number; y2: number; stroke: string; strokeWidth: number },
): string {
  const el =
    `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" ` +
    `stroke="${line.stroke}" stroke-width="${line.strokeWidth}" ` +
    `vector-effect="non-scaling-stroke" stroke-linecap="round" />`
  return raw.replace(/<\/svg>\s*$/i, `${el}</svg>`)
}

function addRectOverlay(
  raw: string,
  rect: {
    x: number
    y: number
    width: number
    height: number
    fill: string
    stroke?: string
    strokeWidth?: number
    rx?: number
    ry?: number
  },
): string {
  const {
    x,
    y,
    width,
    height,
    fill,
    stroke = '#000000',
    strokeWidth = 0.7,
    rx = 0.6,
    ry = 0.6,
  } = rect
  const el =
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" ` +
    `fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" rx="${rx}" ry="${ry}" ` +
    `vector-effect="non-scaling-stroke" />`
  return raw.replace(/<\/svg>\s*$/i, `${el}</svg>`)
}

function addRectBackground(
  raw: string,
  rect: { x: number; y: number; width: number; height: number; fill: string },
): string {
  const { x, y, width, height, fill } = rect
  return raw.replace(
    /<svg\b([^>]*)>/i,
    `<svg$1><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" />`,
  )
}

function forceFillForAnyClassMatch(raw: string, classRegex: RegExp, hexColor: string): string {
  const c = hexColor.toLowerCase()
  // Altera fill em style="...fill:..." para elementos cujo class="..." casa com classRegex
  return raw.replace(/(<[^>]+class="[^"]*"[^>]*>)/gi, (tag) => {
    if (!classRegex.test(tag)) return tag
    let out = tag
    // style fill
    out = out.replace(/(style="[^"]*)fill:\s*[^;"]+/i, `$1fill:${c}`)
    // attribute fill
    out = out.replace(/\sfill="[^"]*"/i, ` fill="${c}"`)
    return out
  })
}

const BASE_SVG =
  getSvgRaw('dente47.svg') ??
  '<svg viewBox="0 0 24 24" width="44" height="44" xmlns="http://www.w3.org/2000/svg"></svg>'

export const ODONTOGRAMA_BUTTON_ICON_SVG = normalizeForButtonIcon(BASE_SVG, 44)

export const ODONTOGRAMA_BUTTON_ICON_SVG_ALL_BLACK = normalizeForButtonIcon(
  forceSvgFill(BASE_SVG, '#000000'),
  44,
)

export const ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_YELLOW = normalizeForButtonIcon(
  forceFillByToothPartClass(BASE_SVG, {
    fundoDente: '#000000',
    raizDente: '#ffffff',
    coroaDente: '#fff176',
  }),
  44,
)

export const ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_BLUE = normalizeForButtonIcon(
  // Igual ao print: manter o outline original do SVG e pintar apenas a coroa a azul.
  forceFillByToothPartClass(BASE_SVG, {
    raizDente: '#ffffff',
    coroaDente: '#85c9ea',
  }),
  44,
)

export const ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_GREEN = normalizeForButtonIcon(
  // Igual ao print da Higiene: coroa a verde, raiz branca, outline original.
  forceFillByToothPartClass(BASE_SVG, {
    raizDente: '#ffffff',
    coroaDente: '#81c784',
  }),
  44,
)

export const ODONTOGRAMA_BUTTON_ICON_SVG_CROWN_PURPLE = normalizeForButtonIcon(
  // Para Destartarização: coroa lilás, raiz branca, outline original.
  forceFillByToothPartClass(BASE_SVG, {
    raizDente: '#ffffff',
    coroaDente: '#ce93d8',
  }),
  44,
)

export const ODONTOGRAMA_BUTTON_ICON_SVG_ENDODONTIA = normalizeForButtonIcon(
  // Para Edodontia/Desvitalização: raiz roxa, coroa branca.
  forceFillByToothPartClass(BASE_SVG, {
    raizDente: '#ba68c8',
    coroaDente: '#ffffff',
  }),
  44,
)

export const ODONTOGRAMA_BUTTON_ICON_SVG_GENGIVETOMIA = (() => {
  const vb = getViewBox(BASE_SVG) ?? { x: 0, y: 0, w: 30, h: 30 }
  // Barra vertical rosa suficientemente larga para ficar atrás de TODO o dente.
  const barWidth = vb.w * 1.30
  const withBar = addRectBackground(BASE_SVG, {
    x: vb.x - 3.5,
    y: vb.y,
    width: barWidth,
    height: vb.h,
    fill: '#f48fb1',
  })
  return normalizeForButtonIcon(withBar, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_BRANQUEAMENTO = (() => {
  const vb = getViewBox(BASE_SVG) ?? { x: 0, y: 0, w: 30, h: 30 }
  // Igual à Gengivetomia mas com barra branca (dente sobre fundo branco).
  const barWidth = vb.w * 1.30
  const withBar = addRectBackground(BASE_SVG, {
    x: vb.x - 3.5,
    y: vb.y,
    width: barWidth,
    height: vb.h,
    fill: '#ffffff',
  })
  return normalizeForButtonIcon(withBar, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_EXTRACAO = normalizeForButtonIcon(
  // Para extração: dente “apagado” (cinzento) com contorno vermelho-escuro,
  // distinto do dente ausente (preto).
  (() => {
    let base = BASE_SVG
    base = forceFillByToothPartClass(base, {
      fundoDente: '#550000',
      raizDente: '#808080',
      coroaDente: '#808080',
    })
    base = forceStrokeByToothPartClass(base, {
      raizDente: '#550000',
      coroaDente: '#550000',
    })
    return base
  })(),
  44,
)

export const ODONTOGRAMA_BUTTON_ICON_SVG_IMPLANTE = normalizeForButtonIcon(
  getMiscSvgRaw('implante.svg') ??
    '<svg viewBox="0 0 24 24" width="44" height="44" xmlns="http://www.w3.org/2000/svg"></svg>',
  44,
)

export const ODONTOGRAMA_BUTTON_ICON_SVG_ORTODONTIA = (() => {
  const vb = getViewBox(BASE_SVG) ?? { x: 0, y: 0, w: 24, h: 24 }
  const size = Math.max(3.9, Math.min(vb.w, vb.h) * 0.28)
  const x = vb.x + vb.w * 0.5 - size / 2
  const y = vb.y + vb.h * 0.18
  const withSq = addRectOverlay(BASE_SVG, {
    x,
    y,
    width: size,
    height: size,
    fill: '#ff49e0',
    stroke: '#000000',
    strokeWidth: Math.max(1.2, size * 0.20),
    rx: size * 0.10,
    ry: size * 0.10,
  })
  return normalizeForButtonIcon(withSq, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_FISTULA = (() => {
  const vb = getViewBox(BASE_SVG) ?? { x: 0, y: 0, w: 24, h: 24 }
  // No botão queremos o ponto no ápice (ponta inferior do dente do ícone)
  const cx = vb.x + vb.w * 0.5
  const cy = vb.y + vb.h * 0.92
  const r = Math.max(1.8, Math.min(vb.w, vb.h) * 0.165)
  return normalizeForButtonIcon(
    addCircleOverlay(BASE_SVG, { cx, cy, r, fill: '#ff0000', stroke: '#000000', strokeWidth: r * 0.14 }),
    44,
  )
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_FRATURA = (() => {
  const vb = getViewBox(BASE_SVG) ?? { x: 0, y: 0, w: 24, h: 24 }
  const pts: Array<[number, number]> = [
    [vb.x + vb.w * 0.08, vb.y + vb.h * 0.10],
    [vb.x + vb.w * 0.72, vb.y + vb.h * 0.52],
    [vb.x + vb.w * 0.46, vb.y + vb.h * 0.64],
    [vb.x + vb.w * 0.88, vb.y + vb.h * 0.95],
  ]
  const strokeW = Math.max(1.4, Math.min(vb.w, vb.h) * 0.075)
  return normalizeForButtonIcon(
    addPolylineOverlay(BASE_SVG, { points: pts, stroke: '#ff0000', strokeWidth: strokeW }),
    44,
  )
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_BOLSA_PERIODONTAL = (() => {
  const base =
    getWheelSvgRaw('dente47roda.svg') ??
    '<svg viewBox="0 0 17 17" width="44" height="44" xmlns="http://www.w3.org/2000/svg"></svg>'
  // No ícone, pintamos apenas UMA das 4 zonas exteriores (ex.: a de baixo).
  const withGreen = forceFillForAnyClassMatch(base, /\bDRABordaBaixo\b/i, '#388e3c')
  return normalizeForButtonIcon(withGreen, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_CARIE = (() => {
  const base =
    getWheelSvgRaw('dente47roda.svg') ??
    '<svg viewBox="0 0 17 17" width="44" height="44" xmlns="http://www.w3.org/2000/svg"></svg>'
  // No ícone do legado a cárie aparece com várias zonas pintadas a castanho.
  // Para replicar o print: pinta as 4 zonas internas (sem bordas e sem centro).
  const withBrown = forceFillForAnyClassMatch(
    base,
    /\bDR[AB](Cima|Dir|Esq)\b/i,
    '#795548',
  )
  return normalizeForButtonIcon(withBrown, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_RESTAURACAO = (() => {
  const base =
    getWheelSvgRaw('dente47roda.svg') ??
    '<svg viewBox="0 0 17 17" width="44" height="44" xmlns="http://www.w3.org/2000/svg"></svg>'
  // Igual ao print: pinta as zonas internas e o centro a laranja, mantendo bordas externas a branco.
  let out = base
  out = forceFillForAnyClassMatch(out, /\bDR[AB](Cima|Dir|Baixo|Esq)\b/i, '#fa5722')
  out = forceFillForAnyClassMatch(out, /\bDRACentro\b/i, '#fa5722')
  return normalizeForButtonIcon(out, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_SELANTE_FISSURAS = (() => {
  const base =
    getWheelSvgRaw('dente47roda.svg') ??
    '<svg viewBox="0 0 17 17" width="44" height="44" xmlns="http://www.w3.org/2000/svg"></svg>'
  // Ícone conforme print: centro da roda totalmente preenchido a preto,
  // mantendo as restantes zonas a branco.
  const out = forceFillForAnyClassMatch(base, /\bDRACentro\b/i, '#000000')
  return normalizeForButtonIcon(out, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_OUTROS_ESTADOS = (() => {
  const vb = getViewBox(BASE_SVG) ?? { x: 0, y: 0, w: 24, h: 24 }
  const strokeW = Math.max(2.6, Math.min(vb.w, vb.h) * 0.19)
  const cx = vb.x + vb.w * 0.78
  const cy = vb.y + vb.h * 0.68
  const len = vb.w * 0.44
  let out = BASE_SVG
  out = addLineOverlay(out, {
    x1: cx - len / 2,
    y1: cy,
    x2: cx + len / 2,
    y2: cy,
    stroke: '#1e88e5',
    strokeWidth: strokeW,
  })
  out = addLineOverlay(out, {
    x1: cx,
    y1: cy - len / 2,
    x2: cx,
    y2: cy + len / 2,
    stroke: '#1e88e5',
    strokeWidth: strokeW,
  })
  return normalizeForButtonIcon(out, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_REMOVER_SELECAO = (() => {
  const vb = getViewBox(BASE_SVG) ?? { x: 0, y: 0, w: 24, h: 24 }
  const strokeW = Math.max(2.6, Math.min(vb.w, vb.h) * 0.19)
  const cx = vb.x + vb.w * 0.78
  const cy = vb.y + vb.h * 0.68
  const len = vb.w * 0.44
  let out = BASE_SVG
  out = addLineOverlay(out, {
    x1: cx - len / 2,
    y1: cy - len / 2,
    x2: cx + len / 2,
    y2: cy + len / 2,
    stroke: '#e53935',
    strokeWidth: strokeW,
  })
  out = addLineOverlay(out, {
    x1: cx + len / 2,
    y1: cy - len / 2,
    x2: cx - len / 2,
    y2: cy + len / 2,
    stroke: '#e53935',
    strokeWidth: strokeW,
  })
  return normalizeForButtonIcon(out, 44)
})()

export const ODONTOGRAMA_BUTTON_ICON_SVG_PONTE = (() => {
  // 1:1 com o ícone "ponte.svg" do legado (AtendimentoUtenteEdt.aspx).
  const raw = `<svg style="width: 30px;height: 40px;" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" sodipodi:docname="ponte.svg" inkscape:version="0.92.3 (2405546, 2018-03-11)" id="svg8" version="1.1" viewBox="0 0 20.766106 37.200215" height="37.200214mm" width="20.766106mm"> <g transform="translate(-216.77503,-38.494982)" id="layer1" inkscape:groupmode="layer" inkscape:label="Camada 1"> <g transform="matrix(0.79783797,0,0,0.79783797,-239.43232,-104.92703)" id="g1201"> <path inkscape:connector-curvature="0" id="path1063" d="m 577.22677,225.39189 c 0,-0.69385 -0.66404,-2.26626 -0.87586,-5.20347 -0.31428,-4.35797 -0.97931,-9.77033 -1.2554,-10.21705 -0.2316,-0.37474 -1.20138,-10.50075 -1.20225,-12.55341 -3.6e-4,-1.01472 -0.23631,-2.44347 -0.52417,-3.175 -1.39783,-3.55223 -2.01341,-9.72099 -1.20226,-12.04785 0.38764,-1.11199 1.79416,-2.12842 3.03104,-2.19041 3.70834,0.2692 6.68113,-0.66914 9.74127,0.0119 0.94315,4.54026 -0.5891,10.86743 -0.98915,14.48398 -0.26999,2.42534 -0.58478,6.99587 -0.69953,10.15671 -0.29101,8.01574 -1.28735,14.11759 -3.17787,19.46222 -0.81757,2.31131 -2.84582,3.07162 -2.84582,1.27255 z" style="fill:#000000;stroke-width:0.35277799"/> <path inkscape:connector-curvature="0" id="path1061" d="m 579.47329,223.69276 c 0.59114,-1.5807 1.46742,-4.85562 2.01137,-7.51704 0.40807,-1.99661 1.22725,-11.21668 1.22725,-13.81293 0,-2.04909 -0.0658,-2.26544 -0.61736,-2.03078 -2.22898,0.94829 -3.27768,1.02381 -4.57019,0.32913 -0.70882,-0.38097 -1.59753,-1.21539 -1.9749,-1.85427 -0.37737,-0.63887 -0.7575,-1.09022 -0.84473,-1.00298 -0.26404,0.26403 0.61174,9.76416 1.12639,12.21874 0.5989,2.85638 0.86066,5.04088 1.23889,10.33894 0.39454,5.52653 1.1768,6.61082 2.40328,3.33119 z" style="fill:#000000;stroke-width:0.35277799"/> <path inkscape:connector-curvature="0" id="path1059" d="m 580.90283,200.10775 c 1.5055,0 1.71855,-1.07686 2.1743,-4.25611 0.42238,-2.94653 1.39307,-16.05304 1.39449,-14.53224 l 0.004,-1.01017 -4.8507,0.14354 c -5.24929,0.15533 -6.24325,0.4441 -6.83746,1.98645 -1.49444,3.87902 1.43741,14.99201 4.57281,17.33294 1.07917,0.80573 1.95556,0.88875 3.54237,0.33559 z" style="fill:#000000;stroke-width:0.35277799"/> <path inkscape:connector-curvature="0" transform="scale(0.26458333)" id="path962" d="m 2184.3186,850.98631 c -1.4644,-2.40809 -2.3638,-8.43771 -3.5483,-23.78988 -1.1657,-15.10739 -1.9537,-21.54258 -3.8746,-31.64302 -1.5826,-8.32141 -3.3064,-22.9791 -4.2203,-35.88567 -0.9343,-13.19554 -0.9473,-13.13534 1.9379,-8.99932 4.2513,6.09458 8.8201,9.22332 13.8386,9.47675 3.0054,0.15176 4.6108,-0.18188 9.4166,-1.95697 2.7123,-1.00182 3.542,-1.18448 3.7622,-0.82822 1.1045,1.78725 0.5926,15.07637 -1.4305,37.13277 -1.6881,18.4043 -2.2518,21.96519 -5.5132,34.825 -2.9919,11.79757 -5.9045,20.08785 -7.7889,22.17011 -0.8612,0.95157 -1.8077,0.76753 -2.5795,-0.50155 z" style="fill:#ffffff;fill-opacity:1;stroke-width:1.64894998"/> <path inkscape:connector-curvature="0" transform="scale(0.26458333)" id="path964" d="m 2185.8944,756.95159 c -4.6731,-1.51086 -9.8128,-8.13286 -13.7989,-17.77842 -8.9719,-21.71047 -11.2869,-46.85224 -4.8743,-52.93719 3.1188,-2.95946 8.2467,-3.62704 33.6199,-4.37689 l 7.8666,-0.23247 v 2.02917 c 0,1.11604 -0.2383,4.51548 -0.5296,7.55431 -0.2912,3.03882 -1.1726,12.92324 -1.9586,21.96537 -2.1905,25.19921 -3.3736,34.45598 -4.9386,38.63878 -0.8122,2.17077 -2.703,4.1373 -3.9876,4.14724 -0.4307,0.003 -1.9764,0.3188 -3.4348,0.70104 -2.8145,0.73768 -6.1968,0.86043 -7.9641,0.28906 z" style="fill:#ffffff;fill-opacity:1;stroke-width:1.64894998"/> </g> <g transform="matrix(0.79783797,0,0,0.79783797,-243.32905,-104.0976)" id="g1194"> <path inkscape:connector-curvature="0" id="path1057" d="m 595.27633,223.69276 c 0,0.51732 -0.59928,-1.50812 -0.71496,-2.38124 -0.11568,-0.87313 -0.28273,-2.06375 -0.37122,-2.64584 -0.0885,-0.58208 -0.25316,-3.59833 -0.36593,-6.70277 -0.11277,-3.10445 -0.33655,-6.59695 -0.49729,-7.76112 -0.16074,-1.16416 -0.32292,-3.61575 -0.36041,-5.44796 -0.0375,-1.83222 -0.22157,-4.1341 -0.4091,-5.11528 -0.18752,-0.98119 -0.50837,-4.31328 -0.713,-7.40466 l -0.37204,-5.62068 c 1.33397,-1.2538 6.20249,-1.20085 9.76037,-0.67451 1.84672,0.45393 1.86242,0.75577 0.63818,12.26834 -0.28886,2.71638 -0.58922,5.73263 -0.66746,6.70277 -0.22244,2.75809 -0.85336,8.57213 -1.22502,11.28889 -1.97924,14.46772 -1.93741,14.2875 -3.31612,14.2875 -0.52931,0 -1.386,-1.35862 -1.386,-0.79375 z" style="fill:#000000;stroke-width:0.35277799"/> <path inkscape:connector-curvature="0" id="path1055" d="m 597.90936,220.07679 c 0.30644,-1.94027 0.82242,-5.59152 1.14661,-8.11388 0.79397,-6.17757 0.88939,-6.99601 1.16519,-9.9937 l 0.23786,-2.58535 -1.20064,0.73195 c -2.05407,1.48372 -5.27036,-1.99696 -4.96192,-1.51144 l -0.70222,-1.10535 0.18092,2.99861 c 1.00045,16.5817 1.25529,20.35778 1.4046,20.81389 0.0953,0.29104 0.27147,0.97603 0.39155,1.5222 0.17034,0.77483 0.39,0.96863 0.9996,0.88195 0.70226,-0.0999 0.83763,-0.4679 1.33845,-3.63888 z" style="fill:#000000;stroke-width:0.35277799"/> <path inkscape:connector-curvature="0" id="path1053" d="m 599.22556,199.34843 c 1.75737,0 1.86462,-4.01093 2.71581,-15.31339 l 0.24351,-3.23343 -1.88718,-0.22876 c -3.64125,-0.98191 -4.42352,-0.13504 -7.8844,-0.007 l -0.059,2.11666 c -0.0726,2.60325 0.44023,8.44178 0.99139,11.28889 0.95401,4.92808 3.55494,7.30668 5.87983,5.37719 z" style="fill:#000000;stroke-width:0.35277799"/> <path inkscape:connector-curvature="0" transform="scale(0.26458333)" id="path958" d="m 2256.4358,755.48579 c -6.7148,-1.8452 -12.0111,-11.44047 -14.2795,-25.87009 -2.0533,-13.06126 -3.1467,-27.47073 -2.9778,-39.24442 l 0.1116,-7.77818 1.9445,-0.0975 c 1.0695,-0.0536 4.3159,-0.41156 7.2141,-0.79549 6.8429,-0.90647 11.7936,-0.89657 16.1204,0.0322 1.8474,0.39654 5.1057,0.96138 7.2409,1.25521 2.1351,0.29383 3.9079,0.56392 3.9395,0.6002 0.103,0.1183 -2.9892,40.56011 -3.5735,46.73501 -1.2981,13.71933 -2.6795,19.78026 -4.998,21.929 -0.5194,0.48135 -1.3095,0.87519 -1.7557,0.87519 -0.4463,0 -0.9116,0.16213 -1.0341,0.36028 -0.3875,0.62707 -3.4752,2.02096 -4.9456,2.23259 -0.7778,0.11196 -2.1309,0.007 -3.0068,-0.23408 z" style="fill:#ffffff;fill-opacity:1;stroke-width:1.64894998"/> <path inkscape:connector-curvature="0" transform="scale(0.26458333)" id="path960" d="m 2252.2532,844.75572 c -0.9501,-0.95006 -2.7773,-8.71619 -3.2164,-13.6702 -0.7842,-8.84886 -5.3927,-83.31429 -5.1699,-83.5371 0.074,-0.0736 0.5462,0.56998 1.0503,1.43014 1.1037,1.88335 5.5679,5.32222 9.3989,7.24027 2.4767,1.24001 2.8618,1.32759 5.8374,1.32759 h 3.1858 l 2.7571,-1.71748 c 1.5164,-0.94461 2.8376,-1.63696 2.936,-1.53855 0.8173,0.81733 -6.049,57.04431 -9.5955,78.57585 -1.4674,8.90898 -1.9955,10.83915 -3.2319,11.81166 -1.1542,0.9079 -3.0838,0.94589 -3.9518,0.0778 z" style="fill:#ffffff;fill-opacity:1;stroke-width:1.64894998"/> </g> <rect style="opacity:1;fill:#ffee58;fill-opacity:1;fill-rule:nonzero;stroke:#000000;stroke-width:0.71960086;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="rect857" width="14.624326" height="5.2951765" x="220.18718" y="45.88163"/> </g></svg>`

  return normalizeForButtonIcon(raw, 44)
})()

