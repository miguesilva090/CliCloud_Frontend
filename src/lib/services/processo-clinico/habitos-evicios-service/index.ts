import { HabitosEViciosClient } from './habitos-evicios-client'

export const HabitosEViciosService = (idFuncionalidade = '') =>
    new HabitosEViciosClient(idFuncionalidade)
export * from './habitos-evicios-errors'
export * from './habitos-evicios-client'
