import { Platform } from "react-native";
import Constants from "expo-constants";
import {
  APPWRITE_CONFIG,
  getAppwriteClient,
  getAppwriteStorage,
  ID,
} from "./appwrite";

// Mantener compatibilidad con el tipo FileUploadResponse existente
export interface FileUploadResponse {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
}

class FilesService {
  private getBucketId(bucketType: "images" | "ine_images" = "images"): string {
    return bucketType === "ine_images"
      ? APPWRITE_CONFIG.STORAGE_BUCKETS.INE_IMAGES
      : APPWRITE_CONFIG.STORAGE_BUCKETS.IMAGES;
  }

  async uploadImage(
    file: File | { uri: string; name: string; type: string },
    bucketType: "images" | "ine_images" = "images"
  ): Promise<FileUploadResponse> {
    try {
      // Verificar autenticación antes de intentar subir
      const { getAppwriteAccount } = await import("./appwrite");
      try {
        const account = getAppwriteAccount();
        await account.get();
      } catch (authError: any) {
        throw new Error(
          `No estás autenticado: ${authError?.message || "Por favor inicia sesión nuevamente"}`
        );
      }

      const storage = getAppwriteStorage();
      const bucketId = this.getBucketId(bucketType);
      const fileId = ID.unique();

      // Preparar el archivo exactamente como en promocion-turistica
      let fileData: File | { uri: string; name: string; type: string };

      if (Platform.OS === "web") {
        if (file instanceof File) {
          fileData = file;
        } else {
          // En web con URI, convertir a File
          const fileObj = file as { uri: string; name: string; type: string };
          if (!fileObj.uri) {
            throw new Error("La imagen no contiene URI válida");
          }
          const response = await fetch(fileObj.uri);
          const blob = await response.blob();
          const type = blob.type || fileObj.type || "image/jpeg";
          const fileName = fileObj.name || `${fileId}.jpg`;
          fileData = new File([blob], fileName, { type });
        }
      } else {
        // En móvil, react-native-appwrite requiere un objeto con uri, name, mimeType y fileSize
        const fileObj = file as { uri: string; name: string; type: string };
        if (!fileObj.uri) {
          throw new Error("La imagen no contiene URI válida");
        }
        const fallbackType = "image/jpeg";
        const fileName = fileObj.name || `${fileId}.jpg`;
        const mimeType = fileObj.type || fallbackType;

        // Intentar obtener el tamaño del archivo
        let fileSize = 0;
        try {
          const response = await fetch(fileObj.uri);
          const blob = await response.blob();
          fileSize = blob.size;
        } catch {
          // Usar 0 si no se puede obtener el tamaño
        }

        // Formato requerido por react-native-appwrite 0.12.0 en iOS/Android
        // Intentar con 'type' y 'size' en lugar de 'mimeType' y 'fileSize'
        fileData = {
          uri: fileObj.uri,
          name: fileName,
          type: mimeType, // Usar 'type' para compatibilidad con versiones antiguas
          size: fileSize, // Usar 'size' para compatibilidad con versiones antiguas
        } as any;
      }

      // Subir archivo a Appwrite Storage
      let response: any;
      try {
        // Llamar a createFile directamente
        // En iOS, asegurarse de que el formato sea correcto
        const fileToUpload =
          Platform.OS === "ios" &&
          typeof fileData === "object" &&
          "uri" in fileData
            ? fileData
            : fileData;

        try {
          response = await storage.createFile(
            bucketId,
            fileId,
            fileToUpload as any
          );
        } catch (createFileError: any) {
          throw createFileError;
        }
      } catch (createError: any) {
        throw new Error(
          `Error al subir el archivo: ${createError?.message || createError?.code || "Error desconocido"}`
        );
      }

      if (!response || !response.$id) {
        // Mensaje de error más descriptivo
        const errorMessage = `Error al subir la imagen: el servidor no retornó una respuesta válida.
        
Posibles causas:
- El bucket '${bucketId}' no existe o no tienes permisos de escritura
- El formato del archivo no es compatible con react-native-appwrite
- Problema de conexión con el servidor de Appwrite

Bucket ID: ${bucketId}
File ID: ${fileId}
Plataforma: ${Platform.OS}
Formato archivo: ${fileData instanceof File ? "File" : "Object con URI"}`;

        throw new Error(errorMessage);
      }

      // Construir la URL del archivo usando el mismo método que getImageUrl
      const endpoint =
        process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
        Constants.expoConfig?.extra?.appwriteEndpoint ||
        process.env.VITE_APPWRITE_PUBLIC_ENDPOINT ||
        "";
      
      const projectId =
        process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
        Constants.expoConfig?.extra?.appwriteProjectId ||
        process.env.VITE_APPWRITE_PROJECT_ID ||
        "";
      
      const fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${response.$id}/view?project=${projectId}`;

      const fileName =
        file instanceof File
          ? file.name
          : (file as { uri: string; name: string; type: string }).name ||
            `${fileId}.jpg`;

      return {
        filename: response.$id,
        originalname: fileName,
        mimetype:
          response.mimeType ||
          (fileData instanceof File
            ? fileData.type
            : (fileData as { uri: string; name: string; type: string }).type) ||
          "image/jpeg",
        size: response.sizeOriginal || 0,
        url: fileUrl,
      };
    } catch (error: any) {
      throw new Error(error.message || "Error al subir la imagen");
    }
  }

  async uploadMultipleImages(
    files: (File | { uri: string; name: string; type: string })[],
    bucketType: "images" | "ine_images" = "images"
  ): Promise<FileUploadResponse[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadImage(file, bucketType)
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      throw error;
    }
  }

  getImageUrl(
    fileId: string,
    bucketType: "images" | "ine_images" = "images"
  ): string {
    const bucketId = this.getBucketId(bucketType);
    
    // Obtener endpoint y projectId de la misma manera que en appwrite.ts
    const endpoint =
      process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
      Constants.expoConfig?.extra?.appwriteEndpoint ||
      process.env.VITE_APPWRITE_PUBLIC_ENDPOINT ||
      "";
    
    const projectId =
      process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
      Constants.expoConfig?.extra?.appwriteProjectId ||
      process.env.VITE_APPWRITE_PROJECT_ID ||
      "";
    
    // Validar que tengamos endpoint y projectId
    if (!endpoint || !projectId) {
      console.error("getImageUrl - Faltan endpoint o projectId:", { endpoint, projectId });
      throw new Error("Appwrite configuration is missing endpoint or projectId");
    }
    
    const url = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    console.log("getImageUrl - URL generada:", url);
    return url;
  }

  async deleteImage(
    fileId: string,
    bucketType: "images" | "ine_images" = "images"
  ): Promise<void> {
    try {
      const storage = getAppwriteStorage();
      const bucketId = this.getBucketId(bucketType);

      await storage.deleteFile(bucketId, fileId);
    } catch (error: any) {
      throw new Error(error.message || "Error al eliminar la imagen");
    }
  }
}

export const filesService = new FilesService();
