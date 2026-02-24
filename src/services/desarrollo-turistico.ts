import { DesarrolloTuristicoFormData } from "@/src/forms/schemas/form";
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
  const fileName = `desarrollo-turistico-${Date.now()}-${index}.jpg`;

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
  fotografias: DesarrolloTuristicoFormData["fotografias"]
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
  data: DesarrolloTuristicoFormData,
  userId: string,
  fotografias: string[],
  userName: string,
  userEmail: string
) => {
  const timestamp = new Date().toISOString();

  return {
    // Sección I: Detección ciudadana y comunitaria
    zonaTuristas: data.zonaTuristas,
    visitantesRecientes: data.visitantesRecientes,
    organizacionesInteresadas: data.organizacionesInteresadas,
    elementosInteres: data.elementosInteres || [],
    otrosElementos: data.otrosElementos || null,

    // Sección II: Diagnóstico técnico del entorno
    infraestructuraAccesos: data.infraestructuraAccesos || [],
    infraestructuraServicios: data.infraestructuraServicios || [],
    infraestructuraAlojamiento: data.infraestructuraAlojamiento || [],
    infraestructuraRecreativas: data.infraestructuraRecreativas || [],
    infraestructuraComunitarios: data.infraestructuraComunitarios || [],
    nivelOrganizacion: data.nivelOrganizacion,
    rutasSenderos: data.rutasSenderos,
    actoresInstitucionales: data.actoresInstitucionales,
    principalObstaculo: data.principalObstaculo,

    // Sección III: Variables técnicas específicas
    potencialDesarrollo: data.potencialDesarrollo,
    programaPiloto: data.programaPiloto,
    vinculacionFinanciamiento: data.vinculacionFinanciamiento,
    geolocalizacion: data.geolocalizacion || null,
    fotografias: fotografias,
    observacionesEstrategicas: data.observacionesEstrategicas,

    // Metadatos
    userId,
    registradoPor: userName,
    registradoPorEmail: userEmail,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const create = async (data: DesarrolloTuristicoFormData): Promise<any> => {
  try {
    const databases = getAppwriteDatabases();
    const { userId, userName, userEmail } = await getCurrentUser();
    const fotografias = await uploadFotosToStorage(data.fotografias);
    const documentData = mapFormDataToDocument(
      data,
      userId,
      fotografias,
      userName,
      userEmail
    );

    const document = await databases.createDocument(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTIONS.DESARROLLO_TURISTICO,
      ID.unique(),
      documentData
    );

    return document;
  } catch (error: any) {
    throw new Error(
      error?.message || "Error al crear el documento de Desarrollo Turístico"
    );
  }
};

export const desarrolloTuristicoService = {
  create,
};



