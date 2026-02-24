import { getAppwriteFunctions } from "./appwrite";
import { sifRequest } from "@/src/utils/sifApi";
import { EconomiaSocialFormData } from "@/src/forms/schemas/EconomiaSocialForm";
import { convertDateToYYYYMMDD } from "@/src/components/common/dateHelpers";

const SIF_FUNCTION_ID = "sif-token";

interface SifTokenResponse {
  access: string;
  expiresIn: number;
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

/**
 * Obtiene el token SIF desde Appwrite Functions
 * @returns El token de acceso (access)
 * @throws Error si no se puede obtener el token
 */
export const getSifToken = async (): Promise<string> => {
  try {
    const functions = getAppwriteFunctions();
    const execution = await functions.createExecution(SIF_FUNCTION_ID);

    if (!execution.responseBody) {
      throw new Error("No se recibió respuesta de la función Appwrite");
    }

    // Parsear la respuesta
    let responseData: SifTokenResponse;
    try {
      responseData =
        typeof execution.responseBody === "string"
          ? JSON.parse(execution.responseBody)
          : execution.responseBody;
    } catch (parseError) {
      throw new Error(
        "Error al parsear la respuesta de la función Appwrite"
      );
    }

    if (!responseData.access) {
      throw new Error("La respuesta no contiene el token de acceso");
    }

    // Limpiar el token (remover espacios en blanco)
    const cleanToken = responseData.access.trim();
    
    if (!cleanToken) {
      throw new Error("El token de acceso está vacío después de limpiarlo");
    }

    return cleanToken;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al obtener el token SIF");
  }
};

/**
 * Crea una nueva solicitud de Tanda2
 * @param token - Token de acceso SIF
 * @param data - Datos del formulario de Economía Social
 * @returns Respuesta del servidor con los datos de la tanda creada
 */
export const createTanda = async (
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

  return sifRequest<any>(token, "/", {
    method: "POST",
    body: JSON.stringify(sifPayload),
  });
};

/**
 * Obtiene la lista de solicitudes de Tanda2 registradas
 * @param token - Token de acceso SIF
 * @returns Lista de solicitudes de Tanda2
 */
export const getTandas = async (
  token: string
): Promise<Tanda2RequestListItem[]> => {
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
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al obtener las tandas");
  }
};

