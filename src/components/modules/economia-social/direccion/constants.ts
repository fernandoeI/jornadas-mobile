import type { TriggerRef } from "@rn-primitives/select";

export const PHONE_LENGTH = 10;
export const POSTAL_CODE_LENGTH = 5;

export const ERROR_MESSAGES = {
  PHONE_REQUIRED:
    "Por favor, ingresa un número de teléfono válido (10 dígitos).",
  PHONE_REGISTERED:
    "Este número de teléfono ya está registrado en el sistema. Por favor verifica los datos.",
  PHONE_VERIFICATION_FAILED:
    "No se pudo verificar el número de teléfono. Por favor intenta de nuevo.",
  PHONE_VALIDATION_FAILED:
    "No se pudo validar el número de teléfono. Por favor intenta de nuevo.",
  CONNECTION_ERROR:
    "No hay conexión a internet. Puedes continuar llenando el formulario.",
  LOCALIDADES_LOAD_ERROR:
    "No se pudieron cargar las localidades. Por favor, intenta de nuevo.",
} as const;

export const formatErrorMessage = (message: string): string => {
  if (!message) return message;
  return message.charAt(0).toUpperCase() + message.slice(1).toLowerCase();
};

export const isPhoneValid = (phone: string | undefined): boolean => {
  return !!phone && phone.length === PHONE_LENGTH;
};

export const isPhoneRegistered = (response: any): boolean => {
  return (
    response.success === false ||
    (response.code && response.code !== "not_found_local") ||
    response.exists === true ||
    response.registered === true
  );
};

export const extractErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    ERROR_MESSAGES.PHONE_VALIDATION_FAILED
  );
};

export const isConnectionError = (errorMessage: string): boolean => {
  const lowerMessage = errorMessage.toLowerCase();
  return (
    lowerMessage.includes("network") ||
    lowerMessage.includes("conexión") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("failed to fetch") ||
    lowerMessage.includes("cors")
  );
};

export const openSelect = (ref: React.RefObject<TriggerRef | null>): void => {
  if (ref.current && "open" in ref.current) {
    (ref.current as any).open();
  }
};
