import { FraquezasMuscularesClient } from './fraquezas-musculares-client'

export const FraquezasMuscularesService = (idFuncionalidade = '') =>
    new FraquezasMuscularesClient(idFuncionalidade)