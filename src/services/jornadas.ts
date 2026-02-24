import { JornadaResponse } from "@/src/utils/api";
import { Platform } from "react-native";
import { Query } from "react-native-appwrite";
import {
  APPWRITE_CONFIG,
  getAppwriteAccount,
  getAppwriteDatabases,
  ID,
} from "./appwrite";
import { filesService } from "./files";

class JornadasService {
  private async getCurrentUserId(): Promise<string> {
    try {
      const account = getAppwriteAccount();
      const user = await account.get();

      if (!user || !user.$id) {
        throw new Error("No se pudo obtener el usuario actual");
      }

      return user.$id;
    } catch (error: any) {
      throw new Error(error.message || "Error al obtener el ID del usuario");
    }
  }

  // Construir el archivo del INE exactamente como en promocion-turistica
  private async buildFileFromINE(
    ineFile: File | { uri: string; name: string; type: string }
  ): Promise<File | { uri: string; name: string; type: string }> {
    const fallbackType = "image/jpeg";
    const fileName = `ine-${Date.now()}.jpg`;

    if (!ineFile) {
      throw new Error("El archivo INE no es válido");
    }

    if (Platform.OS === "web") {
      if (ineFile instanceof File) {
        return ineFile;
      }
      // En web con URI, convertir a File
      const fileObj = ineFile as { uri: string; name: string; type: string };
      if (!fileObj.uri) {
        throw new Error("La imagen INE no contiene URI válida");
      }
      const response = await fetch(fileObj.uri);
      const blob = await response.blob();
      const type = blob.type || fallbackType;
      return new File([blob], fileName, { type });
    }

    // En móvil, retornar el objeto con URI directamente (igual que promocion-turistica)
    const fileObj = ineFile as { uri: string; name: string; type: string };
    if (!fileObj.uri) {
      throw new Error("La imagen INE no contiene URI válida");
    }
    return {
      uri: fileObj.uri,
      name: fileName,
      type: fileObj.type || fallbackType,
    };
  }

  async createWithINE(
    jornadaData: any,
    ineImageFile: File | { uri: string; name: string; type: string }
  ): Promise<JornadaResponse> {
    try {
      // Construir el archivo del INE exactamente como en promocion-turistica
      const fileInput = await this.buildFileFromINE(ineImageFile);

      // Subir la imagen del INE a Appwrite Storage (usando bucket de images)
      const imageResult = await filesService.uploadImage(fileInput, "images");
      const ineImageUrl = imageResult.url;

      // Luego crear la jornada en Appwrite Database
      const jornadaWithImage = {
        ...jornadaData,
        ineImageUrl,
        ineImageFileId: imageResult.filename, // Guardar el ID del archivo
      };

      return await this.create(jornadaWithImage);
    } catch (error) {
      throw error;
    }
  }

  async create(jornadaData: any): Promise<JornadaResponse> {
    try {
      const databases = getAppwriteDatabases();
      const account = getAppwriteAccount();
      const user = await account.get();

      if (!user || !user.$id) {
        throw new Error("No se pudo obtener el usuario actual");
      }

      const userId = user.$id;

      const databaseId = APPWRITE_CONFIG.DATABASE_ID;
      const collectionId = APPWRITE_CONFIG.COLLECTIONS.JORNADAS;
      const documentId = ID.unique();

      // Verificar que los IDs no estén vacíos
      if (!databaseId || !collectionId) {
        throw new Error(
          `Configuración incorrecta: databaseId=${databaseId}, collectionId=${collectionId}`
        );
      }

      // Intentar crear documento exactamente como en promocion-turistica
      // Usar el mismo formato que funciona en otros servicios
      const timestamp = new Date().toISOString();

      const documentData = {
        ...jornadaData,
        userId, // Asociar con el usuario actual
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // Crear documento en la colección de jornadas
      const document = await databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        documentData
      );

      // Convertir el documento de Appwrite al formato JornadaResponse
      return this.mapDocumentToJornada(document);
    } catch (error: any) {
      // Mensaje de error más descriptivo
      if (error?.message?.includes("could not be found")) {
        throw new Error(
          `La colección '${APPWRITE_CONFIG.COLLECTIONS.JORNADAS}' no se encontró. Verifica que el ID de la colección sea correcto en Appwrite Console.`
        );
      }

      throw new Error(error?.message || "Error al crear la jornada");
    }
  }

  async getMyJornadas(): Promise<JornadaResponse[]> {
    try {
      const databases = getAppwriteDatabases();
      const userId = await this.getCurrentUserId();

      // Consultar jornadas del usuario actual usando Query
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.JORNADAS,
        [Query.equal("userId", userId)]
      );

      // Convertir documentos a formato JornadaResponse
      return response.documents.map((doc) => this.mapDocumentToJornada(doc));
    } catch (error: any) {
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
      throw new Error(error.message || "Error al obtener la jornada");
    }
  }

  /**
   * Obtiene las jornadas del día actual
   * @param filterByUserId - Si es true, filtra solo las jornadas del usuario actual. Si es false, obtiene todas las jornadas del día.
   * @returns Array de jornadas del día actual
   */
  async getJornadasDelDia(
    filterByUserId: boolean = true
  ): Promise<JornadaResponse[]> {
    try {
      const databases = getAppwriteDatabases();

      // Obtener fecha de hoy en formato ISO
      const hoy = new Date();
      const inicioDia = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        0,
        0,
        0,
        0
      );
      const finDia = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        23,
        59,
        59,
        999
      );

      const inicioDiaISO = inicioDia.toISOString();
      const finDiaISO = finDia.toISOString();

      console.log("🔍 Buscando jornadas del día:", {
        inicioDiaISO,
        finDiaISO,
        filterByUserId,
      });

      // Construir queries usando Query de Appwrite
      // Intentar con ambos campos: createdAt (manual) y $createdAt (automático de Appwrite)
      const queries: any[] = [
        Query.greaterThanEqual("createdAt", inicioDiaISO),
        Query.lessThanEqual("createdAt", finDiaISO),
      ];

      // Si se debe filtrar por usuario, agregar el filtro
      if (filterByUserId) {
        const userId = await this.getCurrentUserId();
        queries.push(Query.equal("userId", userId));
        console.log("🔍 Filtrando por userId:", userId);
      }

      console.log("🔍 Queries construidas:", queries.length);

      // Consultar jornadas del día
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.JORNADAS,
        queries
      );

      console.log("🔍 Registros encontrados:", response.documents.length);
      if (response.documents.length > 0) {
        console.log("🔍 Primer documento:", {
          id: response.documents[0].$id,
          createdAt: response.documents[0].createdAt,
          $createdAt: response.documents[0].$createdAt,
          userId: response.documents[0].userId,
        });
      }

      // Convertir documentos a formato JornadaResponse
      return response.documents.map((doc) => this.mapDocumentToJornada(doc));
    } catch (error: any) {
      console.error("❌ Error al obtener jornadas del día:", error);
      throw new Error(error.message || "Error al obtener las jornadas del día");
    }
  }

  private mapDocumentToJornada(document: any): JornadaResponse {
    if (!document || !document.$id) {
      throw new Error("Documento inválido: falta el ID");
    }

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
