import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTanda2Request } from "@/src/services/economia-social";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { useSifToken } from "./useSifToken";

/**
 * Hook para crear una nueva solicitud de Tanda2
 * Guarda tanto en Appwrite como en el endpoint del SIF
 */
export const useCreateTanda2Request = () => {
  const queryClient = useQueryClient();
  const { data: token } = useSifToken();

  return useMutation({
    mutationFn: async (data: EconomiaSocialFormData) => {
      if (!token) {
        throw new Error("Token SIF no disponible. Por favor espera un momento e intenta nuevamente.");
      }
      return createTanda2Request(token, data);
    },
    onError: (error: any) => {
      if (error?.code === "SIF_UNAUTHORIZED" || error?.status === 401) {
        queryClient.invalidateQueries({ queryKey: ["tandas", "sif-token"] });
      }
    },
  });
};

