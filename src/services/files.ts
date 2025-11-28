import { Platform } from "react-native";
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
      const storage = getAppwriteStorage();
      const bucketId = this.getBucketId(bucketType);

      // Generar un ID único para el archivo
      const fileId = ID.unique();

      // Determinar el nombre del archivo
      let fileName: string;
      let fileData: any;

      if (Platform.OS === "web" && file instanceof File) {
        fileName = file.name;
        fileData = file;
      } else {
        const fileObj = file as { uri: string; name: string; type: string };
        fileName = fileObj.name || `${fileId}.jpg`;
        fileData = {
          uri: fileObj.uri,
          name: fileName,
          type: fileObj.type || "image/jpeg",
        };
      }

      // Subir archivo a Appwrite Storage
      const response = await storage.createFile(bucketId, fileId, fileData);

      // Obtener la URL del archivo usando getFileView para obtener la URL pública
      // Nota: getFileView retorna una Promise<ArrayBuffer>, pero necesitamos la URL
      // Construimos la URL manualmente basándonos en el endpoint y el ID del archivo
      const client = getAppwriteClient();
      const endpoint = (client as any).endpoint || "";
      const projectId = (client as any).project || "";
      const fileUrl = `${endpoint}/storage/buckets/${bucketId}/files/${response.$id}/view?project=${projectId}`;

      return {
        filename: response.$id,
        originalname: fileName,
        mimetype: response.mimeType,
        size: response.sizeOriginal,
        url: fileUrl,
      };
    } catch (error: any) {
      console.error("Error en uploadImage:", error);
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
      console.error("Error en uploadMultipleImages:", error);
      throw error;
    }
  }

  getImageUrl(
    fileId: string,
    bucketType: "images" | "ine_images" = "images"
  ): string {
    const client = getAppwriteClient();
    const bucketId = this.getBucketId(bucketType);
    const endpoint = (client as any).endpoint || "";
    const projectId = (client as any).project || "";
    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
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
      console.error("Error en deleteImage:", error);
      throw new Error(error.message || "Error al eliminar la imagen");
    }
  }
}

export const filesService = new FilesService();
