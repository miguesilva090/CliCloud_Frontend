import { useMutation } from "@tanstack/react-query";
import { LoteDirectService } from "@/lib/services/credenciais/lote-direct-service";
import type {
    PassarParaAtivoRequest,
    PassarParaAtivoResultDTO,
} from "@/types/dtos/credenciais/lote-direct.dtos";
import { useLoteDirectFuncionalidadeId } from "./listagem-lote-direct-queries";
import type { ResponseApi } from "@/types/responses";
import type { GSResponse } from "@/types/api/responses";

export const usePassarLoteDirectParaAtivo = () => {
    const permId = useLoteDirectFuncionalidadeId()
    return useMutation<ResponseApi<GSResponse<PassarParaAtivoResultDTO>>, Error, PassarParaAtivoRequest>({
        mutationFn: (payload: PassarParaAtivoRequest) => 
            LoteDirectService(permId).passarParaAtivo(payload),
    })
}