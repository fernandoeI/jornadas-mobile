import { PromocionTuristicaFormData } from "@/src/forms/schemas/PromocionTuristicaForm";
import { Platform } from "react-native";
import { ID } from "react-native-appwrite";
import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
} from "./appwrite";
import { filesService } from "./files";

const getCurrentUserId = async (): Promise<string> => {
  const account = getAppwriteAccount();
  const user = await account.get();
  return user.$id;
};

const buildFileFromFoto = async (
  foto: { uri: string; descripcion: string },
  index: number
) => {
  const fallbackType = "image/jpeg";
  const fileName = `promocion-turistica-${Date.now()}-${index}.jpg`;

  if (!foto.uri) {
    throw new Error("La fotografía no contiene URI válida");
  }

  if (Platform.OS === "web") {
    const response = await fetch(foto.uri);
    const blob = await response.blob();
    const type = blob.type || fallbackType;
    return new File([blob], fileName, { type });
  }

  return {
    uri: foto.uri,
    name: fileName,
    type: fallbackType,
  };
};

const uploadFotosToStorage = async (
  fotografias: PromocionTuristicaFormData["fotografias"]
): Promise<string[]> => {
  if (!fotografias || fotografias.length === 0) {
    return [];
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
      } catch (error) {
        console.error("Error subiendo fotografía:", error);
        throw new Error("No se pudo subir una de las fotografías");
      }
    })
  );

  return uploads;
};

const mapFormDataToDocument = (
  data: PromocionTuristicaFormData,
  userId: string,
  fotografias: string[]
) => {
  const timestamp = new Date().toISOString();

  return {
    nombre_atractivo: data.nombreAtractivo,
    tipo_atractivo: data.tipoAtractivo,
    ...(data.otroTipoAtractivo
      ? { otro_tipo_atractivo: data.otroTipoAtractivo }
      : {}),
    quien_promueve: data.quienPromueve,
    ...(data.otroQuienPromueve
      ? { otro_quien_promueve: data.otroQuienPromueve }
      : {}),
    nivel_conocimiento: data.nivelConocimiento,
    tiene_senaletica: data.tieneSenaletica,
    en_plataforma_digital: data.enPlataformaDigital,
    servicios_existentes: data.serviciosExistentes,
    ...(data.otrosServicios ? { otros_servicios: data.otrosServicios } : {}),
    condiciones_acceso: data.condicionesAcceso,
    estado_conservacion: data.estadoConservacion,
    potencial_promocional: data.potencialPromocional,
    observaciones_tecnicas: data.observacionesTecnicas,
    geolocalizacion: data.geolocalizacion,
    fotografias,
    observaciones_adicionales: data.observacionesAdicionales,
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const create = async (data: PromocionTuristicaFormData): Promise<any> => {
  try {
    const databases = getAppwriteDatabases();
    const userId = await getCurrentUserId();
    const fotografias = await uploadFotosToStorage(data.fotografias);
    const documentData = mapFormDataToDocument(data, userId, fotografias);

    const document = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.PROMOCION_TURISTICA,
      ID.unique(),
      documentData
    );

    return document;
  } catch (error: any) {
    console.error("Error creating Promoción Turística document:", error);
    throw new Error(
      error?.message || "Error al crear el documento de Promoción Turística"
    );
  }
};

export const promocionTuristicaService = {
  create,
};
