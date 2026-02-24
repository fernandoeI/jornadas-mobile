import { ImpulsoInversionesFormData } from "@/src/forms/schemas/ImpulsoInversionesForm";
import { Platform } from "react-native";
import { ID } from "react-native-appwrite";
import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
} from "./appwrite";
import { filesService } from "./files";

const getCurrentUser = async () => {
  const account = getAppwriteAccount();
  const user = await account.get().catch(() => null);
  if (!user || !user.$id) {
    return {
      userId: "anonymous",
      userName: "",
      userEmail: "",
    };
  }
  return {
    userId: user.$id,
    userName: user.name || "",
    userEmail: user.email || "",
  };
};

const buildFileFromFoto = async (
  foto: { uri: string; descripcion: string },
  index: number
) => {
  const fallbackType = "image/jpeg";
  const fileName = `impulso-inversiones-${Date.now()}-${index}.jpg`;

  if (!foto || !foto.uri || foto.uri.trim() === "") {
    throw new Error(`La fotografía #${index + 1} no contiene URI válida`);
  }

  if (Platform.OS === "web") {
    try {
      const response = await fetch(foto.uri);
      if (!response.ok) {
        throw new Error(
          `Error al obtener la imagen #${index + 1}: ${response.status} ${response.statusText}`
        );
      }
      const blob = await response.blob();
      const type = blob.type || fallbackType;
      return new File([blob], fileName, { type });
    } catch (fetchError: any) {
      throw new Error(
        `Error al procesar la fotografía #${index + 1}: ${fetchError?.message || "Error desconocido"}`
      );
    }
  }

  return {
    uri: foto.uri,
    name: fileName,
    type: fallbackType,
  };
};

const uploadFotosToStorage = async (
  fotografias: ImpulsoInversionesFormData["fotografiasSitio"]
): Promise<string[]> => {
  if (!fotografias || fotografias.length === 0) {
    return [];
  }

  const fotosInvalidas = fotografias
    .map((foto, index) =>
      !foto || !foto.uri || foto.uri.trim() === "" ? index + 1 : null
    )
    .filter((index) => index !== null);

  if (fotosInvalidas.length > 0) {
    throw new Error(
      `Las siguientes fotografías no tienen URI válida: ${fotosInvalidas.join(", ")}`
    );
  }

  const uploads = await Promise.all(
    fotografias.map(async (foto, index) => {
      try {
        const fileInput = await buildFileFromFoto(foto, index);
        const uploaded = await filesService.uploadImage(fileInput, "images");
        return JSON.stringify({
          fileId: uploaded.filename,
          url: uploaded.url,
          descripcion: foto.descripcion || "",
          originalname: uploaded.originalname,
          mimetype: uploaded.mimetype,
          size: uploaded.size,
        });
      } catch (error: any) {
        const errorMessage = error?.message || "Error desconocido";
        throw new Error(
          `No se pudo subir la fotografía #${index + 1}: ${errorMessage}`
        );
      }
    })
  );

  return uploads;
};

const mapFormDataToDocument = (
  data: ImpulsoInversionesFormData,
  userId: string,
  fotografias: string[],
  userName: string,
  userEmail: string
) => {
  const timestamp = new Date().toISOString();

  return {
    // Sección I: Detección de inversión local
    existeEmpresaAltoImpacto: data.existeEmpresaAltoImpacto,
    nombreRazonSocial: data.nombreRazonSocial,
    giro: data.giro,
    otroGiro: data.otroGiro || null,
    nivelEmpleo: data.nivelEmpleo,

    // Sección II: Diagnóstico de entorno productivo
    necesidadesRegulatorias: data.necesidadesRegulatorias || [],
    otrasNecesidades: data.otrasNecesidades || null,
    oportunidadesInversion: data.oportunidadesInversion || [],
    otrasOportunidades: data.otrasOportunidades || null,
    barrerasNormativas: data.barrerasNormativas,
    prediosPotencialInversion: data.prediosPotencialInversion,
    geolocalizacionInversion: data.geolocalizacionInversion || null,
    fotografiasSitio: fotografias,

    // Sección III: Evaluación técnica del servidor público
    oportunidadVinculacionInstitucional: data.oportunidadVinculacionInstitucional || [],
    otrasVinculaciones: data.otrasVinculaciones || null,
    viableAgendarSeguimiento: data.viableAgendarSeguimiento,
    requiereIntervencionJuridica: data.requiereIntervencionJuridica,
    observacionesCompetitividad: data.observacionesCompetitividad,

    // Metadatos
    userId,
    registradoPor: userName,
    registradoPorEmail: userEmail,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const create = async (data: ImpulsoInversionesFormData): Promise<any> => {
  try {
    const databases = getAppwriteDatabases();
    const { userId, userName, userEmail } = await getCurrentUser();
    const fotografias = await uploadFotosToStorage(data.fotografiasSitio);
    const documentData = mapFormDataToDocument(
      data,
      userId,
      fotografias,
      userName,
      userEmail
    );

    const document = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.IMPULSO_INVERSIONES,
      ID.unique(),
      documentData
    );

    return document;
  } catch (error: any) {
    throw new Error(
      error?.message || "Error al crear el documento de Impulso de Inversiones"
    );
  }
};

export const impulsoInversionesService = {
  create,
};



