import { LicenseGuard } from '@/components/auth/license-guard'
import { areaComum } from '@/config/modules/common/area-comum-module'
import { actionTypes } from '@/config/modules'
import { useParams } from 'react-router-dom'
import { ClinicaEditPage } from './clinica-edit-page'

/** Nova clínica usa AuthAdd; edição usa AuthChg. */
export function ClinicaEditLicenseGate() {
  const { id } = useParams<{ id: string }>()
  const isCreate = id === 'novo'

  return (
    <LicenseGuard
      requiredModule={areaComum.id}
      requiredPermission={areaComum?.permissions?.configuracoesClinica?.id}
      actionType={isCreate ? actionTypes.AuthAdd : actionTypes.AuthChg}
      requireExplicitPermission={isCreate}
    >
      <ClinicaEditPage />
    </LicenseGuard>
  )
}
