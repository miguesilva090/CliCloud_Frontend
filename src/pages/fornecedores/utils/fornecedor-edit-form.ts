import { z } from 'zod'

import type { FornecedorEditFormValues } from '../fornecedor-edit-form-types'

export const fornecedorEditSchema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().optional(),
    numeroContribuinte: z.string().min(1, 'NIF é obrigatório'),
    observacoes: z.string().optional(),
    status: z.coerce.number().int().min(0).max(3),
    telefone: z.string().optional(),
    paisId: z.string().min(1, 'País é obrigatório'),
    distritoId: z.string().min(1, 'Distrito é obrigatório'),
    concelhoId: z.string().min(1, 'Concelho é obrigatório'),
    freguesiaId: z.string().min(1, 'Freguesia é obrigatória'),
    codigoPostalId: z.string().min(1, 'Código Postal é obrigatório'),
    rua: z.string().optional(),
    ruaId: z.string().optional(),
    numeroPorta: z.string().min(1, 'N.º Porta é obrigatório'),
    andarRua: z.string().min(1, 'Andar é obrigatório'),
  })
  .refine(
    (data) =>
      !data.email ||
      data.email.trim() === '' ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()),
    { message: 'Email inválido', path: ['email'] },
  )
  .refine((data) => data.rua?.trim() || data.ruaId?.trim(), {
    message: 'Rua é obrigatória',
    path: ['rua'],
  })
  .passthrough()

export const fornecedorEditDefaultValues: FornecedorEditFormValues = {
  nome: '',
  email: '',
  numeroContribuinte: '',
  observacoes: '',
  status: 0,
  telefone: '',
  paisId: '',
  distritoId: '',
  concelhoId: '',
  freguesiaId: '',
  codigoPostalId: '',
  rua: '',
  ruaId: '',
  numeroPorta: '',
  andarRua: '',
  numeroConta: '',
  plafond: '',
  desconto: '',
  condicaoPagamento: '',
  moeda: '',
  numeroNib: '',
  enderecoWeb: '',
  diasPrevEntrega: '',
  diasEfectiEntrega: '',
  origem: '',
}

