import { ApoyoNegocioForm } from "@/src/forms/schemas/ApoyoNegocioForm";
import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
  ID,
} from "./appwrite";

class ApoyoNegocioService {
  private async getCurrentUserId(): Promise<string> {
    const account = getAppwriteAccount();
    const user = await account.get();
    return user.$id;
  }

  async create(data: ApoyoNegocioForm): Promise<any> {
    try {
      const databases = getAppwriteDatabases();
      const userId = await this.getCurrentUserId();

      // Crear documento en la colección de apoyo_negocio
      const document = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.APOYO_NEGOCIO,
        ID.unique(),
        {
          ...data,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );

      return document;
    } catch (error: any) {
      console.error("Error en create:", error);
      throw new Error(error.message || "Error al crear el registro");
    }
  }

  async getMyApoyoNegocio(): Promise<any[]> {
    try {
      const databases = getAppwriteDatabases();
      const userId = await this.getCurrentUserId();

      // Consultar registros del usuario actual
      // Nota: En react-native-appwrite, listDocuments puede aceptar queries como array opcional
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.APOYO_NEGOCIO,
        [`equal("userId", "${userId}")`] // Filtrar por usuario - formato de query de Appwrite
      );

      return response.documents;
    } catch (error: any) {
      console.error("Error en getMyApoyoNegocio:", error);
      throw new Error(error.message || "Error al obtener los registros");
    }
  }

  async getApoyoNegocio(id: string): Promise<any> {
    try {
      const databases = getAppwriteDatabases();

      const document = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.APOYO_NEGOCIO,
        id
      );

      return document;
    } catch (error: any) {
      console.error("Error en getApoyoNegocio:", error);
      throw new Error(error.message || "Error al obtener el registro");
    }
  }
}

export const apoyoNegocioService = new ApoyoNegocioService();
