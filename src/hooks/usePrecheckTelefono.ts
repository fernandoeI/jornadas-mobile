import { useMutation, useQueryClient } from "@tanstack/react-query";
import { precheckTelefono } from "@/src/services/economia-social";
import { useSifToken } from "./useSifToken";

interface TelefonoPrecheckResponse {
  success: boolean;
  code?: string;
  message?: string;
  exists?: boolean;
  registered?: boolean;
  errors?: {
    num_celular1?: string[];
  };
}

/**
 * Hook para validar si un número de teléfono está registrado
 */
export const usePrecheckTelefono = () => {
  const queryClient = useQueryClient();
  const { data: token } = useSifToken();

  return useMutation({
    mutationFn: async (telefono: string): Promise<TelefonoPrecheckResponse> => {
      if (!token) {
        throw new Error("Token SIF no disponible. Por favor espera un momento e intenta nuevamente.");
      }
      return precheckTelefono(token, telefono);
    },
    onError: (error: any) => {
      if (error?.code === "SIF_UNAUTHORIZED" || error?.status === 401) {
        queryClient.invalidateQueries({ queryKey: ["tandas", "sif-token"] });
      }
    },
  });
};

