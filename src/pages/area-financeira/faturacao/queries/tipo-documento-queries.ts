import { useQuery } from '@tanstack/react-query'
import { TipoDocumentoService } from '@/lib/services/faturacao/tipo-documento-service'

export const tipoDocumentoQueryKeys = {
    light: (keyword: string) => ['tipos-documento', 'light', keyword] as const,
}

export function useGetTiposDocumentoLight(
    keyword: string,
    idFuncionalidade = '',
) {
    return useQuery({
        queryKey: tipoDocumentoQueryKeys.light(keyword),
        queryFn: () => TipoDocumentoService(idFuncionalidade).getTiposDocumentoLight(keyword),
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    })
}