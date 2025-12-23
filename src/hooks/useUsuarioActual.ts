import { useQuery } from "@tanstack/react-query";
import { usuariosService } from "../api/services/usuarios";
import { useAuth } from "./useAuth";

export function useUsuarioActual(){
    const { user } = useAuth()

    return useQuery({
        queryKey: ['currentUser', user?.uid],
        queryFn: usuariosService.obtenerUsuarioActual, 
        enabled: !!user?.uid, // Only fetch if we have a user (and specifically a uid/sub)
        retry: 1 
    })
}
