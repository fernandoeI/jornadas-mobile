import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocalidades } from "@/src/services/economia-social";
import { useSifToken } from "./useSifToken";

interface Localidad {
  id: number;
  nombre: string;
  municipio_id?: number;
  [key: string]: any;
}

/**
 * Hook para obtener las localidades de un municipio específico
 */
export const useGetLocalidades = (municipioId: number | null) => {
  const queryClient = useQueryClient();
  const { data: token, isError: isTokenError } = useSifToken();

  return useQuery({
    queryKey: ["tandas", "localidades", municipioId],
    queryFn: async (): Promise<Localidad[]> => {
      if (!token) {
        throw new Error("Token SIF no disponible");
      }
      if (!municipioId) {
        return [];
      }
      return getLocalidades(token, municipioId);
    },
    enabled: !!token && !isTokenError && !!municipioId,
    retry: (failureCount, error: any) => {
      if (error?.code === "SIF_UNAUTHORIZED" || error?.status === 401) {
        queryClient.invalidateQueries({ queryKey: ["tandas", "sif-token"] });
        return false;
      }
      return failureCount < 1;
    },
  });
};

