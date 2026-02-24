import { Platform } from "react-native";

const SIF_BASE_URL = "https://sif.tabasco.gob.mx/usuario/api/tandas2";

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
 * Wrapper centralizado para hacer peticiones al SIF
 * Inyecta automáticamente el token de autorización
 * @param token - Token de acceso SIF
 * @param endpoint - Endpoint relativo (ej: "/list_tanda2_requests/") o URL completa
 * @param options - Opciones de fetch adicionales
 * @returns Promise con la respuesta parseada como JSON
 * @throws Error con código "SIF_UNAUTHORIZED" si status === 401
 */
export const sifRequest = async <T = any>(
  token: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Construir URL completa
  const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${SIF_BASE_URL}${endpointPath}`;

  // Preparar headers con el token
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await sifFetch(url, {
      ...options,
      headers,
    });

    // Si el token expiró (401), lanzar error especial
    // Pero primero verificar si realmente es un error de autenticación
    if (response.status === 401) {
      // Intentar leer el cuerpo de la respuesta para más información
      let errorBody: any = {};
      try {
        const text = await response.clone().text();
        if (text) {
          errorBody = JSON.parse(text);
        }
      } catch {
        // Si no se puede parsear, continuar
      }

      const error = new Error("SIF_UNAUTHORIZED");
      (error as any).code = "SIF_UNAUTHORIZED";
      (error as any).status = 401;
      (error as any).responseBody = errorBody;
      throw error;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message ||
          errorData.detail ||
          `Error en la petición (${response.status}): ${response.statusText || "Error desconocido"}`
      );
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    // Si es un error de CORS, re-lanzar con el mensaje mejorado
    if (isCorsError(error)) {
      throw error;
    }

    // Re-lanzar otros errores
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido en la petición al SIF");
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
