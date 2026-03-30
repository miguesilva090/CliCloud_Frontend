/**
 * Estilos padrão de formulários para todo o projeto.
 * Usar em TODOS os formulários: mesmo tamanho de campos, mesmo espaço entre
 * label e caixa de texto, mesma altura de inputs/selects.
 *
 * Import: import { fieldGap, labelClass, inputClass, ... } from '@/lib/form-styles'
 */

/** Espaço entre label, controlo e mensagem de erro (ex.: FormItem) */
export const fieldGap = 'space-y-1.5'

/** Classe das labels (FormLabel) */
export const labelClass = 'text-xs font-medium'

/** Classe dos inputs (Input) – altura e largura consistentes */
export const inputClass = 'h-7 w-full min-w-0 text-sm'

/** Classe dos triggers de Select */
export const selectTriggerClass = 'h-7 w-full min-w-0 text-sm'

/** Classe dos botões ícone junto a campos (ex.: + para abrir modal) */
export const buttonIconClass = 'shrink-0 h-7 w-7'

/** Classe para Textarea – mesma altura de linha visual que inputs quando uma linha */
export const textareaClass = 'min-h-7 w-full min-w-0 text-sm resize-y'

/** Espaçamento vertical entre blocos de campos (ex.: entre secções ou linhas de grid) */
export const formBlockGap = 'gap-4'
