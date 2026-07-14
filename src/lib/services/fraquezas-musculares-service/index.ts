import { FraquezasMuscularesClient } from './fraquezas-musculares-client'

export const FraquezasMuscularesService = (idFuncionalidade = '') =>
    new FraquezasMuscularesClient(idFuncionalidade)
export * from './fraquezas-musculares-errors'
export * from './fraquezas-musculares-client'
