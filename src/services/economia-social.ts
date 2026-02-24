import { convertDateToYYYYMMDD } from "@/src/components/common/dateHelpers";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { isCorsError, sifRequest } from "@/src/utils/sifApi";
import { ID } from "react-native-appwrite";
import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
} from "./appwrite";

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

/**
 * Valida si una CURP está registrada en el sistema de tandas
 * @param token - Token de acceso SIF
 * @param curp - CURP a validar
 */
export const precheckCurp = async (
  token: string,
  curp: string
): Promise<CurpPrecheckResponse> => {
  return sifRequest<CurpPrecheckResponse>(token, "/precheck_curp/", {
    method: "POST",
    body: JSON.stringify({ curp }),
  });
};

/**
 * Valida una CURP con RENAPO y CURP Tabasco
 * @param token - Token de acceso SIF
 * @param curp - CURP a validar
 */
export const validateRenapo = async (
  token: string,
  curp: string
): Promise<RenapoValidationResponse> => {
  return sifRequest<RenapoValidationResponse>(token, "/validate_renapo/", {
    method: "POST",
    body: JSON.stringify({ curp }),
  });
};

/**
 * Valida si un número de teléfono está registrado
 * @param token - Token de acceso SIF
 * @param telefono - Teléfono a validar
 */
export const precheckTelefono = async (
  token: string,
  telefono: string
): Promise<TelefonoPrecheckResponse> => {
  return sifRequest<TelefonoPrecheckResponse>(token, "/precheck_telefono/", {
    method: "POST",
    body: JSON.stringify({ num_celular1: telefono }),
  });
};

/**
 * Obtiene la lista de solicitudes de Tanda2 registradas
 * @param token - Token de acceso SIF
 */
