import type { ConfiguracaoVozDTO } from '@/types/dtos/core/voz.dtos'

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives?: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

export type VozSuporte = {
  sttSuportado: boolean
  ttsSuportado: boolean
}

export type IniciarSttCallbacks = {
  onTextoParcial?: (texto: string) => void
  onTextoFinal?: (texto: string) => void
  onErro?: (erro: string) => void
  onFim?: () => void
}

export type SessaoStt = {
  parar: () => void
  abortar: () => void
}

export type VozBrowserOpcao = {
  codigo: string
  descricao: string
  idioma: string
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as any
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return (ctor as SpeechRecognitionCtor | undefined) ?? null
}

export class VozRuntimeService {
  private static normalizarLang(lang?: string | null): string {
    return (lang || '').trim().toLowerCase()
  }

  private static mesmoIdiomaBase(a?: string | null, b?: string | null): boolean {
    const aNorm = this.normalizarLang(a)
    const bNorm = this.normalizarLang(b)
    if (!aNorm || !bNorm) return false
    return aNorm.split('-')[0] === bNorm.split('-')[0]
  }

  private static escolherPrimeiraPorIdioma(
    voices: SpeechSynthesisVoice[],
    idiomaPadrao: string
  ): SpeechSynthesisVoice | null {
    const idiomaNorm = this.normalizarLang(idiomaPadrao)
    if (!idiomaNorm) return null

    const exata = voices.find((v) => this.normalizarLang(v.lang) === idiomaNorm)
    if (exata) return exata

    const familia = voices.find((v) => this.mesmoIdiomaBase(v.lang, idiomaNorm))
    return familia ?? null
  }

  private static escolherVoz(voices: SpeechSynthesisVoice[], vozConfigurada: string): SpeechSynthesisVoice | null {
    const alvo = (vozConfigurada || '').trim()
    if (!alvo) return null

    const exact = voices.find((v) => v.name === alvo || v.voiceURI === alvo)
    if (exact) return exact

    const partes = alvo.split('-')
    if (partes.length < 2) return null

    const lang = `${partes[0]}-${partes[1]}`
    const genero = (partes[2] || '').toLowerCase()

    const porIdiomaExato = voices.filter((v) => {
      const vLang = (v.lang || '').toLowerCase()
      return vLang === lang.toLowerCase()
    })
    const porFamiliaIdioma = voices.filter((v) => {
      const vLang = (v.lang || '').toLowerCase()
      return vLang.startsWith(`${partes[0].toLowerCase()}-`)
    })
    const candidatas = porIdiomaExato.length ? porIdiomaExato : porFamiliaIdioma
    if (!candidatas.length) return null

    const femininoRx = /(female|feminina|woman|mulher|maria|helena|ana)/i
    const masculinoRx = /(male|masculina|man|homem|paulo|joao|joão)/i

    if (genero === 'female') {
      const candidata = candidatas.find((v) => femininoRx.test(v.name))
      if (candidata) return candidata
    }
    if (genero === 'male') {
      const candidata = candidatas.find((v) => masculinoRx.test(v.name))
      if (candidata) return candidata
    }

    // Fallback: manter a escolha previsível no mesmo idioma.
    if (genero === 'male' && candidatas.length > 1) return candidatas[1]
    return candidatas[0]
  }

