import { FeriasFestivalesFormData } from "@/src/forms/schemas/FeriasFestivalesForm";
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
  const fileName = `ferias-festivales-${Date.now()}-${index}.jpg`;

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
  fotografias: FeriasFestivalesFormData["fotografias"]
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
  data: FeriasFestivalesFormData,
  userId: string,
  fotografias: string[],
  userName: string,
  userEmail: string
) => {
  const timestamp = new Date().toISOString();

  return {
    // Sección I: Levantamiento comunitario y cultural
    fiestasFestivales: data.fiestasFestivales,
    nombreEvento: data.nombreEvento,
    fechaRealizacion: data.fechaRealizacion,
    origen: data.origen,
    otroOrigen: data.otroOrigen || null,
    quienOrganiza: data.quienOrganiza,
    otroQuienOrganiza: data.otroQuienOrganiza || null,
    numeroAsistentes: data.numeroAsistentes,
    apoyoInstitucional: data.apoyoInstitucional,
    actividadesRealizadas: data.actividadesRealizadas || [],
    otrasActividades: data.otrasActividades || null,
    fortalecerFestividad: data.fortalecerFestividad,

    // Sección II: Diagnóstico técnico
    impactoEconomico: data.impactoEconomico,
    espaciosPublicos: data.espaciosPublicos,
    accesibilidadVial: data.accesibilidadVial,
    infraestructuraEscenica: data.infraestructuraEscenica,
    potencialCalendarioEstatal: data.potencialCalendarioEstatal,
    vinculacionPatrocinadores: data.vinculacionPatrocinadores,
    geolocalizacion: data.geolocalizacion || null,
    fotografias: fotografias,
    observacionesActores: data.observacionesActores,

    // Metadatos
    userId,
    registradoPor: userName,
    registradoPorEmail: userEmail,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const create = async (data: FeriasFestivalesFormData): Promise<any> => {
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
      APPWRITE_CONFIG.COLLECTIONS.FERIAS_FESTIVALES,
      ID.unique(),
      documentData
    );

    return document;
  } catch (error: any) {
    throw new Error(
      error?.message || "Error al crear el documento de Ferias y Festivales"
    );
  }
};

export const feriasFestivalesService = {
  create,
};



