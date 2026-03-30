import { HabitosEViciosClient } from './habitos-evicios-client'

export const HabitosEViciosService = (idFuncionalidade = '') =>
    new HabitosEViciosClient(idFuncionalidade)