  static async traduzirTextoParaIdioma(texto: string, idiomaDestino: string): Promise<string> {
    const textoLimpo = texto?.trim()
    if (!textoLimpo) return ''

    const destino = (idiomaDestino || 'pt-PT').split('-')[0].toLowerCase()
    if (!destino) return textoLimpo

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(destino)}&dt=t&q=${encodeURIComponent(textoLimpo)}`

    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) {
      throw new Error(`Falha na tradução (${response.status})`)
    }

    const data = (await response.json()) as unknown
    if (!Array.isArray(data) || !Array.isArray(data[0])) return textoLimpo

    const segmentos = (data[0] as unknown[])
      .map((segmento) => (Array.isArray(segmento) ? String(segmento[0] ?? '') : ''))
      .join('')
      .trim()

    return segmentos || textoLimpo
  }

  static obterSuporte(): VozSuporte {
    if (typeof window === 'undefined') {
      return { sttSuportado: false, ttsSuportado: false }
    }

    return {
      sttSuportado: !!getSpeechRecognitionCtor(),
      ttsSuportado: 'speechSynthesis' in window,
    }
  }

  static iniciarStt(config: ConfiguracaoVozDTO, callbacks: IniciarSttCallbacks = {}): SessaoStt | null {
    const ctor = getSpeechRecognitionCtor()
    if (!ctor) {
      callbacks.onErro?.('Speech-to-Text não suportado no browser atual.')
      return null
    }

    const recognition = new ctor()
    recognition.lang = config.sttIdioma || config.idiomaPadrao || 'pt-PT'
    recognition.interimResults = !!config.sttInterimResults
    recognition.continuous = !!config.sttContinuous
    recognition.maxAlternatives = config.sttMaxAlternatives && config.sttMaxAlternatives > 0 ? config.sttMaxAlternatives : 1

    let textoFinal = ''
    let silenceTimer: number | null = null
    const silenceTimeoutMs = config.sttSilenceTimeoutMs && config.sttSilenceTimeoutMs > 0 ? config.sttSilenceTimeoutMs : 2500
    const rearmSilenceTimer = () => {
      if (silenceTimer) window.clearTimeout(silenceTimer)
      silenceTimer = window.setTimeout(() => recognition.stop(), silenceTimeoutMs)
    }

    recognition.onresult = (event: any) => {
      rearmSilenceTimer()
      let textoParcial = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultado = event.results[i]
        const transcricao = resultado?.[0]?.transcript ?? ''
        if (resultado.isFinal) {
          textoFinal += `${transcricao} `
        } else {
          textoParcial += transcricao
        }
      }

      const consolidado = `${textoFinal}${textoParcial}`.trim()
      callbacks.onTextoParcial?.(consolidado)
      callbacks.onTextoFinal?.(textoFinal.trim())
    }

    recognition.onerror = (event: any) => {
      if (silenceTimer) window.clearTimeout(silenceTimer)
      callbacks.onErro?.(event?.error ?? 'Erro desconhecido no Speech-to-Text.')
    }

    recognition.onend = () => {
      if (silenceTimer) window.clearTimeout(silenceTimer)
      callbacks.onFim?.()
    }

    rearmSilenceTimer()
    recognition.start()

    return {
      parar: () => recognition.stop(),
      abortar: () => recognition.abort(),
    }
  }

  static obterVozes(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return []
    return window.speechSynthesis.getVoices()
  }

  static listarVozesBrowser(idiomaPadrao?: string | null): VozBrowserOpcao[] {
    const voices = this.obterVozes()
    const idiomaNorm = this.normalizarLang(idiomaPadrao)
    const candidatas = idiomaNorm
      ? voices.filter((v) => this.normalizarLang(v.lang) === idiomaNorm || this.mesmoIdiomaBase(v.lang, idiomaNorm))
      : voices

    return candidatas.map((v) => ({
      codigo: v.voiceURI || v.name,
      descricao: `${v.name} (${v.lang})`,
      idioma: v.lang || '',
    }))
  }

  static falar(texto: string, config: ConfiguracaoVozDTO): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !texto?.trim()) return false
    if (!config.ttsAtivo) return false

    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = config.idiomaPadrao || 'pt-PT'
    utterance.rate = Number.isFinite(config.ttsRate) ? config.ttsRate : 1
    utterance.pitch = Number.isFinite(config.ttsPitch) ? config.ttsPitch : 1
    utterance.volume = Number.isFinite(config.ttsVolume) ? config.ttsVolume : 1

    const voices = this.obterVozes()
    const vozConfigurada = (config.ttsVoice || '').trim()
    if (vozConfigurada) {
      let voz = this.escolherVoz(voices, vozConfigurada)
      if (voz && config.idiomaPadrao && !this.mesmoIdiomaBase(voz.lang, config.idiomaPadrao)) {
        // Se a voz selecionada não for compatível com o idioma configurado, preferimos o idioma.
        voz = this.escolherPrimeiraPorIdioma(voices, config.idiomaPadrao)
      }
      if (voz) {
        utterance.voice = voz
        utterance.lang = voz.lang || utterance.lang
      }
    } else {
      const vozPorIdioma = this.escolherPrimeiraPorIdioma(voices, config.idiomaPadrao || '')
      if (vozPorIdioma) {
        utterance.voice = vozPorIdioma
        utterance.lang = vozPorIdioma.lang || utterance.lang
      }
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    return true
  }

  static pararFala(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
  }
}
