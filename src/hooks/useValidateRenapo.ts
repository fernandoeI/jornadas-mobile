import { useMutation, useQueryClient } from "@tanstack/react-query";
import { validateRenapo } from "@/src/services/economia-social";
import { useSifToken } from "./useSifToken";

interface RenapoValidationResponse {
  success: boolean;
  message: string;
  data: {
    codigo: string;
    mensaje: string;
    datos: {
      CURP?: string;
      apellido1?: string;
      apellido2?: string;
      nombres?: string;
      fechNac?: string;
      cveEntidadNac?: string;
      numEntidadReg?: string;
      cveMunicipioReg?: string;
      sexo?: string;
      nacionalidad?: string;
      docProbatorio?: string;
      anioReg?: string;
      numActa?: string;
      [key: string]: any;
    };
  };
}

/**
 * Hook para validar una CURP con RENAPO y CURP Tabasco
 */
export const useValidateRenapo = () => {
  const queryClient = useQueryClient();
  const { data: token } = useSifToken();

  return useMutation({
    mutationFn: async (curp: string): Promise<RenapoValidationResponse> => {
      if (!token) {
        throw new Error("Token SIF no disponible. Por favor espera un momento e intenta nuevamente.");
      }
      return validateRenapo(token, curp);
    },
    onError: (error: any) => {
      if (error?.code === "SIF_UNAUTHORIZED" || error?.status === 401) {
        queryClient.invalidateQueries({ queryKey: ["tandas", "sif-token"] });
      }
    },
  });
};

