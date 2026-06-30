import type { QueryClient } from "@tanstack/react-query";
import { invalidateAdmissoesListQueries } from "@/pages/area-administrativa/consultas/admissoes/queries/listagem-admissoes-queries"

export function invalidateAdmissaoFaturacaoQueries(queryClient: QueryClient) : void {
    invalidateAdmissoesListQueries(queryClient);
    void queryClient.invalidateQueries({
        queryKey: ['historico-consultas-administrativo-paginated'],
    })
}