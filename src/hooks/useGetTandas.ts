import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTandas } from "@/src/services/tandas";
import { useSifToken } from "./useSifToken";

/**
 * Hook para obtener la lista de tandas
 * Usa el token SIF cacheado y maneja la invalidación del cache en caso de error 401
 */
export const useGetTandas = () => {
  const queryClient = useQueryClient();
  const { data: token, isError: isTokenError } = useSifToken();

  return useQuery({
    queryKey: ["tandas", "list"],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token SIF no disponible");
      }
      return getTandas(token);
    },
    enabled: !!token && !isTokenError,
    retry: (failureCount, error: any) => {
      // Si es error 401, no reintentar (el token se invalidará automáticamente)
      if (error?.code === "SIF_UNAUTHORIZED" || error?.status === 401) {
        queryClient.invalidateQueries({ queryKey: ["tandas", "sif-token"] });
        return false;
      }
      // Reintentar hasta 1 vez para otros errores
      return failureCount < 1;
    },
  });
};

