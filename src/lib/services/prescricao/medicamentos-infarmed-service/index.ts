import { MedicamentosInfarmedClient } from "./medicamentos-infarmed-client"

export const MedicamentosInfarmedService = (idFuncionalidade = '' ) => 
    new MedicamentosInfarmedClient(idFuncionalidade)

export * from './medicamentos-infarmed-client'
