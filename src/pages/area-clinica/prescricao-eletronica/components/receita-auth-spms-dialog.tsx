import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog, 
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConfigWebServiceService } from "@/lib/services/core/config-webservice-service"
import { ResponseStatus } from "@/types/api/responses"
import { toast } from "@/utils/toast-utils"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void 
    medicoId: string
    onAuthenticated: (token: string) => void
}

export function ReceitaAuthSpmsDialog({
    open,
    onOpenChange,
    medicoId,
    onAuthenticated,
}: Props) {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        const pwd = password.trim()
        if (!pwd) {
            toast.error("Introduza a password do prescritor.", "Autenticação")
            return
        }
        if (!medicoId) {
            toast.error("Médico atual em falta", "Autenticação")
            return
        }

        setLoading(true)
        try 
        {
            const res = await ConfigWebServiceService().testarTokenCred({
                medicoId,
                passwordPrvr: pwd,
            })
            const info = res.info
            if (info?.status !== ResponseStatus.Success || !info.data?.token?.trim()) {
                const msg = 
                    info?.messages?.['$']?.[0] ||
                    Object.values(info?.messages || {})?.[0]?.[0] ||
                    info?.data?.descricao ||
                    "Falha na autenticação SPMS"
                toast.error(msg, "Autenticação")
                return
            }
            const token = info.data.token.trim()
            setPassword('')
            onOpenChange(false)
            onAuthenticated(token)
        } catch (err: unknown) {
            toast.error(
                err instanceof Error ? err.message : "Erro ao autenticar",
                "Autenticação"
            )
        } finally {
            setLoading(false)
        }
    }

    return ( 
        <Dialog 
            open={open}
            onOpenChange={(v) => {
                if (!loading) onOpenChange(v)
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Autenticação SPMS</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label htmlFor="auth-prvr-pwd">Password</Label>
                    <Input 
                        id="auth-prvr-pwd"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        disabled={loading}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                void handleConfirm()
                            }
                        }}
                    />
                </div>
                <DialogFooter>
                    <Button 
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button type="button" disabled={loading} onClick={() => void handleConfirm()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ok"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}