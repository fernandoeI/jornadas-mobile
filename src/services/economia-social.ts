import { convertDateToYYYYMMDD } from "@/src/components/common/dateHelpers";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { isCorsError, sifFetch } from "@/src/utils/sifApi";
import { ID } from "react-native-appwrite";
import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
} from "./appwrite";
import { getValidSifAccessToken, refreshSifToken } from "./auth";

const SIF_BASE_URL = "https://sif.tabasco.gob.mx/usuario/api/tandas2";
const SIF_ADMIN_BASE_URL =
  "https://sif.tabasco.gob.mx/admin/solicitudes/tandas";

interface SIFApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

interface CurpPrecheckResponse {
  success: boolean;
  code?: string; // "exists_tanda2" cuando ya existe un registro
  message?: string;
  existing_record?: {
    id?: number;
    folio?: string;
    nombre?: string;
    [key: string]: any;
  };
  exists?: boolean; // Mantener por compatibilidad
  registered?: boolean; // Mantener por compatibilidad
  errors?: {
    curp?: string[];
  };
}

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
      fechNac?: string; // Fecha en formato DD/MM/YYYY
      cveEntidadNac?: string; // Código de 2 letras (ej: "TC" para Tabasco)
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

interface TelefonoPrecheckResponse {
  success: boolean;
  code?: string; // "not_found_local" cuando no existe, otro código cuando existe
  message?: string;
  exists?: boolean; // Mantener por compatibilidad
  registered?: boolean; // Mantener por compatibilidad
  errors?: {
    num_celular1?: string[];
  };
}

interface Tanda2RequestListItem {
  id: number;
  folio: string;
  nombre: string;
  apellido1: string;
  apellido2?: string;
  estatus: string;
  created_at: string;
  [key: string]: any;
}

interface Localidad {
  id: number;
  nombre: string;
  municipio_id?: number;
  [key: string]: any;
}

