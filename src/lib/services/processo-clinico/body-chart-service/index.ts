import { MapaBodyChartClient } from './mapa-body-chart-client'
import { NotasBodyChartClient } from './notas-body-chart-client'

export const MapaBodyChartService = (idFuncionalidade = '') =>
  new MapaBodyChartClient(idFuncionalidade)

export const NotasBodyChartService = (idFuncionalidade = '') =>
  new NotasBodyChartClient(idFuncionalidade)

