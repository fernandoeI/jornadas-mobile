import { useMutation, useQueryClient } from "@tanstack/react-query";
import { precheckCurp } from "@/src/services/economia-social";
import { useSifToken } from "./useSifToken";

interface CurpPrecheckResponse {
  success: boolean;
  code?: string;
  message?: string;
  existing_record?: {
    id?: number;
    folio?: string;
    nombre?: string;
    [key: string]: any;
  };
  exists?: boolean;
  registered?: boolean;
  errors?: {
    curp?: string[];
  };
}

/**
 * Hook para validar si una CURP está registrada en el sistema de tandas
 */
export const usePrecheckCurp = () => {
  const queryClient = useQueryClient();
  const { data: token } = useSifToken();

  return useMutation({
    mutationFn: async (curp: string): Promise<CurpPrecheckResponse> => {
      if (!token) {
        throw new Error("Token SIF no disponible. Por favor espera un momento e intenta nuevamente.");
      }
      return precheckCurp(token, curp);
    },
    onError: (error: any) => {
      if (error?.code === "SIF_UNAUTHORIZED" || error?.status === 401) {
        queryClient.invalidateQueries({ queryKey: ["tandas", "sif-token"] });
      }
    },
  });
};

