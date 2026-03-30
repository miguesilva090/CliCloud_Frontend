import { utilitarios } from './base/utilitarios-module'
import { reports } from './reports/reports-module'
import { areaClinica } from './clinical/area-clinica-module'
import { areaComum } from './common/area-comum-module'
import { Modules } from './types'

export const actionTypes = {
  AuthVer: 'AuthVer',
  AuthAdd: 'AuthAdd',
  AuthEdit: 'AuthEdit',
  AuthDel: 'AuthDel',
  AuthChg: 'AuthChg',
} as const

export const modules: Modules = {
  utilitarios,
  reports,
  areaClinica,
  areaComum,
}
