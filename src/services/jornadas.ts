import { JornadaResponse } from "@/src/utils/api";
import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
  ID,
} from "./appwrite";
import { filesService } from "./files";

class JornadasService {
  private async getCurrentUserId(): Promise<string> {
    const account = getAppwriteAccount();
    const user = await account.get();
    return user.$id;
  }

  async createWithINE(
    jornadaData: any,
    ineImageFile: File | { uri: string; name: string; type: string }
  ): Promise<JornadaResponse> {
    try {
      // Primero subir la imagen del INE a Appwrite Storage
      const imageResult = await filesService.uploadImage(
        ineImageFile,
        "ine_images"
      );
      const ineImageUrl = imageResult.url;

      // Luego crear la jornada en Appwrite Database
      const jornadaWithImage = {
        ...jornadaData,
        ineImageUrl,
        ineImageFileId: imageResult.filename, // Guardar el ID del archivo
      };

      return await this.create(jornadaWithImage);
    } catch (error) {
      console.error("Error en createWithINE:", error);
      throw error;
    }
  }

  async create(jornadaData: any): Promise<JornadaResponse> {
    try {
      const databases = getAppwriteDatabases();
      const userId = await this.getCurrentUserId();

      // Crear documento en la colección de jornadas
      const document = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.JORNADAS,
        ID.unique(),
        {
          ...jornadaData,
          userId, // Asociar con el usuario actual
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      // Convertir el documento de Appwrite al formato JornadaResponse
      return this.mapDocumentToJornada(document);
    } catch (error: any) {
      console.error("Error en create:", error);
      throw new Error(error.message || "Error al crear la jornada");
    }
  }

  async getMyJornadas(): Promise<JornadaResponse[]> {
    try {
      const databases = getAppwriteDatabases();
      const userId = await this.getCurrentUserId();

      // Consultar jornadas del usuario actual
      // Nota: En react-native-appwrite, listDocuments puede aceptar queries como array opcional
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.JORNADAS,
        [`equal("userId", "${userId}")`] // Filtrar por usuario - formato de query de Appwrite
      );

      // Convertir documentos a formato JornadaResponse
      return response.documents.map((doc) => this.mapDocumentToJornada(doc));
    } catch (error: any) {
      console.error("Error en getMyJornadas:", error);
      throw new Error(error.message || "Error al obtener las jornadas");
    }
  }

  async getJornada(id: string): Promise<JornadaResponse> {
    try {
      const databases = getAppwriteDatabases();

      const document = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.JORNADAS,
        id
      );

      return this.mapDocumentToJornada(document);
    } catch (error: any) {
      console.error("Error en getJornada:", error);
      throw new Error(error.message || "Error al obtener la jornada");
    }
  }

  private mapDocumentToJornada(document: any): JornadaResponse {
    return {
      id: document.$id,
      nombreSolicitante: document.nombreSolicitante || "",
      primerApellido: document.primerApellido || "",
      segundoApellido: document.segundoApellido,
      curp: document.curp || "",
      direccion: document.direccion || "",
      municipio: document.municipio || "",
      localidad: document.localidad || "",
      telefono: document.telefono || "",
      correo: document.correo,
      ineImageUrl: document.ineImageUrl,
      createdAt: document.createdAt || document.$createdAt,
      updatedAt: document.updatedAt || document.$updatedAt,
    };
  }
}

export const jornadasService = new JornadasService();
