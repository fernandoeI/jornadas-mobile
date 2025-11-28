import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
  ID,
} from "./appwrite";

export interface DesarrolloComercialFormData {
  nombreNegocio: string;
  tipoNegocio: string;
  direccion: string;
  telefono: string;
  email: string;
  rfc: string;
  antiguedad: string;
  numeroEmpleados: string;
  facturacionMensual: string;
  necesidades: string;
  tipoApoyo: string;
  montoSolicitado: string;
}

class DesarrolloComercialService {
  private async getCurrentUserId(): Promise<string> {
    const account = getAppwriteAccount();
    const user = await account.get();
    return user.$id;
  }

  async create(data: DesarrolloComercialFormData): Promise<any> {
    try {
      const databases = getAppwriteDatabases();
      const userId = await this.getCurrentUserId();

      // Crear documento en la colección de desarrollo_comercial
      const document = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.DESARROLLO_COMERCIAL,
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

  async getMyDesarrolloComercial(): Promise<any[]> {
    try {
      const databases = getAppwriteDatabases();
      const userId = await this.getCurrentUserId();

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.DESARROLLO_COMERCIAL,
        [`equal("userId", "${userId}")`]
      );

      return response.documents;
    } catch (error: any) {
      console.error("Error en getMyDesarrolloComercial:", error);
      throw new Error(error.message || "Error al obtener los registros");
    }
  }

  async getDesarrolloComercial(id: string): Promise<any> {
    try {
      const databases = getAppwriteDatabases();

      const document = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.DESARROLLO_COMERCIAL,
        id
      );

      return document;
    } catch (error: any) {
      console.error("Error en getDesarrolloComercial:", error);
      throw new Error(error.message || "Error al obtener el registro");
    }
  }
}

export const desarrolloComercialService = new DesarrolloComercialService();
