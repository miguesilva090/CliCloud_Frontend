import { useCallback } from 'react'
import type { FieldErrors } from 'react-hook-form'
import { toast } from '@/utils/toast-utils'

/** Valor da tab (igual ao usado em TabsTrigger / TabsContent value). */
type TabValue = string

interface UseFormValidationFeedbackOptions {
  /** Título do toast de validação */
  toastTitle?: string
  /** Para forms com tabs: função para mudar a tab ativa. */
  setActiveTab?: (tab: TabValue) => void
  /**
   * Opcional: mapeamento campo -> tab. Se não for passado, o hook tenta construir a partir do DOM:
   * procura elementos [data-tab] com atributo data-fields="campo1,campo2,..." (ver TabsContent).
   */
  fieldToTabMap?: Record<string, TabValue>
  /** Ordem das tabs. Se não for passado e usarmos o DOM, a ordem é a dos [data-tab] no documento. */
  tabOrder?: TabValue[]
}

/** Constrói fieldToTabMap e tabOrder a partir de [data-tab] com data-fields no documento. */
function buildFieldToTabFromDOM(): { fieldToTabMap: Record<string, TabValue>; tabOrder: TabValue[] } {
  const fieldToTabMap: Record<string, TabValue> = {}
  const tabOrder: TabValue[] = []
  const panels = document.querySelectorAll<HTMLElement>('[data-tab][data-fields]')
  panels.forEach((el) => {
    const tab = el.getAttribute('data-tab')
    const fields = el.getAttribute('data-fields')
    if (!tab || !fields) return
    if (!tabOrder.includes(tab)) tabOrder.push(tab)
    fields.split(',').forEach((f) => {
      const name = f.trim()
      if (name) fieldToTabMap[name] = tab
    })
  })
  return { fieldToTabMap, tabOrder }
}

function rootFieldFromPath(path: string): string {
  return path.split('.')[0] ?? path
}

function flattenErrorPaths(errors: Record<string, unknown>, prefix = ''): string[] {
  const paths: string[] = []
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && 'message' in value && typeof (value as { message: string }).message === 'string') {
      paths.push(path)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      paths.push(...flattenErrorPaths(value as Record<string, unknown>, path))
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (item && typeof item === 'object') {
          paths.push(...flattenErrorPaths(item as Record<string, unknown>, `${path}.${i}`))
        }
      })
    }
  }
  return paths
}

export function useFormValidationFeedback<TFieldValues extends Record<string, any> = Record<string, any>>({
  toastTitle = 'Validação',
  setActiveTab,
  fieldToTabMap,
  tabOrder,
}: UseFormValidationFeedbackOptions = {}) {
  const onInvalid = useCallback(
    (errors: FieldErrors<TFieldValues>) => {
      if (!errors || Object.keys(errors).length === 0) return

      toast.error('Preencha os campos indicados e tente novamente', toastTitle)

      // 1) Escolher tab a partir do objeto de erros: usa fieldToTabMap/tabOrder se forem passados, senão constrói do DOM (TabsContent com data-fields)
      if (setActiveTab) {
        const { fieldToTabMap: map, tabOrder: order } =
          fieldToTabMap && Object.keys(fieldToTabMap).length > 0
            ? { fieldToTabMap, tabOrder: tabOrder ?? [...new Set(Object.values(fieldToTabMap))] }
            : buildFieldToTabFromDOM()

        if (Object.keys(map).length > 0) {
          const paths = flattenErrorPaths(errors as Record<string, unknown>)
          const tabsWithErrors = new Set<TabValue>()
          for (const path of paths) {
            const root = rootFieldFromPath(path)
            const tab = map[root]
            if (tab) tabsWithErrors.add(tab)
          }
          for (const tab of order) {
            if (tabsWithErrors.has(tab)) {
              setActiveTab(tab)
              break
            }
          }
        }
      }

      // 2) Scroll ao primeiro campo inválido; só faz focus se o utilizador não estiver já a escrever noutro campo (evita roubar foco ao primeiro carácter)
      const delay = 250
      setTimeout(() => {
        const invalidElements = Array.from(
          document.querySelectorAll<HTMLElement>('[aria-invalid="true"]')
        )
        if (invalidElements.length === 0) return
        const target = invalidElements[0]
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const active = document.activeElement
        const userIsTyping =
          active &&
          (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')
        if (!userIsTyping && typeof target?.focus === 'function') target.focus()
      }, delay)
    },
    [toastTitle, setActiveTab, fieldToTabMap, tabOrder]
  )

  return { onInvalid }
}
