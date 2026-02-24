import { listTanda2Requests } from "@/src/services/economia-social";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSifToken } from "./useSifToken";

interface Tanda2RequestListItem {
  id: number;
  folio: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  estatus: string;
  created_at: string;
  [key: string]: any;
}

/**
 * Hook para obtener la lista de solicitudes de Tanda2 registradas
 */
export const useListTanda2Requests = () => {
  const queryClient = useQueryClient();
  const {
    data: token,
    isError: isTokenError,
    isLoading: isTokenLoading,
  } = useSifToken();

  return useQuery({
    queryKey: ["tanda2-requests"],
    queryFn: async (): Promise<Tanda2RequestListItem[]> => {
      // Obtener el token directamente del cache para asegurar que siempre tengamos el más reciente
      const cachedToken = queryClient.getQueryData<string>([
        "tandas",
        "sif-token",
      ]);
      const currentToken = cachedToken || token;

      if (
        !currentToken ||
        typeof currentToken !== "string" ||
        currentToken.trim().length === 0
      ) {
        throw new Error("Token SIF no disponible");
      }

      return listTanda2Requests(currentToken);
    },
    // Solo ejecutar cuando el token esté disponible y no haya errores
    enabled:
      !!token && !isTokenError && !isTokenLoading && typeof token === "string",
    retry: (failureCount, error: any) => {
      // Si es error 401, podría ser un problema de permisos del endpoint
      // No invalidar el token automáticamente ya que funciona para otras operaciones
      // Solo no reintentar
      if (error?.code === "SIF_UNAUTHORIZED" || error?.status === 401) {
        // Si el token funciona para crear pero no para listar,
        // podría ser un problema de permisos del endpoint, no del token
        // No invalidar el token, solo no reintentar
        return false;
      }
      // Para otros errores, reintentar hasta 1 vez
      return failureCount < 1;
    },
  });
};
