import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTanda } from "@/src/services/tandas";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { useSifToken } from "./useSifToken";

/**
 * Hook para crear una nueva tanda
 * Usa el token SIF cacheado y maneja la invalidación del cache en caso de error 401
 */
export const useCreateTanda = () => {
  const queryClient = useQueryClient();
  const { data: token } = useSifToken();

  return useMutation({
    mutationFn: async (data: EconomiaSocialFormData) => {
      if (!token) {
        throw new Error("Token SIF no disponible. Por favor espera un momento e intenta nuevamente.");
      }
      return createTanda(token, data);
    },
    onError: (error: any) => {
      // Si el error es 401 (no autorizado), invalidar el token para que se regenere
      if (error?.code === "SIF_UNAUTHORIZED" || error?.status === 401) {
        queryClient.invalidateQueries({ queryKey: ["tandas", "sif-token"] });
      }
    },
  });
};