export const listTanda2Requests = async (
  token: string
): Promise<Tanda2RequestListItem[]> => {
  // Validar que el token esté presente
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    throw new Error("Token SIF no válido o vacío");
  }

  try {
    const response = await sifRequest<{
      success?: boolean;
      data?: {
        count?: number;
        tandas2?: Tanda2RequestListItem[];
        results?: Tanda2RequestListItem[];
      };
      results?: Tanda2RequestListItem[];
    }>(token, "/list_tanda2_requests/", {
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
    // Re-lanzar el error para que el hook pueda manejarlo (invalidar token si es 401)
    throw error;
  }
};

/**
 * Obtiene las localidades de un municipio específico
 * @param token - Token de acceso SIF
 * @param municipioId - ID del municipio
 */
export const getLocalidades = async (
  token: string,
  municipioId: number
): Promise<Localidad[]> => {
  try {
    const url = `${SIF_ADMIN_BASE_URL}/get_localidades/?municipio_id=${municipioId}`;
    const response = await sifRequest<
      Localidad[] | { results?: Localidad[]; data?: Localidad[] }
    >(token, url);

    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response)) {
      return response;
    }
    if (response.results && Array.isArray(response.results)) {
      return response.results;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error: unknown) {
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
 * Solo se debe llamar después de que el guardado en SIF haya sido exitoso
 */
const saveToAppwrite = async (
  data: EconomiaSocialFormData,
  sifResponse: any
): Promise<any> => {
  try {
    const databases = getAppwriteDatabases();
    const account = getAppwriteAccount();

    // Verificar conexión con Appwrite obteniendo el usuario
    let user;
    try {
      user = await account.get();
    } catch (accountError: any) {
      // Si no hay sesión activa, continuar con "anonymous"
      // Esto es normal si el usuario no está autenticado
      console.warn(
        "⚠️ No se pudo obtener usuario de Appwrite, usando 'anonymous':",
        accountError?.message
      );
    }
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

    console.log("📝 Intentando guardar en Appwrite:", {
      databaseId: APPWRITE_CONFIG.DATABASE_ID,
      collectionId: APPWRITE_CONFIG.COLLECTIONS.ECONOMIA_SOCIAL,
      documentDataKeys: Object.keys(documentData),
    });

    const document = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.ECONOMIA_SOCIAL,
      ID.unique(),
      documentData
    );

    console.log(
      "✅ Documento guardado exitosamente en Appwrite:",
      document.$id
    );
    return document;
  } catch (error: any) {
    // Log detallado del error
    console.error("❌ Error en saveToAppwrite:", {
      error,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorType: error?.type,
      errorName: error?.name,
      errorResponse: error?.response,
      errorStack: error?.stack,
      // Información de la configuración
      databaseId: APPWRITE_CONFIG.DATABASE_ID,
      collectionId: APPWRITE_CONFIG.COLLECTIONS.ECONOMIA_SOCIAL,
    });

    // Determinar el tipo de error y proporcionar un mensaje más útil
    let errorMessage =
      error?.message || "Error desconocido al guardar en Appwrite";

    if (
      error?.message?.includes("network") ||
      error?.message?.includes("Network") ||
      error?.message?.includes("Failed to fetch")
    ) {
      errorMessage =
        "Error de conexión con Appwrite. Verifica tu conexión a internet y que el servidor de Appwrite esté disponible.";
    } else if (
      error?.message?.includes("could not be found") ||
      error?.code === 404
    ) {
      errorMessage = `La colección '${APPWRITE_CONFIG.COLLECTIONS.ECONOMIA_SOCIAL}' no se encontró. Verifica que el ID de la colección sea correcto en Appwrite Console.`;
    } else if (
      error?.code === 401 ||
      error?.message?.includes("Unauthorized")
    ) {
      errorMessage =
        "Error de autenticación con Appwrite. Por favor, inicia sesión nuevamente.";
    } else if (error?.code === 403 || error?.message?.includes("Forbidden")) {
      errorMessage =
        "No tienes permisos para crear documentos en esta colección. Verifica los permisos en Appwrite Console.";
    }

    const detailedError = new Error(errorMessage);
    (detailedError as any).originalError = error;
    (detailedError as any).code = error?.code;
    (detailedError as any).type = error?.type;
    throw detailedError;
  }
};

/**
 * Crea una nueva solicitud de Tanda2
 * Guarda primero en el endpoint del SIF, y si es exitoso, luego en Appwrite.
 * Si el SIF falla, NO se guardará en Appwrite.
 * @param token - Token de acceso SIF
 * @param data - Datos del formulario
 */
export const createTanda2Request = async (
  token: string,
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
    // Solo enviar grupo_indigena al SIF si no es "ninguna" (el SIF no acepta "ninguna")
    ...(data.grupo_indigena &&
      data.grupo_indigena !== "ninguna" && {
        grupo_indigena: data.grupo_indigena,
      }),
    // Solo enviar lengua_indigena al SIF si no es "no" (el SIF no acepta "no")
    ...(data.lengua_indigena &&
      data.lengua_indigena !== "no" && {
        lengua_indigena: data.lengua_indigena,
      }),
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

  // PASO 1: Guardar primero en el endpoint del SIF
  // Si falla aquí, NO se guardará en Appwrite
  let sifResponse: any;
  try {
    sifResponse = await sifRequest<any>(token, "/", {
      method: "POST",
      body: JSON.stringify(sifPayload),
    });
  } catch (error: any) {
    // Si falla en SIF, lanzar error y NO guardar en Appwrite
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

  // PASO 2: Solo si el guardado en SIF fue exitoso, guardar en Appwrite
  // Si Appwrite falla, lanzar error para que el usuario sepa
  try {
    await saveToAppwrite(data, sifResponse);
  } catch (error: any) {
    console.error("❌ Error guardando en Appwrite después de guardar en SIF:", {
      error,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorType: error?.type,
      errorResponse: error?.response,
      documentData: {
        // Log solo las claves para no exponer datos sensibles
        keys: Object.keys(data),
        sifResponseKeys: sifResponse ? Object.keys(sifResponse) : null,
      },
    });

    // Lanzar error con más detalles para debugging
    const errorMessage =
      error?.message || "Error desconocido al guardar en Appwrite";
    const detailedError = new Error(
      `El registro se guardó exitosamente en el sistema, pero hubo un error al guardar el respaldo: ${errorMessage}`
    );
    (detailedError as any).originalError = error;
    throw detailedError;
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
