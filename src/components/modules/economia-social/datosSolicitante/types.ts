import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import type { TriggerRef } from "@rn-primitives/select";
import type { Control, FieldErrors } from "react-hook-form";

export interface ContentInsets {
  top: number;
  bottom: number | undefined;
  left: number;
  right: number;
}

export interface IDatosSolicitante {
  control: Control<EconomiaSocialFormData, any, any>;
  errors: FieldErrors<EconomiaSocialFormData>;
  values: EconomiaSocialFormData;
  setValue: (
    name: keyof EconomiaSocialFormData,
    value: any,
    options?: {
      shouldValidate?: boolean;
      shouldDirty?: boolean;
      shouldTouch?: boolean;
    }
  ) => void;
  trigger?: (
    name?: keyof EconomiaSocialFormData | (keyof EconomiaSocialFormData)[]
  ) => Promise<boolean>;
  estadoCivilRef: React.RefObject<TriggerRef | null>;
  entidadNacimientoRef: React.RefObject<TriggerRef | null>;
  contentInsets: ContentInsets;
  onCancel: () => void;
  onNext: () => void;
  showButtons?: boolean;
}

export interface UseDatosSolicitanteProps {
  values: EconomiaSocialFormData;
  errors: FieldErrors<EconomiaSocialFormData>;
  setValue: (
    name: keyof EconomiaSocialFormData,
    value: any,
    options?: {
      shouldValidate?: boolean;
      shouldDirty?: boolean;
      shouldTouch?: boolean;
    }
  ) => void;
  trigger?: (
    name?: keyof EconomiaSocialFormData | (keyof EconomiaSocialFormData)[]
  ) => Promise<boolean>;
}

export const ERROR_MESSAGES = {
  CURP_REQUIRED: "Por favor ingresa una CURP válida de 18 caracteres",
  CURP_ALREADY_REGISTERED:
    "Esta CURP ya está registrada en el sistema. Por favor verifica los datos.",
  CURP_PRECHECK_FAILED: "No se pudo verificar si la CURP está registrada.",
  NO_SERVER_RESPONSE: "No se recibió respuesta del servidor",
  CURP_VALIDATION_FAILED: "No se pudo validar la CURP",
  CONNECTION_ERROR:
    "No hay conexión a internet. Puedes continuar llenando el formulario manualmente.",
} as const;
