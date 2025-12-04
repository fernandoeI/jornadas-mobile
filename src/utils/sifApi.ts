import { Platform } from "react-native";

/**
 * Helper para detectar si estamos en desarrollo web
 */
export const isWebDevelopment = () => {
  return Platform.OS === "web" && __DEV__;
};

/**
 * Helper para hacer peticiones al SIF con mejor manejo de errores CORS
 */
export const sifFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error: any) {
    // Detectar errores de CORS específicamente
    // Los errores de CORS suelen ser TypeError con "Failed to fetch"
    const isNetworkError =
      error?.name === "TypeError" &&
      (error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError") ||
        error?.message?.includes("Network request failed"));

    const isCorsBlocked =
      error?.message?.includes("CORS") ||
      error?.message?.includes("cors") ||
      error?.message?.includes("Access-Control-Allow-Origin");

    if ((isNetworkError || isCorsBlocked) && isWebDevelopment()) {
      const corsError = new Error(
        `Error de CORS: No se puede conectar al servidor SIF desde el navegador web.\n\n` +
          `Este error solo ocurre en desarrollo web debido a las restricciones CORS del navegador.\n\n` +
          `Soluciones:\n` +
          `1. Usa un dispositivo real o emulador (iOS/Android) para probar la funcionalidad completa.\n` +
          `2. El servidor SIF no permite peticiones CORS desde localhost por seguridad.\n\n` +
          `Nota: En dispositivos reales o emuladores, las peticiones funcionan sin problemas.`
      );
      (corsError as any).isCorsError = true;
      (corsError as any).isWebDevelopment = true;
      throw corsError;
    }

    // Re-lanzar otros errores
    throw error;
  }
};

/**
 * Verifica si un error es un error de CORS
 */
export const isCorsError = (error: any): boolean => {
  return (
    error?.isCorsError === true ||
    error?.message?.includes("CORS") ||
    error?.message?.includes("Access-Control-Allow-Origin") ||
    (error?.name === "TypeError" &&
      error?.message?.includes("Failed to fetch") &&
      isWebDevelopment())
  );
};