const getAuthHeaders = async (): Promise<HeadersInit> => {
  // Usar getValidSifAccessToken para obtener un token válido (refresca si es necesario)
  const token = await getValidSifAccessToken();
  if (!token) {
    throw new Error("No se encontró token de autenticación del SIF");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const sifRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  retryOn401 = true
): Promise<T> => {
  try {
    const headers = await getAuthHeaders();
    // Asegurar que el endpoint tenga la barra inicial
    const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${SIF_BASE_URL}${endpointPath}`;

    const response = await sifFetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Si el token expiró (401) y aún no hemos intentado refrescar, hacerlo y reintentar
    if (!response.ok && response.status === 401 && retryOn401) {
      console.log("Token expirado, intentando refrescar...");
      const newToken = await refreshSifToken();

      if (newToken) {
        // Reintentar la petición con el nuevo token (solo una vez)
        return sifRequest<T>(endpoint, options, false);
      } else {
        throw new Error(
          "No se pudo refrescar el token. Por favor inicia sesión nuevamente."
        );
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Log detallado del error para debugging
      console.error("❌ Error en petición SIF:", {
        status: response.status,
        statusText: response.statusText,
        endpoint: url,
        errorData,
      });

      // Extraer mensajes de error más descriptivos
      let errorMessage = errorData.message || errorData.detail;

      // Si hay errores de validación, formatearlos
      if (errorData.errors || errorData.error) {
        const validationErrors = errorData.errors || errorData.error;

        // Si es un objeto con errores por campo
        if (
          typeof validationErrors === "object" &&
          !Array.isArray(validationErrors)
        ) {
          const fieldErrors: string[] = [];

          Object.keys(validationErrors).forEach((field) => {
            const fieldError = validationErrors[field];
            if (Array.isArray(fieldError)) {
              fieldErrors.push(`• ${field}: ${fieldError.join(", ")}`);
            } else if (typeof fieldError === "string") {
              fieldErrors.push(`• ${field}: ${fieldError}`);
            } else if (typeof fieldError === "object" && fieldError.message) {
              fieldErrors.push(`• ${field}: ${fieldError.message}`);
            }
          });

          if (fieldErrors.length > 0) {
            errorMessage = `Errores de validación:\n\n${fieldErrors.join("\n")}`;
          }
        } else if (Array.isArray(validationErrors)) {
          // Si es un array de errores
          errorMessage = `Errores de validación:\n\n${validationErrors.map((e) => `• ${e}`).join("\n")}`;
        } else if (typeof validationErrors === "string") {
          errorMessage = validationErrors;
        }
      }

      // Si todavía no hay mensaje, usar uno por defecto
      if (!errorMessage) {
        errorMessage = `Error en la petición (${response.status}): ${response.statusText || "Error desconocido"}`;
      }

      // Crear un error con información adicional
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error("Error en petición SIF:", error);

    // Si es un error de CORS, re-lanzar con el mensaje mejorado
    if (isCorsError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido en la petición al SIF");
  }
};

/**
 * Valida si una CURP está registrada en el sistema de tandas
 */
export const precheckCurp = async (
  curp: string
): Promise<CurpPrecheckResponse> => {
  return sifRequest<CurpPrecheckResponse>("/precheck_curp/", {
    method: "POST",
    body: JSON.stringify({ curp }),
  });
};

/**
 * Valida una CURP con RENAPO y CURP Tabasco
 */
export const validateRenapo = async (
  curp: string
): Promise<RenapoValidationResponse> => {
  return sifRequest<RenapoValidationResponse>("/validate_renapo/", {
    method: "POST",
    body: JSON.stringify({ curp }),
  });
};

/**
 * Valida si un número de teléfono está registrado
 */
export const precheckTelefono = async (
  telefono: string
): Promise<TelefonoPrecheckResponse> => {
  return sifRequest<TelefonoPrecheckResponse>("/precheck_telefono/", {
    method: "POST",
    body: JSON.stringify({ num_celular1: telefono }),
  });
};

/**
 * Obtiene la lista de solicitudes de Tanda2 registradas
 */
export const listTanda2Requests = async (): Promise<
  Tanda2RequestListItem[]
> => {
  try {
    const response = await sifRequest<{
      success?: boolean;
      data?: {
        count?: number;
        tandas2?: Tanda2RequestListItem[];
        results?: Tanda2RequestListItem[];
      };
      results?: Tanda2RequestListItem[];
    }>("/list_tanda2_requests/", {
      method: "GET",
    });

    // Manejar diferentes formatos de respuesta
    // Si es un array directamente, devolverlo
    if (Array.isArray(response)) {
      return response;
    }

    // Si tiene la estructura { success: true, data: { tandas2: [] } }
    if (response && typeof response === "object") {
      if (response.data) {
        // Intentar obtener tandas2 primero (estructura nueva)
        if (Array.isArray(response.data.tandas2)) {
          console.log(
            "📋 Solicitudes obtenidas:",
            response.data.tandas2.length,
            "registros"
          );
          return response.data.tandas2;
        }
        // Si no, intentar results o data directamente como array
        if (Array.isArray(response.data.results)) {
          return response.data.results;
        }
        if (Array.isArray(response.data as any)) {
          return response.data as Tanda2RequestListItem[];
        }
      }

      // Si tiene results en el nivel raíz
      if (Array.isArray((response as any).results)) {
        return (response as any).results;
      }
    }

    return [];
  } catch (error) {
    console.error("Error obteniendo lista de solicitudes:", error);
    return [];
  }
};

/**
 * Obtiene las localidades de un municipio específico
 */
export const getLocalidades = async (
  municipioId: number
): Promise<Localidad[]> => {
  try {
    const headers = await getAuthHeaders();
    const url = `${SIF_ADMIN_BASE_URL}/get_localidades/?municipio_id=${municipioId}`;

    const response = await sifFetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.detail ||
          `Error al obtener localidades: ${response.status}`
      );
    }

    const data = await response.json();

    // Manejar diferentes formatos de respuesta
    if (Array.isArray(data)) {
      return data;
    }
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error: unknown) {
    console.error("Error obteniendo localidades:", error);

    // Si es un error de CORS, re-lanzar con el mensaje mejorado
    if (isCorsError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al obtener localidades");
  }
};

/**
 * Guarda la solicitud en Appwrite
 */
const saveToAppwrite = async (
  data: EconomiaSocialFormData,
  sifResponse: any
): Promise<any> => {
  try {
    const databases = getAppwriteDatabases();
    const account = getAppwriteAccount();
    const user = await account.get().catch(() => null);
    const userId = user?.$id || "anonymous";

    const documentData = {
      // Datos del solicitante
      nombre: data.nombre,
      apellido1: data.apellido1,
      apellido2: data.apellido2 || null,
      fecha_nacimiento: data.fecha_nacimiento,
      entidad_nacimiento: data.entidad_nacimiento,
      estado_civil: data.estado_civil,
      curp_txt: data.curp_txt,
      correo: data.correo,

      // Dirección
      municipio: data.municipio,
      localidad: data.localidad,
      asentammiento_tipo: data.asentammiento_tipo,
      asentammiento_nombre: data.asentammiento_nombre,
      vialidad_tipo: data.vialidad_tipo,
      vialidad_nombre: data.vialidad_nombre,
      num_celular1: data.num_celular1,
      num_celular2: data.num_celular2 || null,
      codigo_postal: data.codigo_postal,
      numero_ext: data.numero_ext,
      numero_int: data.numero_int || null,
      comprobante_domicilio_choices: data.comprobante_domicilio_choices || null,

      // Información social
      fuente_ingreso: data.fuente_ingreso,
      rfc_boolean: data.rfc_boolean,
      servicio_electricidad: data.servicio_electricidad,
      servicio_agua: data.servicio_agua,
      servicio_drenaje: data.servicio_drenaje,
      piso: data.piso,
      grupo_indigena: data.grupo_indigena || null,
      lengua_indigena: data.lengua_indigena || null,
      lenguas_txt: data.lenguas_txt || null,
      violencia_bool: data.violencia_bool || false,
      violencia: data.violencia || null,

      // Datos del emprendimiento
      monto: data.monto,
      negocio_ubicacion: data.negocio_ubicacion,
      negocio_antiguedad: data.negocio_antiguedad || null,
      negocio_ganancia: data.negocio_ganancia || null,
      negocio_giro: data.negocio_giro || null,
      beneficio_tanda: data.beneficio_tanda,
      destino_recurso: data.destino_recurso || null,
      negocio_participacion: data.negocio_participacion,
      negocio_cooperativa: data.negocio_cooperativa,
      negocio_marca: data.negocio_marca,
      negocio_marca_registrada: data.negocio_marca_registrada,
      negocio_descripcion: data.negocio_descripcion || null,

      // Otros
      comentarios: data.comentarios || null,
      capturista: data.capturista || null,
      folio: sifResponse?.folio || null,
      sif_id: sifResponse?.id || null,

      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const document = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.ECONOMIA_SOCIAL,
      ID.unique(),
      documentData
    );

    return document;
  } catch (error: any) {
    console.error("Error guardando en Appwrite:", error);
    // No lanzar error, solo loguear ya que el guardado principal es en el SIF
    return null;
  }
};

/**
 * Crea una nueva solicitud de Tanda2
 * Guarda tanto en Appwrite como en el endpoint del SIF
 */
export const createTanda2Request = async (
  data: EconomiaSocialFormData
): Promise<any> => {
  // Preparar datos para el SIF
  const sifPayload: any = {
    nombre: data.nombre,
    apellido1: data.apellido1,
    ...(data.apellido2 && { apellido2: data.apellido2 }),
    fecha_nacimiento: convertDateToYYYYMMDD(data.fecha_nacimiento),
    entidad_nacimiento: data.entidad_nacimiento,
    estado_civil: data.estado_civil,
    curp_txt: data.curp_txt,
    referencia: data.curp_txt, // Campo referencia almacena la CURP
    correo: data.correo,

    municipio: data.municipio,
    localidad: data.localidad,
    asentammiento_tipo: data.asentammiento_tipo,
    asentammiento_nombre: data.asentammiento_nombre,
    vialidad_tipo: data.vialidad_tipo,
    vialidad_nombre: data.vialidad_nombre,
    num_celular1: data.num_celular1,
    ...(data.num_celular2 && { num_celular2: data.num_celular2 }),
    codigo_postal: data.codigo_postal,
    numero_ext: data.numero_ext,
    ...(data.numero_int && { numero_int: data.numero_int }),
    ...(data.comprobante_domicilio_choices && {
      comprobante_domicilio_choices: data.comprobante_domicilio_choices,
    }),

    fuente_ingreso: data.fuente_ingreso,
    rfc_boolean: data.rfc_boolean,
    servicio_electricidad: data.servicio_electricidad,
    servicio_agua: data.servicio_agua,
    servicio_drenaje: data.servicio_drenaje,
    piso: data.piso,
    ...(data.grupo_indigena && { grupo_indigena: data.grupo_indigena }),
    ...(data.lengua_indigena && { lengua_indigena: data.lengua_indigena }),
    ...(data.lenguas_txt && { lenguas_txt: data.lenguas_txt }),
    ...(data.violencia_bool !== undefined && {
      violencia_bool: data.violencia_bool,
    }),
    ...(data.violencia && { violencia: data.violencia }),

    monto: data.monto,
    negocio_ubicacion: data.negocio_ubicacion,
    ...(data.negocio_antiguedad && {
      negocio_antiguedad: data.negocio_antiguedad,
    }),
    ...(data.negocio_ganancia && { negocio_ganancia: data.negocio_ganancia }),
    ...(data.negocio_giro && { negocio_giro: data.negocio_giro }),
    beneficio_tanda: data.beneficio_tanda,
    ...(data.destino_recurso && { destino_recurso: data.destino_recurso }),
    negocio_participacion: data.negocio_participacion,
    negocio_cooperativa: data.negocio_cooperativa,
    negocio_marca: data.negocio_marca,
    negocio_marca_registrada: data.negocio_marca_registrada,
    ...(data.negocio_descripcion && {
      negocio_descripcion: data.negocio_descripcion,
    }),

    ...(data.comentarios && { comentarios: data.comentarios }),
    ...(data.capturista && { capturista: data.capturista }),
    ...(data.folio && { folio: data.folio }),
  };

  // Guardar en el endpoint del SIF (prioridad)
  let sifResponse: any;
  try {
    sifResponse = await sifRequest<any>("/", {
      method: "POST",
      body: JSON.stringify(sifPayload),
    });
  } catch (error: any) {
    console.error("❌ Error guardando solicitud en SIF:", error);
    console.error("📋 Datos completos del error:", {
      message: error?.message,
      status: error?.status,
      data: error?.data,
      stack: error?.stack,
    });

    // Si el error ya tiene un mensaje descriptivo y detallado, usarlo directamente
    if (error?.message && error.message.includes("Errores de validación")) {
      throw error;
    }

    // Extraer información más detallada del error
    let errorMessage =
      error?.message || "Error desconocido al guardar la solicitud";

    // Si hay datos del error, intentar extraer más información
    if (error?.data) {
      const errorData = error.data;

      // Si hay errores de validación específicos
      if (errorData.errors || errorData.error) {
        const validationErrors = errorData.errors || errorData.error;

        if (
          typeof validationErrors === "object" &&
          !Array.isArray(validationErrors)
        ) {
          const fieldErrors: string[] = [];

          Object.keys(validationErrors).forEach((field) => {
            const fieldError = validationErrors[field];
            if (Array.isArray(fieldError)) {
              fieldErrors.push(`• ${field}: ${fieldError.join(", ")}`);
            } else if (typeof fieldError === "string") {
              fieldErrors.push(`• ${field}: ${fieldError}`);
            }
          });

          if (fieldErrors.length > 0) {
            errorMessage = `Errores de validación:\n\n${fieldErrors.join("\n")}`;

            // Si hay un mensaje general, agregarlo al inicio
            if (
              errorData.message &&
              !errorMessage.includes(errorData.message)
            ) {
              errorMessage = `${errorData.message}\n\n${errorMessage}`;
            }
          }
        }
      } else if (errorData.message) {
        // Si solo hay un mensaje general pero no errores de campo
        errorMessage = errorData.message;
      }
    }

    const detailedError = new Error(errorMessage);
    (detailedError as any).data = error?.data;
    (detailedError as any).status = error?.status;
    throw detailedError;
  }

  // Guardar también en Appwrite (no crítico si falla)
  try {
    await saveToAppwrite(data, sifResponse);
  } catch (error) {
    console.error("Error guardando backup en Appwrite:", error);
    // No lanzar error ya que el guardado principal fue exitoso
  }

  return sifResponse;
};

export const economiaSocialService = {
  precheckCurp,
  validateRenapo,
  precheckTelefono,
  listTanda2Requests,
  getLocalidades,
  createTanda2Request,
};
